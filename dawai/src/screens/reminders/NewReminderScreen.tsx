import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { Screen, Input, Button } from '@components/ui';
import { remindersApi } from '@api/services';
import { COLORS, FONTS, SPACING } from '@constants/config';

const DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const DEFAULT_TIMES = ['08:00', '14:00', '20:00'];

export default function NewReminderScreen({ navigation }: any) {
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00']);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTime = (t: string) => {
    setSelectedTimes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const toggleDay = (i: number) => {
    setSelectedDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
    );
  };

  const submit = async () => {
    if (!medicineName.trim()) {
      Alert.alert('تنبيه', 'أدخل اسم الدواء');
      return;
    }
    if (selectedTimes.length === 0) {
      Alert.alert('تنبيه', 'اختر وقتاً على الأقل');
      return;
    }
    setLoading(true);
    try {
      await remindersApi.create({
        medicineName: medicineName.trim(),
        dosage: dosage.trim() || undefined,
        times: selectedTimes,
        daysOfWeek: selectedDays,
        notes: notes.trim() || undefined,
      });
      Alert.alert('تم', 'تم إضافة التذكير بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('خطأ', 'تعذّر إضافة التذكير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>تذكير جديد</Text>

        <Input
          label="اسم الدواء *"
          placeholder="مثال: باراسيتامول"
          value={medicineName}
          onChangeText={setMedicineName}
        />
        <Input
          label="الجرعة"
          placeholder="مثال: قرص واحد"
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={styles.sectionLabel}>أوقات التذكير</Text>
        <View style={styles.chipRow}>
          {DEFAULT_TIMES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, selectedTimes.includes(t) && styles.chipActive]}
              onPress={() => toggleTime(t)}
            >
              <Text style={[styles.chipText, selectedTimes.includes(t) && styles.chipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>أيام الأسبوع</Text>
        <View style={styles.chipRow}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.chip, selectedDays.includes(i) && styles.chipActive]}
              onPress={() => toggleDay(i)}
            >
              <Text style={[styles.chipText, selectedDays.includes(i) && styles.chipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="ملاحظات"
          placeholder="أي تعليمات إضافية..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          title="إضافة التذكير"
          onPress={submit}
          loading={loading}
          style={{ marginTop: SPACING.md }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, paddingBottom: 60 },
  title: {
    color: COLORS.textPrimary, fontSize: FONTS.size.xxl,
    fontWeight: '700', marginBottom: SPACING.lg, textAlign: 'right',
  },
  sectionLabel: {
    color: COLORS.textSecond, fontSize: FONTS.size.sm,
    fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.md,
    textAlign: 'right',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgInput,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  chipTextActive: { color: COLORS.textPrimary, fontWeight: '600' },
});
