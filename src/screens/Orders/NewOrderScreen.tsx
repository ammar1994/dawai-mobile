import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useOrdersStore } from '../../store/orders.store';
import { useAddressesStore } from '../../store/addresses.store';

export function NewOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pharmacyId } = route.params;
  const { cart, createOrder, clearCart, pendingPrescriptionUrl } = useOrdersStore();
  const { addresses } = useAddressesStore();

  const [notes,      setNotes]     = useState('');
  const [delivery,   setDelivery]  = useState('');
  // إذا جاء من شاشة الوصفات → نستخدم الـ URL مباشرة
  const [rxImageUri, setRxImageUri] = useState<string | null>(pendingPrescriptionUrl);
  const [isLoading,  setIsLoading] = useState(false);

  async function pickImage() {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets?.[0]?.uri) setRxImageUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!delivery.trim()) { Toast.show({ type: 'error', text1: 'أدخل عنوان التسليم' }); return; }
    setIsLoading(true);
    try {
      const order = await createOrder({
        branchId             : pharmacyId,
        items                : cart.map(c => ({ medicineName: c.medicineName, quantity: c.quantity })),
        notes                : notes.trim() || undefined,
        deliveryAddress      : delivery.trim(),
        prescriptionImageUrl : rxImageUri ?? undefined,  // ← يُرسل URL الوصفة إذا وُجدت
      });
      // نمسح الـ URL المعلّق بعد إرسال الطلب
      useOrdersStore.setState({ pendingPrescriptionUrl: null });
      clearCart();
      Toast.show({ type: 'success', text1: 'تم إرسال الطلب ✅' });
      navigation.navigate('OrderDetail', { orderId: order.id });
    } catch {
      Toast.show({ type: 'error', text1: 'فشل إرسال الطلب، حاول مجدداً' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>تفاصيل الطلب</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ملخص الطلب ({cart.length} منتجات)</Text>
        {cart.map(item => (
          <View key={item.medicineName} style={styles.cartRow}>
            <Text style={styles.cartQty}>×{item.quantity}</Text>
            <Text style={styles.cartMed}>{item.medicineName}</Text>
          </View>
        ))}
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عنوان التسليم *</Text>
        {addresses.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedRow}>
            {addresses.map(a => (
              <TouchableOpacity key={a.id} style={[styles.savedChip, delivery === a.text && styles.savedChipActive]} onPress={() => setDelivery(a.text)}>
                <Text style={[styles.savedChipText, delivery === a.text && styles.savedChipTextActive]}>{a.label === 'home' ? '🏠' : a.label === 'work' ? '💼' : '📍'} {a.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <TextInput style={styles.input} value={delivery} onChangeText={setDelivery} placeholder="الحي، الشارع، رقم المبنى..." placeholderTextColor={Colors.textHint} multiline numberOfLines={2} textAlign="right" />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ملاحظات (اختياري)</Text>
        <TextInput style={[styles.input, { height: 88 }]} value={notes} onChangeText={setNotes} placeholder="أي تعليمات خاصة للصيدلية..." placeholderTextColor={Colors.textHint} multiline textAlignVertical="top" textAlign="right" />
      </View>

      {/* Prescription Image */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>صورة الوصفة الطبية (إن وجدت)</Text>
        <TouchableOpacity style={styles.rxBtn} onPress={pickImage}>
          {rxImageUri
            ? <Image source={{ uri: rxImageUri }} style={styles.rxPreview} />
            : <Text style={styles.rxPlaceholder}>📷 اضغط لرفع الوصفة</Text>
          }
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.submitBtn, isLoading && styles.btnDisabled]} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
        {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitBtnText}>إرسال الطلب</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  section: { margin: Spacing.md, marginBottom: 0 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'right' },
  cartRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  cartMed: { fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right' },
  cartQty: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  savedRow: { marginBottom: Spacing.sm },
  savedChip: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: Spacing.md, marginEnd: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  savedChipActive: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  savedChipText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  savedChipTextActive: { color: Colors.primary, fontWeight: FontWeight.medium },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right' },
  rxBtn: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  rxPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  rxPlaceholder: { color: Colors.textHint, fontSize: FontSize.md },
  submitBtn: { margin: Spacing.lg, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', elevation: 3, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnDisabled: { opacity: 0.65 },
  submitBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.lg },
});
