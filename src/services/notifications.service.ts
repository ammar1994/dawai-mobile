/**
 * notifications.service.ts
 * يتعامل مع:
 *  - Notifee v9 — إشعارات التذكيرات المحلية
 *  - Firebase: معطّل مؤقتاً (يحتاج google-services.json حقيقي)
 */

import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import type { Reminder } from '../types';

// ─── Channel IDs ────────────────────────────────────────────────────────────
const CHANNEL_REMINDERS = 'dawai_reminders';
const CHANNEL_ORDERS    = 'dawai_orders';

// ─── إعداد القنوات ──────────────────────────────────────────────────────────
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
  await notifee.requestPermission();
  return true;
}

// ─── FCM Token (stub — Firebase معطّل مؤقتاً) ──────────────────────────────
export async function getFCMToken(): Promise<string | null> {
  return null;
}

export async function registerPushToken(_token: string): Promise<void> {
  // Firebase معطّل — لا شيء
}

// ─── Foreground Handler (Notifee فقط) ──────────────────────────────────────
export function setupForegroundHandler(): () => void {
  const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    console.log('Notifee foreground event:', type, detail);
  });
  return unsubscribe;
}

// ─── Deep Link handler ──────────────────────────────────────────────────────
export function handleNotificationOpen(
  _callback: (screen: string, params: object) => void,
): void {
  // Firebase معطّل مؤقتاً
}

// ─── جدولة إشعار تذكير ──────────────────────────────────────────────────────
export async function scheduleReminderNotification(
  reminder: Reminder,
): Promise<void> {
  if (!reminder.isActive) return;

  for (const timeStr of reminder.times) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const timestampTrigger: TimestampTrigger = {
      type      : TriggerType.TIMESTAMP,
      timestamp : trigger.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id    : `reminder_${reminder.id}_${timeStr}`,
        title : `💊 ${reminder.medicineName}`,
        body  : `الجرعة: ${reminder.dosage} — الوقت: ${timeStr}`,
        android: { channelId: CHANNEL_REMINDERS, smallIcon: 'ic_notification' },
      },
      timestampTrigger,
    );
  }
}

// ─── إلغاء إشعارات تذكير ────────────────────────────────────────────────────
export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  const triggers = await notifee.getTriggerNotificationIds();
  const toCancel = triggers.filter(id => id.startsWith(`reminder_${reminderId}_`));
  await Promise.all(toCancel.map(id => notifee.cancelTriggerNotification(id)));
}
