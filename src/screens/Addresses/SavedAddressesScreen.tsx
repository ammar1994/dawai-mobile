import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useAddressesStore } from '../../store/addresses.store';
import type { SavedAddress } from '../../types';

const LABEL_ICONS = { home: '🏠', work: '💼', other: '📍' };
const LABEL_NAMES = { home: 'المنزل', work: 'العمل', other: 'أخرى' };

export function SavedAddressesScreen() {
  const navigation = useNavigation();
  const { addresses, loadAddresses, addAddress, removeAddress } = useAddressesStore();
  const [modal, setModal] = useState(false);
  const [text,  setText]  = useState('');
  const [label, setLabel] = useState<SavedAddress['label']>('home');

  useEffect(() => { loadAddresses(); }, []);

  function handleSave() {
    if (!text.trim()) return;
    addAddress({ label, text: text.trim() });
    setModal(false); setText(''); setLabel('home');
  }

  function renderItem({ item }: { item: SavedAddress }) {
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => Alert.alert('حذف', 'حذف هذا العنوان؟', [{ text: 'إلغاء' }, { text: 'حذف', style: 'destructive', onPress: () => removeAddress(item.id) }])}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.labelText}>{LABEL_ICONS[item.label]} {LABEL_NAMES[item.label]}</Text>
          <Text style={styles.addressText}>{item.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>العناوين المحفوظة</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addBtnText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📍</Text><Text style={styles.emptyText}>لا عناوين محفوظة — أضف عنواناً للتوصيل السريع</Text></View>}
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.cancel}>إلغاء</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>عنوان جديد</Text>
            <TouchableOpacity onPress={handleSave}><Text style={styles.save}>حفظ</Text></TouchableOpacity>
          </View>
          <Text style={styles.fieldLabel}>نوع العنوان</Text>
          <View style={styles.labelRow}>
            {(['home', 'work', 'other'] as const).map(l => (
              <TouchableOpacity key={l} style={[styles.labelChip, label === l && styles.labelChipActive]} onPress={() => setLabel(l)}>
                <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>{LABEL_ICONS[l]} {LABEL_NAMES[l]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>العنوان التفصيلي</Text>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="الحي، الشارع، رقم المبنى..." placeholderTextColor={Colors.textHint} multiline numberOfLines={3} textAlign="right" textAlignVertical="top" />
        </View>
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
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  deleteIcon: { fontSize: 20, marginEnd: Spacing.sm },
  info: { flex: 1, alignItems: 'flex-end' },
  labelText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary, marginBottom: 2 },
  addressText: { fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right' },
  empty: { alignItems: 'center', marginTop: 64, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cancel: { color: Colors.textSecondary, fontSize: FontSize.md },
  save: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'right' },
  labelRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  labelChip: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  labelChipActive: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  labelChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  labelChipTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, fontSize: FontSize.md, color: Colors.textPrimary, height: 88 },
});
