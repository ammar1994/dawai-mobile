import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, Input } from '@components/ui';
import { ordersApi } from '@api/services';
import { COLORS, SPACING, FONTS } from '@constants/config';

interface OrderItem { medicineName: string; quantity: number; notes: string; }

export function NewOrderScreen() {
  const navigation  = useNavigation<any>();
  const route       = useRoute<any>();
  const pharmacy    = route.params?.pharmacy;

  const [items,    setItems]    = useState<OrderItem[]>([{ medicineName: '', quantity: 1, notes: '' }]);
  const [address,  setAddress]  = useState('');
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const addItem = () => setItems(i => [...i, { medicineName: '', quantity: 1, notes: '' }]);

  const removeItem = (idx: number) =>
    setItems(i => i.filter((_, j) => j !== idx));

  const updateItem = (idx: number, key: keyof OrderItem, val: string | number) =>
    setItems(i => i.map((item, j) => j === idx ? { ...item, [key]: val } : item));

  const submit = async () => {
    const valid = items.every(i => i.medicineName.trim());
    if (!valid) { Alert.alert('تنبيه', 'أدخل اسم الدواء لكل بند'); return; }
    if (!pharmacy) { Alert.alert('تنبيه', 'اختر صيدلية أولاً'); return; }

    setLoading(true);
    try {
      const res = await ordersApi.create({
        branchId:        pharmacy.id,
        tenantId:        pharmacy.tenantId,
        notes:           notes.trim() || undefined,
        deliveryAddress: address.trim() || undefined,
        items:           items.map(i => ({
          medicineName: i.medicineName.trim(),
          quantity:     i.quantity,
          notes:        i.notes.trim() || undefined,
        })),
      });
      Alert.alert('✅ تم الإرسال', 'طلبك وصل للصيدلية وسيتم تأكيده قريباً', [
        { text: 'تتبع الطلب', onPress: () => navigation.replace('OrderDetail', { id: res.data?.data?.id }) },
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message ?? 'تعذر إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>طلب دواء</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Pharmacy */}
      {pharmacy && (
        <Card style={styles.pharmacyCard}>
          <View style={styles.pharmacyRow}>
            <Ionicons name="medical" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pharmacyName}>
                {pharmacy.tenant?.nameAr ?? pharmacy.tenant?.name ?? pharmacy.name}
              </Text>
              {pharmacy.distanceKm && (
                <Text style={styles.pharmacyDist}>{pharmacy.distanceKm} كم</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Pharmacies')}>
              <Text style={styles.changeText}>تغيير</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {!pharmacy && (
        <TouchableOpacity onPress={() => navigation.navigate('Pharmacies')} style={styles.selectPharmacy}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <Text style={styles.selectPharmacyText}>اختر صيدلية</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      {/* Items */}
      <Text style={styles.sectionTitle}>الأدوية المطلوبة</Text>
      {items.map((item, idx) => (
        <Card key={idx} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNum}>دواء {idx + 1}</Text>
            {items.length > 1 && (
              <TouchableOpacity onPress={() => removeItem(idx)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>

          <Input
            label="اسم الدواء"
            value={item.medicineName}
            onChangeText={v => updateItem(idx, 'medicineName', v)}
            placeholder="مثال: باراسيتامول 500mg"
          />

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>الكمية</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => item.quantity > 1 && updateItem(idx, 'quantity', item.quantity - 1)}
              >
                <Ionicons name="remove" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnPlus]}
                onPress={() => updateItem(idx, 'quantity', item.quantity + 1)}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="ملاحظة (اختياري)"
            value={item.notes}
            onChangeText={v => updateItem(idx, 'notes', v)}
            placeholder="مثال: حبوب فقط لا شراب"
          />
        </Card>
      ))}

      <TouchableOpacity style={styles.addItem} onPress={addItem}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.addItemText}>إضافة دواء آخر</Text>
      </TouchableOpacity>

      {/* Delivery */}
      <Text style={styles.sectionTitle}>التوصيل (اختياري)</Text>
      <Input
        label="عنوان التوصيل"
        icon="location-outline"
        value={address}
        onChangeText={setAddress}
        placeholder="اترك فارغاً للاستلام من الصيدلية"
      />

      <Input
        label="ملاحظات للصيدلية"
        value={notes}
        onChangeText={setNotes}
        placeholder="أي تعليمات إضافية..."
        multiline
      />

      <Button title="إرسال الطلب" onPress={submit} loading={loading} style={styles.submitBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  content:         { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  title:           { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '800' },
  pharmacyCard:    { marginBottom: SPACING.lg },
  pharmacyRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pharmacyName:    { color: '#fff', fontSize: FONTS.size.md, fontWeight: '700' },
  pharmacyDist:    { color: COLORS.primary, fontSize: FONTS.size.xs },
  changeText:      { color: COLORS.primary, fontSize: FONTS.size.sm },
  selectPharmacy:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.bgCard, padding: SPACING.md, borderRadius: 14, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  selectPharmacyText: { flex: 1, color: COLORS.primary, fontSize: FONTS.size.md, fontWeight: '600' },
  sectionTitle:    { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '700', marginBottom: SPACING.sm },
  itemCard:        { marginBottom: SPACING.sm },
  itemHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  itemNum:         { color: COLORS.textMuted, fontSize: FONTS.size.sm, fontWeight: '600' },
  qtyRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  qtyLabel:        { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  qtyControls:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  qtyBtn:          { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center' },
  qtyBtnPlus:      { backgroundColor: COLORS.primary },
  qtyValue:        { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  addItem:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg, padding: SPACING.sm },
  addItemText:     { color: COLORS.primary, fontSize: FONTS.size.md, fontWeight: '600' },
  submitBtn:       { marginTop: SPACING.md },
});
export default NewOrderScreen;
