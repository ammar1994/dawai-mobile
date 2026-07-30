import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Switch,
} from 'react-native';
import { useRemindersStore } from '../../store/reminders.store';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { Reminder, ReminderFrequency } from '../../types';
import { AddReminderModal } from './AddReminderModal';

const FREQ_LABELS: Record<ReminderFrequency, string> = {
  DAILY:       'يومياً',
  TWICE_DAILY: 'مرتان يومياً',
  WEEKLY:      'أسبوعياً',
  CUSTOM:      'مخصص',
};

function ReminderCard({ item, onToggle, onDelete }: {
  item: Reminder;
  onToggle: (id: string, v: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const confirmDelete = () => {
    Alert.alert('حذف التذكير', `هل تريد حذف تذكير ${item.medicineName}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={[styles.card, !item.isActive && styles.cardInactive]}>
      <View style={styles.cardTop}>
        <Switch
          value={item.isActive}
          onValueChange={v => onToggle(item.id, v)}
          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
          thumbColor={item.isActive ? Colors.primary : Colors.textHint}
        />
        <View style={styles.cardInfo}>
          <Text style={[styles.medicineName, !item.isActive && styles.textFaded]}>
            💊 {item.medicineName}
          </Text>
          <Text style={styles.dosage}>{item.dosage}</Text>
        </View>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailBadge}>
          <Text style={styles.detailText}>{FREQ_LABELS[item.frequency]}</Text>
        </View>
        {item.times.map((t, i) => (
          <View key={i} style={styles.timeBadge}>
            <Text style={styles.timeText}>⏰ {t}</Text>
          </View>
        ))}
      </View>

      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

      <Text style={styles.dateRange}>
        من {new Date(item.startDate).toLocaleDateString('ar-EG')}
        {item.endDate ? ` → ${new Date(item.endDate).toLocaleDateString('ar-EG')}` : ' (مستمر)'}
      </Text>
    </View>
  );
}

export function RemindersScreen() {
  const { reminders, isLoading, fetchReminders, toggleReminder, deleteReminder } = useRemindersStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchReminders(); }, []);

  const active   = reminders.filter(r => r.isActive);
  const inactive = reminders.filter(r => !r.isActive);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>تذكير الدواء</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {isLoading && reminders.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={[...active, ...inactive]}
          keyExtractor={r => r.id}
          renderItem={({ item }) => (
            <ReminderCard item={item} onToggle={toggleReminder} onDelete={deleteReminder} />
          )}
          contentContainerStyle={reminders.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchReminders} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>⏰</Text>
              <Text style={styles.emptyTitle}>لا توجد تذكيرات</Text>
              <Text style={styles.emptyHint}>أضف تذكير لدوائك حتى لا تنساه</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAdd(true)}>
                <Text style={styles.emptyAddText}>+ إضافة أول تذكير</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <AddReminderModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 20, paddingHorizontal: Spacing.base, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title:          { fontSize: Typography.xl, fontWeight: '700', color: Colors.white },
  addBtn:         { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  addBtnText:     { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
  list:           { padding: Spacing.base, gap: Spacing.md },
  emptyContainer: { flex: 1 },
  card:           { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  cardInactive:   { opacity: 0.6 },
  cardTop:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  cardInfo:       { flex: 1 },
  medicineName:   { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, textAlign: 'right' },
  textFaded:      { color: Colors.textHint },
  dosage:         { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'right' },
  deleteBtn:      { padding: Spacing.xs },
  deleteBtnText:  { fontSize: 18 },
  cardDetails:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xs, justifyContent: 'flex-end' },
  detailBadge:    { backgroundColor: Colors.primaryGlow, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  detailText:     { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },
  timeBadge:      { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  timeText:       { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '600' },
  notes:          { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'right', marginTop: 4 },
  dateRange:      { fontSize: Typography.xs, color: Colors.textHint, textAlign: 'right', marginTop: 6 },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIcon:      { fontSize: 64, marginBottom: Spacing.base },
  emptyTitle:     { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyHint:      { fontSize: Typography.base, color: Colors.textSecondary, marginBottom: Spacing.xl },
  emptyAddBtn:    { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  emptyAddText:   { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
});
