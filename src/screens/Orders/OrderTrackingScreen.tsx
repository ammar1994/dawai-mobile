import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useOrdersStore } from '../../store/orders.store';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { OrdersStackParamList, OrderStatus } from '../../types';

type Route = RouteProp<OrdersStackParamList, 'OrderTracking'>;

// ─── Status Steps ─────────────────────────────────────────────────────────────
const STEPS: { key: OrderStatus; label: string; icon: string; desc: string }[] = [
  { key: 'PENDING',          label: 'تم الإرسال',       icon: '📤', desc: 'وصل طلبك للصيدلية' },
  { key: 'RECEIVED',         label: 'تم الاستلام',      icon: '👀', desc: 'الصيدلية تراجع طلبك' },
  { key: 'PREPARING',        label: 'قيد التجهيز',      icon: '⚗️',  desc: 'يتم تجهيز طلبك الآن' },
  { key: 'READY',            label: 'جاهز',             icon: '✅',  desc: 'جاهز للاستلام أو التوصيل' },
  { key: 'OUT_FOR_DELIVERY', label: 'في الطريق إليك',   icon: '🛵',  desc: 'المندوب في الطريق' },
  { key: 'DELIVERED',        label: 'تم التسليم',       icon: '🎉',  desc: 'تم استلام طلبك بنجاح' },
];

const STATUS_ORDER = STEPS.map(s => s.key);

function getStepIndex(status: OrderStatus) {
  if (status === 'CANCELLED') return -1;
  return STATUS_ORDER.indexOf(status);
}

// ─── Step Row ─────────────────────────────────────────────────────────────────
function StepRow({ step, index, currentIndex }: {
  step: typeof STEPS[0]; index: number; currentIndex: number;
}) {
  const isDone    = index <= currentIndex;
  const isCurrent = index === currentIndex;

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepLeft}>
        <View style={[
          styles.stepCircle,
          isDone    && styles.stepDone,
          isCurrent && styles.stepCurrent,
        ]}>
          <Text style={[styles.stepIcon, isDone && styles.stepIconDone]}>{step.icon}</Text>
        </View>
        {index < STEPS.length - 1 && (
          <View style={[styles.stepLine, isDone && index < currentIndex && styles.stepLineDone]} />
        )}
      </View>
      <View style={styles.stepRight}>
        <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}>{step.label}</Text>
        {isCurrent && <Text style={styles.stepDesc}>{step.desc}</Text>}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function OrderTrackingScreen() {
  const route = useRoute<Route>();
  const nav   = useNavigation();
  const { activeOrder, isLoading, fetchOrder, cancelOrder } = useOrdersStore();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder(route.params.orderId);
    // Poll every 15s while screen is active
    const interval = setInterval(() => fetchOrder(route.params.orderId), 15_000);
    return () => clearInterval(interval);
  }, [route.params.orderId]);

  const handleCancel = () => {
    Alert.alert('إلغاء الطلب', 'هل أنت متأكد من إلغاء الطلب؟', [
      { text: 'لا', style: 'cancel' },
      {
        text: 'نعم، إلغاء',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          await cancelOrder(route.params.orderId);
          setCancelling(false);
        },
      },
    ]);
  };

  if (isLoading && !activeOrder) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const order = activeOrder;
  if (!order) return null;

  const isCancelled  = order.status === 'CANCELLED';
  const canCancel    = ['PENDING', 'RECEIVED'].includes(order.status);
  const currentIndex = getStepIndex(order.status as OrderStatus);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تتبع الطلب</Text>
        <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pharmacy */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>الصيدلية</Text>
          <Text style={styles.pharmacyName}>{(order as any).branch?.name ?? '—'}</Text>
          {(order as any).branch?.address && (
            <Text style={styles.pharmacyAddress}>{(order as any).branch.address}</Text>
          )}
          {(order as any).branch?.phone && (
            <Text style={styles.pharmacyPhone}>📞 {(order as any).branch.phone}</Text>
          )}
        </View>

        {/* Status Tracker */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>حالة الطلب</Text>
          {isCancelled ? (
            <View style={styles.cancelledBanner}>
              <Text style={styles.cancelledText}>❌ تم إلغاء هذا الطلب</Text>
            </View>
          ) : (
            STEPS.map((step, i) => (
              <StepRow key={step.key} step={step} index={i} currentIndex={currentIndex} />
            ))
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>المنتجات</Text>
          {(order.items ?? []).map((item: any, i: number) => (
            <View key={i} style={styles.item}>
              <Text style={styles.itemName}>{item.medicineName}</Text>
              <Text style={styles.itemQty}>× {item.quantity}</Text>
            </View>
          ))}
          {order.notes && (
            <Text style={styles.notes}>📝 {order.notes}</Text>
          )}
        </View>

        {/* Cancel Button */}
        {canCancel && !isCancelled && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? <ActivityIndicator color={Colors.error} />
              : <Text style={styles.cancelBtnText}>إلغاء الطلب</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: Spacing.base, flexDirection: 'row', alignItems: 'center' },
  backBtn:        { marginEnd: Spacing.sm },
  backIcon:       { fontSize: 22, color: Colors.white, fontWeight: '700' },
  headerTitle:    { flex: 1, fontSize: Typography.lg, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  orderId:        { fontSize: Typography.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  content:        { padding: Spacing.base, gap: Spacing.md, paddingBottom: 40 },
  card:           { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  sectionTitle:   { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'right' },
  pharmacyName:   { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, textAlign: 'right' },
  pharmacyAddress:{ fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'right', marginTop: 4 },
  pharmacyPhone:  { fontSize: Typography.sm, color: Colors.primary, textAlign: 'right', marginTop: 4 },
  cancelledBanner:{ backgroundColor: Colors.error + '15', borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center' },
  cancelledText:  { fontSize: Typography.base, color: Colors.error, fontWeight: '700' },
  stepRow:        { flexDirection: 'row', marginBottom: 0 },
  stepLeft:       { alignItems: 'center', marginEnd: Spacing.md },
  stepCircle:     { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border },
  stepDone:       { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  stepCurrent:    { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  stepIcon:       { fontSize: 16 },
  stepIconDone:   {},
  stepLine:       { width: 2, flex: 1, backgroundColor: Colors.border, minHeight: 24, marginVertical: 2 },
  stepLineDone:   { backgroundColor: Colors.primary },
  stepRight:      { flex: 1, paddingBottom: Spacing.base },
  stepLabel:      { fontSize: Typography.base, fontWeight: '600', color: Colors.textSecondary, textAlign: 'right' },
  stepLabelCurrent:{ color: Colors.primary, fontWeight: '700' },
  stepDesc:       { fontSize: Typography.sm, color: Colors.textHint, textAlign: 'right', marginTop: 2 },
  item:           { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  itemName:       { fontSize: Typography.base, color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  itemQty:        { fontSize: Typography.base, color: Colors.textSecondary, marginStart: Spacing.sm },
  notes:          { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'right' },
  cancelBtn:      { borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.error, padding: Spacing.base, alignItems: 'center' },
  cancelBtnText:  { color: Colors.error, fontWeight: '700', fontSize: Typography.base },
});
