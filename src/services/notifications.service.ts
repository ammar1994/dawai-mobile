/**
 * Push & Local Notifications Service
 * Uses @notifee/react-native for local notifications (medicine reminders).
 * For remote push (order status updates), FCM token is sent to backend via /v1/mobile/push-token.
 *
 * Setup required:
 *   iOS:  Add NSUserNotificationUsageDescription to Info.plist
 *   Android: NotificationPermission already granted on API 32-
 *            API 33+ requires POST_NOTIFICATIONS permission
 */

import { Platform } from 'react-native';
import { remindersService } from './reminders.service';

// Lazy-import notifee so the app doesn't crash if the package isn't linked yet
let notifee: any = null;
let AndroidImportance: any = null;
let TriggerType: any = null;

async function getNotifee() {
  if (!notifee) {
    try {
      const mod = await import('@notifee/react-native');
      notifee             = mod.default;
      AndroidImportance   = mod.AndroidImportance;
      TriggerType         = mod.TriggerType;
    } catch {
      console.warn('[Notifee] Package not linked — local notifications disabled');
    }
  }
  return notifee;
}

// ─── Request Permission ───────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  const n = await getNotifee();
  if (!n) return false;
  const settings = await n.requestPermission();
  return settings.authorizationStatus >= 1; // AUTHORIZED or PROVISIONAL
}

// ─── Create default channel (Android) ────────────────────────────────────────
async function ensureChannel() {
  const n = await getNotifee();
  if (!n || Platform.OS !== 'android') return 'default';
  return n.createChannel({
    id:         'reminders',
    name:       'تذكيرات الدواء',
    importance: AndroidImportance?.HIGH ?? 4,
    sound:      'default',
    vibration:  true,
  });
}

// ─── Schedule one reminder notification ──────────────────────────────────────
export async function scheduleReminderNotification(opts: {
  id: string;
  medicineName: string;
  dosage: string;
  time: string; // "HH:MM"
}) {
  const n = await getNotifee();
  if (!n) return;

  const channelId = await ensureChannel();
  const [h, m] = opts.time.split(':').map(Number);

  const now   = new Date();
  const trigger = new Date();
  trigger.setHours(h, m, 0, 0);
  if (trigger <= now) trigger.setDate(trigger.getDate() + 1); // next occurrence

  await n.createTriggerNotification(
    {
      id:    `${opts.id}_${opts.time.replace(':', '')}`,
      title: `💊 حان وقت ${opts.medicineName}`,
      body:  `الجرعة: ${opts.dosage}`,
      android: { channelId, pressAction: { id: 'default' }, sound: 'default' },
      ios:     { sound: 'default' },
    },
    {
      type:      TriggerType?.TIMESTAMP ?? 0,
      timestamp: trigger.getTime(),
      repeatFrequency: 1, // daily = 1
    },
  );
}

// ─── Cancel a reminder's notifications ───────────────────────────────────────
export async function cancelReminderNotifications(reminderId: string, times: string[]) {
  const n = await getNotifee();
  if (!n) return;
  for (const t of times) {
    await n.cancelTriggerNotification(`${reminderId}_${t.replace(':', '')}`).catch(() => {});
  }
}

// ─── Schedule all active reminders on app launch ──────────────────────────────
export async function scheduleAllReminders() {
  try {
    const reminders = await remindersService.list();
    for (const r of reminders) {
      if (!r.isActive) continue;
      for (const t of r.times) {
        await scheduleReminderNotification({
          id: r.id, medicineName: r.medicineName, dosage: r.dosage, time: t,
        });
      }
    }
  } catch (e) {
    console.warn('[Notifications] Failed to schedule reminders:', e);
  }
}

// ─── Display immediate notification (e.g. order status change) ───────────────
export async function showOrderStatusNotification(opts: {
  orderId: string;
  status:  string;
  pharmacyName: string;
}) {
  const n = await getNotifee();
  if (!n) return;

  const channelId = await ensureChannel();
  const STATUS_MESSAGES: Record<string, string> = {
    RECEIVED:         '✅ الصيدلية استلمت طلبك',
    PREPARING:        '⚗️ جاري تجهيز طلبك',
    READY:            '🎉 طلبك جاهز!',
    OUT_FOR_DELIVERY: '🛵 المندوب في الطريق إليك',
    DELIVERED:        '✅ تم توصيل طلبك بنجاح',
    CANCELLED:        '❌ تم إلغاء الطلب',
  };

  await n.displayNotification({
    id:    `order_${opts.orderId}`,
    title: opts.pharmacyName,
    body:  STATUS_MESSAGES[opts.status] ?? `حالة الطلب: ${opts.status}`,
    android: { channelId, pressAction: { id: 'default' } },
  });
}
