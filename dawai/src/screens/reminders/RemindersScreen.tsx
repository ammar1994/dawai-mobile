import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Loader, Card } from '@components/ui';
import { remindersApi } from '@api/services';
import { COLORS, FONTS, SPACING } from '@constants/config';

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  times: string[];
  isActive: boolean;
  daysOfWeek?: number[];
}

const DAY_NAMES = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'];

export default function RemindersScreen({ navigation }: any) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      const res = await remindersApi.list();
      setReminders(res.data.reminders ?? res.data);
    } catch {
      Alert.alert('خطأ', 'تعذّر تحميل التذكيرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await remindersApi.update(id, { isActive: !current });
      setReminders(r => r.map(rem => rem.id === id ? { ...rem, isActive: !current } : rem));
    } catch {
      Alert.alert('خطأ', 'تعذّر تحديث التذكير');
    }
  };

  const deleteReminder = (id: string) => {
    Alert.alert('حذف التذكير', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          await remindersApi.delete(id);
          setReminders(r => r.filter(rem => rem.id !== id));
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>تذكيرات الأدوية</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NewReminder')}
        >
          <Ionicons name="add" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alarm-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد تذكيرات</Text>
          <Text style={styles.emptyText}>أضف تذكيراً لأدويتك حتى لا تنساها</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('NewReminder')}
          >
            <Text style={styles.emptyBtnText}>أضف تذكيراً</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={r => r.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Card style={[styles.card, !item.isActive ? styles.cardInactive : undefined] as any}>
              <View style={styles.cardRow}>
                <View style={styles.cardLeft}>
                  <View style={styles.pillIcon}>
                    <Ionicons name="medkit" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.medicineName}>{item.medicineName}</Text>
                    {item.dosage && (
                      <Text style={styles.dosage}>{item.dosage}</Text>
                    )}
                  </View>
                </View>
                <Switch
                  value={item.isActive}
                  onValueChange={() => toggleActive(item.id, item.isActive)}
                  trackColor={{ false: COLORS.bgInput, true: COLORS.primaryDark }}
                  thumbColor={item.isActive ? COLORS.primary : COLORS.textMuted}
                />
              </View>

              <View style={styles.timesRow}>
                {item.times.map(t => (
                  <View key={t} style={styles.timeChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.timeText}>{t}</Text>
                  </View>
                ))}
              </View>

              {item.daysOfWeek && (
                <View style={styles.daysRow}>
                  {DAY_NAMES.map((d, i) => (
                    <View
                      key={i}
                      style={[styles.dayDot, item.daysOfWeek!.includes(i) && styles.dayDotActive]}
                    >
                      <Text style={[styles.dayText, item.daysOfWeek!.includes(i) && styles.dayTextActive]}>
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteReminder(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={styles.deleteBtnText}>حذف</Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: '700' },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  card: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  cardInactive: { opacity: 0.5 } as any,
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pillIcon: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center', justifyContent: 'center',
  },
  medicineName: { color: COLORS.textPrimary, fontSize: FONTS.size.md, fontWeight: '600' },
  dosage: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 2 },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: { color: COLORS.primary, fontSize: FONTS.size.sm },
  daysRow: { flexDirection: 'row', gap: 4, marginTop: SPACING.sm },
  dayDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgInput,
  },
  dayDotActive: { backgroundColor: COLORS.primary },
  dayText: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  dayTextActive: { color: COLORS.textPrimary, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: SPACING.sm, alignSelf: 'flex-end',
  },
  deleteBtnText: { color: COLORS.error, fontSize: FONTS.size.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: '700', marginTop: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    borderRadius: 24, marginTop: SPACING.md,
  },
  emptyBtnText: { color: COLORS.textPrimary, fontWeight: '700' },
});
