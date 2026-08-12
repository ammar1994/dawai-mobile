import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useOrdersStore } from '../../store/orders.store';
import type { CartItem } from '../../types';

export function CartScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pharmacyId } = route.params;
  const { cart, addToCart, removeFromCart, updateCartItem, clearCart } = useOrdersStore();
  const [newMed, setNewMed] = useState('');
  const [newQty, setNewQty] = useState('1');

  function handleAdd() {
    if (!newMed.trim()) { Toast.show({ type: 'error', text1: 'أدخل اسم الدواء' }); return; }
    const qty = parseInt(newQty, 10);
    if (!qty || qty < 1) { Toast.show({ type: 'error', text1: 'الكمية غير صحيحة' }); return; }
    addToCart({ medicineName: newMed.trim(), quantity: qty });
    setNewMed(''); setNewQty('1');
  }

  function handleNext() {
    if (cart.length === 0) { Toast.show({ type: 'error', text1: 'السلة فارغة' }); return; }
    navigation.navigate('NewOrder', { pharmacyId });
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => Alert.alert('حذف', `حذف ${item.medicineName}؟`, [{ text: 'إلغاء' }, { text: 'حذف', style: 'destructive', onPress: () => removeFromCart(item.medicineName) }])}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartItem(item.medicineName, item.quantity + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartItem(item.medicineName, item.quantity - 1)}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.medName}>{item.medicineName}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>سلة الطلب</Text>
        {cart.length > 0 && <TouchableOpacity onPress={() => Alert.alert('مسح الكل', 'هل تريد مسح السلة؟', [{ text: 'إلغاء' }, { text: 'مسح', style: 'destructive', onPress: clearCart }])}><Text style={styles.clearText}>مسح الكل</Text></TouchableOpacity>}
      </View>

      {/* Add Item */}
      <View style={styles.addBox}>
        <TextInput style={[styles.input, styles.qtyInput]} value={newQty} onChangeText={setNewQty} keyboardType="number-pad" placeholder="الكمية" placeholderTextColor={Colors.textHint} textAlign="center" />
        <TextInput style={[styles.input, { flex: 1 }]} value={newMed} onChangeText={setNewMed} placeholder="اسم الدواء" placeholderTextColor={Colors.textHint} textAlign="right" />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}><Text style={styles.addBtnText}>إضافة</Text></TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={i => i.medicineName}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>🛒</Text><Text style={styles.emptyText}>السلة فارغة — أضف دواءً أعلاه</Text></View>}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.cartCount}>{cart.length} {cart.length === 1 ? 'منتج' : 'منتجات'}</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>متابعة الطلب</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  clearText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  addBox: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary },
  qtyInput: { width: 64 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  addBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  list: { padding: Spacing.md, gap: Spacing.sm },
  item: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  medName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, flex: 1, textAlign: 'right' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryGlow, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  qty: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },
  deleteIcon: { fontSize: 20 },
  empty: { alignItems: 'center', marginTop: 64 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md },
  footer: { padding: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartCount: { color: Colors.textSecondary, fontSize: FontSize.sm },
  nextBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg, elevation: 3 },
  nextBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
