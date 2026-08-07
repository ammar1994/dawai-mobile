import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ActionSheetIOS, Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  launchCamera, launchImageLibrary,
  type ImagePickerResponse, type Asset,
} from 'react-native-image-picker';
import { useOrdersStore } from '../../store/orders.store';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { PharmacyStackParamList, OrdersStackParamList } from '../../types';

type Route = RouteProp<PharmacyStackParamList, 'NewOrder'>;
type Nav   = NativeStackNavigationProp<PharmacyStackParamList>;

interface CartItem { medicineName: string; quantity: number; requiresPrescription: boolean }

// ── Image Picker Helper ────────────────────────────────────────────
async function pickPrescriptionImage(): Promise<Asset | null> {
  return new Promise(resolve => {
    const options = {
      mediaType: 'photo' as const,
      quality:   0.85 as const,
      maxWidth:  1280,
      maxHeight: 1280,
    };
    const handler = (res: ImagePickerResponse) => {
      resolve(res.didCancel || res.errorCode ? null : (res.assets?.[0] ?? null));
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['إلغاء', 'الكاميرا', 'المعرض'], cancelButtonIndex: 0, title: 'إرفاق وصفة طبية' },
        idx => {
          if (idx === 1) launchCamera(options, handler);
          else if (idx === 2) launchImageLibrary(options, handler);
          else resolve(null);
        },
      );
    } else {
      Alert.alert('إرفاق وصفة طبية', 'اختر مصدر الصورة', [
        { text: 'إلغاء', style: 'cancel', onPress: () => resolve(null) },
        { text: '📷 الكاميرا', onPress: () => launchCamera(options, handler) },
        { text: '🖼️ المعرض',   onPress: () => launchImageLibrary(options, handler) },
      ]);
    }
  });
}

export function NewOrderScreen() {
  const route = useRoute<Route>();
  const nav   = useNavigation<Nav>();
  const { createOrder, isLoading } = useOrdersStore();

  const [items, setItems]                     = useState<CartItem[]>([{ medicineName: '', quantity: 1, requiresPrescription: false }]);
  const [notes, setNotes]                     = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);

  const addItem = () => setItems(p => [...p, { medicineName: '', quantity: 1, requiresPrescription: false }]);

  const removeItem = (i: number) => {
    if (items.length === 1) return;
    setItems(p => p.filter((_, idx) => idx !== i));
  };

  const updateItem = (i: number, field: keyof CartItem, value: any) => {
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handlePickPrescription = async () => {
    const asset = await pickPrescriptionImage();
    if (asset?.uri) setPrescriptionUri(asset.uri);
  };

  const handleSubmit = async () => {
    const validItems = items.filter(i => i.medicineName.trim());
    if (validItems.length === 0) {
      Alert.alert('تنبيه', 'أضف اسم دواء واحد على الأقل');
      return;
    }

    try {
      const order = await createOrder({
        pharmacyId:      route.params.pharmacyId,
        notes:           notes.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        items:           validItems,
        // prescriptionUri: prescriptionUri || undefined,  // uncomment when API supports it
      });
      Alert.alert('تم الإرسال ✅', 'وصل طلبك للصيدلية بنجاح!', [
        { text: 'تتبع الطلب', onPress: () => nav.navigate('OrderTracking', { orderId: order.id }) },
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err.message ?? 'فشل إرسال الطلب');
    }
  };

  const hasRxItem = items.some(i => i.requiresPrescription);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Header — RTL-safe: marginStart بدل marginLeft */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.backIcon}>→</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginStart: Spacing.sm }}>
            <Text style={styles.headerTitle}>طلب جديد</Text>
            <Text style={styles.headerSub}>{route.params.pharmacyName}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Medicines */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>الأدوية المطلوبة</Text>
            {items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemInputs}>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="اسم الدواء"
                    placeholderTextColor={Colors.textHint}
                    value={item.medicineName}
                    onChangeText={v => updateItem(i, 'medicineName', v)}
                    textAlign="right"
                  />
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateItem(i, 'quantity', Math.max(1, item.quantity - 1))}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateItem(i, 'quantity', item.quantity + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rxBadge, item.requiresPrescription && styles.rxActive]}
                      onPress={() => updateItem(i, 'requiresPrescription', !item.requiresPrescription)}
                    >
                      <Text style={[styles.rxText, item.requiresPrescription && styles.rxTextActive]}>Rx</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
              <Text style={styles.addItemText}>+ إضافة دواء آخر</Text>
            </TouchableOpacity>
          </View>

          {/* Prescription Image — يظهر إذا كان أي دواء يتطلب وصفة */}
          {hasRxItem && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>وصفة طبية 📋</Text>
              <Text style={styles.presHint}>بعض الأدوية تستلزم وصفة طبية — يمكنك إرفاقها هنا</Text>
              <TouchableOpacity style={styles.presPickerBtn} onPress={handlePickPrescription} activeOpacity={0.85}>
                {prescriptionUri ? (
                  <Image source={{ uri: prescriptionUri }} style={styles.presPickerImg} resizeMode="cover" />
                ) : (
                  <View style={styles.presPickerPlaceholder}>
                    <Text style={styles.presPickerIcon}>📷</Text>
                    <Text style={styles.presPickerText}>التقاط أو اختيار وصفة</Text>
                  </View>
                )}
              </TouchableOpacity>
              {prescriptionUri && (
                <TouchableOpacity onPress={() => setPrescriptionUri(null)} style={styles.presRemoveBtn}>
                  <Text style={styles.presRemoveText}>إزالة الصورة ✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Delivery */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>عنوان التوصيل (اختياري)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="العنوان بالتفصيل..."
              placeholderTextColor={Colors.textHint}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={2}
              textAlign="right"
            />
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ملاحظات (اختياري)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="أي تعليمات إضافية للصيدلية..."
              placeholderTextColor={Colors.textHint}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.submitText}>إرسال الطلب 📤</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles — RTL-Safe ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  // RTL-safe header
  header:        { backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: Spacing.base, flexDirection: 'row', alignItems: 'center' },
  backIcon:      { fontSize: 22, color: Colors.white, fontWeight: '700' },
  headerTitle:   { fontSize: Typography.lg, fontWeight: '700', color: Colors.white },
  headerSub:     { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)' },
  content:       { padding: Spacing.base, gap: Spacing.md, paddingBottom: 20 },
  card:          { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle:  { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'right' },
  itemRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  itemInputs:    { flex: 1, gap: Spacing.xs },
  nameInput:     { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm, fontSize: Typography.base, color: Colors.textPrimary, backgroundColor: Colors.background },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:    { fontSize: 18, color: Colors.primary, fontWeight: '700', lineHeight: 22 },
  qtyValue:      { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },
  rxBadge:       { borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 3 },
  rxActive:      { borderColor: Colors.warning, backgroundColor: Colors.warning + '20' },
  rxText:        { fontSize: Typography.xs, color: Colors.textHint, fontWeight: '700' },
  rxTextActive:  { color: Colors.warning },
  removeBtn:     { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.error + '15', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 13, color: Colors.error, fontWeight: '700' },
  addItemBtn:    { alignItems: 'center', paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: Spacing.xs },
  addItemText:   { color: Colors.primary, fontWeight: '600', fontSize: Typography.base },
  textArea:      { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 72, textAlignVertical: 'top', backgroundColor: Colors.background },
  footer:        { padding: Spacing.base, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  submitBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.base, alignItems: 'center', ...Shadow.md },
  submitText:    { color: Colors.white, fontSize: Typography.md, fontWeight: '700' },

  // Prescription picker
  presHint:            { fontSize: Typography.xs, color: Colors.textHint, marginBottom: Spacing.sm, textAlign: 'right' },
  presPickerBtn:       { width: '100%', height: 120, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary + '55', borderStyle: 'dashed', overflow: 'hidden' },
  presPickerImg:       { width: '100%', height: '100%' },
  presPickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  presPickerIcon:      { fontSize: 28 },
  presPickerText:      { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  presRemoveBtn:       { marginTop: Spacing.xs, alignItems: 'center' },
  presRemoveText:      { color: Colors.error, fontSize: Typography.xs, fontWeight: '600' },
});
