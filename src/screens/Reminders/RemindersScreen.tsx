import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Modal, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useRemindersStore } from '../../store/reminders.store';
import type { Reminder, ReminderFrequency } from '../../types';
import { isValidTime } from '../../utils/validation';

const FREQ_LABELS: Record<ReminderFrequency, string> = { DAILY: 'يومي', TWICE_DAILY: 'مرتين يومياً', WEEKLY: 'أسبوعي', CUSTOM: 'مخصص' };

export function RemindersScreen() {
  const navigation = useNavigation();
  const { reminders, isLoading, fetchReminders, createReminder, deleteReminder, toggleActive } = useRemindersStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage,  setDosage]  = useState('');
  const [freq,    setFreq]    = useState<ReminderFrequency>('DAILY');
  const [time1,   setTime1]   = useState('08:00');
  const [time2,   setTime2]   = useState('20:00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { fetchReminders(); }, []);

  function getTimes(): string[] {
    if (freq === 'TWICE_DAILY') return [time1, time2];
    return [time1];
  }

  async function handleSave() {
    if (!medName.trim()) { Toast.show({ type: 'error', text1: 'أدخل اسم الدواء' }); return; }
    if (!dosage.trim())  { Toast.show({ type: 'error', text1: 'أدخل الجرعة' }); return; }
    const times = getTimes();
    if (times.some(t => !isValidTime(t))) { Toast.show({ type: 'error', text1: 'صيغة الوقت غير صحيحة (HH:MM)' }); return; }
    setSaving(true);
    try {
      await createReminder({ medicineName: medName.trim(), dosage: dosage.trim(), frequency: freq, times, startDate });
      setModalVisible(false); setMedName(''); setDosage(''); setFreq('DAILY'); setTime1('08:00'); setTime2('20:00');
      Toast.show({ type: 'success', text1: 'تم إضافة التذكير ✅' });
    } catch { Toast.show({ type: 'error', text1: 'فشل إضافة التذكير' }); }
    finally { setSaving(false); }
  }

  function renderItem({ item }: { item: Reminder }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Switch value={item.isActive} onValueChange={v => toggleActive(item.id, v)} trackColor={{ true: Colors.primary }} thumbColor={Colors.white} />
          <View style={styles.cardInfo}>
            <Text style={styles.medName}>{item.medicineName}</Text>
            <Text style={styles.dosage}>{item.dosage} — {FREQ_LABELS[item.frequency]}</Text>
            <Text style={styles.times}>{item.times.join('  /  ')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => Alert.alert('حذف', `حذف تذكير ${item.medicineName}؟`, [{ text: 'إلغاء' }, { text: 'حذف', style: 'destructive', onPress: () => deleteReminder(item.id) }])}>
          <Text style={styles.deleteText}>🗑️ حذف</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>تذكيرات الأدوية</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} /> :
          <View style={styles.empty}><Text style={styles.emptyIcon}>⏰</Text><Text style={styles.emptyText}>لا توجد تذكيرات — أضف تذكيراً جديداً</Text></View>
        }
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalCancel}>إلغاء</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>تذكير جديد</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>{saving ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.modalSave}>حفظ</Text>}</TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>اسم الدواء *</Text>
          <TextInput style={styles.input} value={medName} onChangeText={setMedName} placeholder="مثال: باراسيتامول" placeholderTextColor={Colors.textHint} textAlign="right" />

          <Text style={styles.fieldLabel}>الجرعة *</Text>
          <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="مثال: قرص واحد 500mg" placeholderTextColor={Colors.textHint} textAlign="right" />

          <Text style={styles.fieldLabel}>التكرار</Text>
          <View style={styles.freqRow}>
            {(Object.keys(FREQ_LABELS) as ReminderFrequency[]).map(f => (
              <TouchableOpacity key={f} style={[styles.freqChip, freq === f && styles.freqChipActive]} onPress={() => setFreq(f)}>
                <Text style={[styles.freqChipText, freq === f && styles.freqChipTextActive]}>{FREQ_LABELS[f]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>وقت التذكير الأول (HH:MM)</Text>
          <TextInput style={styles.input} value={time1} onChangeText={setTime1} placeholder="08:00" placeholderTextColor={Colors.textHint} keyboardType="numbers-and-punctuation" textAlign="center" />

          {freq === 'TWICE_DAILY' && (<>
            <Text style={styles.fieldLabel}>وقت التذكير الثاني (HH:MM)</Text>
            <TextInput style={styles.input} value={time2} onChangeText={setTime2} placeholder="20:00" placeholderTextColor={Colors.textHint} keyboardType="numbers-and-punctuation" textAlign="center" />
          </>)}

          <Text style={styles.fieldLabel}>تاريخ البدء (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder={new Date().toISOString().split('T')[0]} placeholderTextColor={Colors.textHint} textAlign="center" />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: Spacing.md },
  addBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardInfo: { flex: 1, alignItems: 'flex-end', marginEnd: Spacing.sm },
  medName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  dosage: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginTop: 2 },
  times: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, textAlign: 'right', marginTop: 2 },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteText: { color: Colors.error, fontSize: FontSize.sm },
  empty: { alignItems: 'center', marginTop: 64 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalContent: { padding: Spacing.lg, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalCancel: { color: Colors.textSecondary, fontSize: FontSize.md },
  modalSave: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs, textAlign: 'right' },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: Spacing.md, textAlign: 'right' },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  freqChip: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  freqChipActive: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  freqChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  freqChipTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
});
