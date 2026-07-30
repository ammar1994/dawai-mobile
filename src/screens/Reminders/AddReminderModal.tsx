import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRemindersStore } from '../../store/reminders.store';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { ReminderFrequency } from '../../types';

interface Props { visible: boolean; onClose: () => void }

const FREQ_OPTIONS: { key: ReminderFrequency; label: string; defaultTimes: string[] }[] = [
  { key: 'DAILY',       label: 'مرة يومياً',    defaultTimes: ['08:00'] },
  { key: 'TWICE_DAILY', label: 'مرتان يومياً',  defaultTimes: ['08:00', '20:00'] },
  { key: 'WEEKLY',      label: 'أسبوعياً',      defaultTimes: ['08:00'] },
  { key: 'CUSTOM',      label: 'مخصص',          defaultTimes: ['08:00'] },
];

// Simple HH:MM picker using +/- buttons (works without native modules)
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':').map(Number);

  const changeH = (delta: number) => {
    const nh = (h + delta + 24) % 24;
    onChange(`${String(nh).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  };
  const changeM = (delta: number) => {
    const nm = (m + delta + 60) % 60;
    onChange(`${String(h).padStart(2,'0')}:${String(nm).padStart(2,'0')}`);
  };

  return (
    <View style={tStyles.row}>
      <View style={tStyles.unit}>
        <TouchableOpacity onPress={() => changeH(1)}><Text style={tStyles.arrow}>▲</Text></TouchableOpacity>
        <Text style={tStyles.value}>{String(h).padStart(2,'0')}</Text>
        <TouchableOpacity onPress={() => changeH(-1)}><Text style={tStyles.arrow}>▼</Text></TouchableOpacity>
      </View>
      <Text style={tStyles.colon}>:</Text>
      <View style={tStyles.unit}>
        <TouchableOpacity onPress={() => changeM(5)}><Text style={tStyles.arrow}>▲</Text></TouchableOpacity>
        <Text style={tStyles.value}>{String(m).padStart(2,'0')}</Text>
        <TouchableOpacity onPress={() => changeM(-5)}><Text style={tStyles.arrow}>▼</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const tStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  unit:  { alignItems: 'center', gap: 4 },
  arrow: { fontSize: 18, color: Colors.primary, fontWeight: '700', paddingHorizontal: 12 },
  value: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.textPrimary, minWidth: 52, textAlign: 'center' },
  colon: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
});

export function AddReminderModal({ visible, onClose }: Props) {
  const { createReminder, isLoading } = useRemindersStore();

  const [medicineName, setMedicineName] = useState('');
  const [dosage,       setDosage]       = useState('');
  const [frequency,    setFrequency]    = useState<ReminderFrequency>('DAILY');
  const [times,        setTimes]        = useState(['08:00']);
  const [notes,        setNotes]        = useState('');

  const selectFreq = (f: typeof FREQ_OPTIONS[0]) => {
    setFrequency(f.key);
    setTimes([...f.defaultTimes]);
  };

  const updateTime = (i: number, v: string) =>
    setTimes(p => p.map((t, idx) => idx === i ? v : t));

  const handleSubmit = async () => {
    if (!medicineName.trim()) { Alert.alert('تنبيه', 'أدخل اسم الدواء'); return; }
    if (!dosage.trim())       { Alert.alert('تنبيه', 'أدخل الجرعة'); return; }
    try {
      await createReminder({
        medicineName: medicineName.trim(),
        dosage:       dosage.trim(),
        frequency,
        times,
        startDate:    new Date().toISOString(),
        notes:        notes.trim() || undefined,
      });
      // Reset
      setMedicineName(''); setDosage(''); setFrequency('DAILY');
      setTimes(['08:00']); setNotes('');
      onClose();
    } catch (err: any) {
      Alert.alert('خطأ', err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.title}>تذكير جديد</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color={Colors.primary} />
                : <Text style={styles.saveText}>حفظ</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Medicine Name */}
            <View style={styles.section}>
              <Text style={styles.label}>اسم الدواء *</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: باراسيتامول"
                placeholderTextColor={Colors.textHint}
                value={medicineName}
                onChangeText={setMedicineName}
                textAlign="right"
              />
            </View>

            {/* Dosage */}
            <View style={styles.section}>
              <Text style={styles.label}>الجرعة *</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: حبة واحدة"
                placeholderTextColor={Colors.textHint}
                value={dosage}
                onChangeText={setDosage}
                textAlign="right"
              />
            </View>

            {/* Frequency */}
            <View style={styles.section}>
              <Text style={styles.label}>التكرار</Text>
              <View style={styles.freqRow}>
                {FREQ_OPTIONS.map(f => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.freqBtn, frequency === f.key && styles.freqBtnActive]}
                    onPress={() => selectFreq(f)}
                  >
                    <Text style={[styles.freqText, frequency === f.key && styles.freqTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Times */}
            <View style={styles.section}>
              <Text style={styles.label}>أوقات التذكير</Text>
              {times.map((t, i) => (
                <View key={i} style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>الوقت {i + 1}</Text>
                  <TimePicker value={t} onChange={v => updateTime(i, v)} />
                </View>
              ))}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>ملاحظات (اختياري)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="أي تعليمات خاصة..."
                placeholderTextColor={Colors.textHint}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlign="right"
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, paddingTop: Spacing.xl, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancelText:     { fontSize: Typography.base, color: Colors.textSecondary },
  title:          { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  saveText:       { fontSize: Typography.base, color: Colors.primary, fontWeight: '700' },
  content:        { padding: Spacing.base, gap: Spacing.md, paddingBottom: 40 },
  section:        { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  label:          { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'right' },
  input:          { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm, fontSize: Typography.base, color: Colors.textPrimary, backgroundColor: Colors.background },
  textArea:       { minHeight: 80 },
  freqRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'flex-end' },
  freqBtn:        { borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  freqBtnActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  freqText:       { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '600' },
  freqTextActive: { color: Colors.primary },
  timeBlock:      { marginBottom: Spacing.sm, alignItems: 'center' },
  timeLabel:      { fontSize: Typography.xs, color: Colors.textHint, marginBottom: Spacing.xs },
});
