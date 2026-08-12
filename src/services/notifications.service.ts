/**
 * notifications.service.ts
 * يتعامل مع:
 *  - Firebase Cloud Messaging (FCM) — Push من الـ Backend
 *  - Notifee v9 — إشعارات التذكيرات المحلية
 */

import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import type { Reminder } from '../types';

// ─── Channel IDs ────────────────────────────────────────────────────────────
const CHANNEL_REMINDERS = 'dawai_reminders';
const CHANNEL_ORDERS    = 'dawai_orders';

// ─── إعداد القنوات (يُستدعى مرة واحدة عند بدء التطبيق) ────────────────────
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id         : CHANNEL_REMINDERS,
    name       : 'تذكيرات الدواء',
    importance : AndroidImportance.HIGH,
    vibration  : true,
    sound      : 'default',
  });

  await notifee.createChannel({
    id         : CHANNEL_ORDERS,
    name       : 'تحديثات الطلبات',
    importance : AndroidImportance.HIGH,
    vibration  : true,
    sound      : 'default',
  });
}

// ─── طلب الإذن ──────────────────────────────────────────────────────────────
export async function requestPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled && Platform.OS === 'android') {
    await notifee.requestPermission();
  }

  return enabled;
}

// ─── الحصول على FCM Token ────────────────────────────────────────────────────
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch {
    return null;
  }
}

// ─── معالجة الإشعارات عند فتح التطبيق (Foreground) ─────────────────────────
export function setupForegroundHandler(): () => void {
  // Firebase foreground
  const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
    const { notification, data } = remoteMessage;
    if (!notification) return;

    await notifee.displayNotification({
      title  : notification.title ?? 'دوائي',
      body   : notification.body  ?? '',
      android: {
        channelId : CHANNEL_ORDERS,
        smallIcon : 'ic_notification',
        pressAction: { id: 'default' },
        extras: data as Record<string, string>,
      },
    });
  });

  // Notifee foreground events
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    // يمكن معالجة أحداث الضغط هنا إذا لزم
    void type;
    void detail;
  });

  return () => {
    unsubscribeFCM();
    unsubscribeNotifee();
  };
}

// ─── Deep link عند فتح الإشعار من الـ Background/Quit ──────────────────────
export function handleNotificationOpen(
  navigate: (screen: string, params?: object) => void,
): void {
  // عند فتح التطبيق من إشعار (Quit state)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.data?.type === 'ORDER_STATUS_UPDATED') {
        const orderId = remoteMessage.data.orderId as string;
        if (orderId) navigate('OrderDetail', { orderId });
      }
    });

  // عند الضغط على إشعار (Background state)
  messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage?.data?.type === 'ORDER_STATUS_UPDATED') {
      const orderId = remoteMessage.data.orderId as string;
      if (orderId) navigate('OrderDetail', { orderId });
    }
  });
}

// ─── جدولة إشعارات تذكير الدواء ─────────────────────────────────────────────
// ⚠️ RepeatFrequency.DAILY = 0 وليس 1
export async function scheduleReminderNotifications(reminder: Reminder): Promise<void> {
  // أولاً: احذف الإشعارات القديمة لهذا التذكير
  await cancelReminderNotifications(reminder.id);

  if (!reminder.isActive) return;

  for (let i = 0; i < reminder.times.length; i++) {
    const time = reminder.times[i];
    const [hours, minutes] = time.split(':').map(Number);

    // تحديد وقت أول إشعار (اليوم أو الغد إن مضى الوقت)
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const timestampTrigger: TimestampTrigger = {
      type      : TriggerType.TIMESTAMP,
      timestamp : trigger.getTime(),
      repeatFrequency: RepeatFrequency.DAILY, // = 0
    };

    await notifee.createTriggerNotification(
      {
        id     : `reminder_${reminder.id}_${i}`,
        title  : `💊 ${reminder.medicineName}`,
        body   : `حان وقت جرعة ${reminder.dosage} — ${time}`,
        android: {
          channelId   : CHANNEL_REMINDERS,
          smallIcon   : 'ic_notification',
          pressAction : { id: 'default' },
          importance  : AndroidImportance.HIGH,
        },
      },
      timestampTrigger,
    );
  }
}

// ─── إلغاء إشعارات تذكير محدد ───────────────────────────────────────────────
export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  const triggers = await notifee.getTriggerNotificationIds();
  const toCancel = triggers.filter(id => id.startsWith(`reminder_${reminderId}_`));
  if (toCancel.length > 0) {
    await notifee.cancelTriggerNotifications(toCancel);
  }
}

// ─── إلغاء جميع إشعارات التذكيرات ──────────────────────────────────────────
export async function cancelAllReminderNotifications(): Promise<void> {
  const triggers = await notifee.getTriggerNotificationIds();
  const toCancel = triggers.filter(id => id.startsWith('reminder_'));
  if (toCancel.length > 0) {
    await notifee.cancelTriggerNotifications(toCancel);
  }
}
