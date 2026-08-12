import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useOrdersStore } from '../../store/orders.store';
import { formatDateTime, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, formatPrice } from '../../utils/format';

export function OrderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;
  const { selected: order, isLoading, fetchById, cancelOrder } = useOrdersStore();

  useEffect(() => {
    fetchById(orderId);
    // ─── Polling: تحديث الحالة كل 30 ثانية ──────────────
    const interval = setInterval(() => {
      fetchById(orderId);
    }, 30000);
    return () => clearInterval(interval); // cleanup إلزامي
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (isLoading || !order) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  const color = ORDER_STATUS_COLOR[order.status];
  const canCancel = order.status === 'PENDING' || order.status === 'RECEIVED';

  function handleCancel() {
    Alert.alert('إلغاء الطلب', 'هل أنت متأكد من إلغاء هذا الطلب؟', [
      { text: 'لا' },
      { text: 'نعم، إلغاء', style: 'destructive', onPress: async () => {
        try { await cancelOrder(order.id); Toast.show({ type: 'success', text1: 'تم إلغاء الطلب' }); }
        catch { Toast.show({ type: 'error', text1: 'فشل الإلغاء' }); }
      }},
    ]);
  }

  const STEPS = ['PENDING','RECEIVED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED'];
  const currentStep = STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>تفاصيل الطلب</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.statusText, { color }]}>{ORDER_STATUS_LABEL[order.status]}</Text>
        </View>
        <Text style={styles.branchName}>{order.branch.name}</Text>
        {order.branch.address && <Text style={styles.branchAddress}>{order.branch.address}</Text>}
        <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
      </View>

      {/* Progress Bar */}
      {order.status !== 'CANCELLED' && (
        <View style={styles.progress}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <View style={[styles.dot, i <= currentStep && { backgroundColor: color }]} />
              {i < STEPS.length - 1 && <View style={[styles.line, i < currentStep && { backgroundColor: color }]} />}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الأصناف</Text>
        {order.items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemPrice}>{item.price > 0 ? formatPrice(item.price) : '—'}</Text>
            <Text style={styles.itemName}>{item.medicineName} ×{item.quantity}</Text>
          </View>
        ))}
        {order.totalAmount > 0 && (
          <View style={[styles.itemRow, styles.totalRow]}>
            <Text style={styles.totalAmount}>{formatPrice(order.totalAmount)}</Text>
            <Text style={styles.totalLabel}>الإجمالي</Text>
          </View>
        )}
      </View>

      {/* Delivery */}
      {order.deliveryAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عنوان التسليم</Text>
          <Text style={styles.address}>{order.deliveryAddress}</Text>
        </View>
      )}
      {order.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملاحظات</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      )}

      {/* Payment */}
      {order.paymentStatus === 'UNPAID' && order.totalAmount > 0 && (
        <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('Payment', { orderId: order.id })} activeOpacity={0.85}>
          <Text style={styles.payBtnText}>💳 الدفع الآن — {formatPrice(order.totalAmount)}</Text>
        </TouchableOpacity>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
          <Text style={styles.cancelBtnText}>إلغاء الطلب</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statusCard: { margin: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'flex-end', elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  statusBadge: { borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 14, marginBottom: Spacing.sm },
  statusText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  branchName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  branchAddress: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'right' },
  date: { color: Colors.textHint, fontSize: FontSize.sm, marginTop: 4 },
  progress: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  line: { flex: 1, height: 2, backgroundColor: Colors.border },
  section: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, color: Colors.textHint, fontWeight: FontWeight.medium, textAlign: 'right', marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  itemName: { fontSize: FontSize.md, color: Colors.textPrimary, textAlign: 'right', flex: 1 },
  itemPrice: { color: Colors.textSecondary, fontSize: FontSize.sm },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  totalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  totalAmount: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  address: { color: Colors.textPrimary, fontSize: FontSize.md, textAlign: 'right' },
  notes: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'right' },
  payBtn: { margin: Spacing.md, backgroundColor: Colors.success, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', elevation: 3 },
  payBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  cancelBtn: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, alignItems: 'center', borderWidth: 1, borderColor: Colors.error },
  cancelBtnText: { color: Colors.error, fontWeight: FontWeight.medium, fontSize: FontSize.md },
});
