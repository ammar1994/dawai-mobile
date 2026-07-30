import React, { useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrdersStore } from '../../store/orders.store';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { Order, OrdersStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>;

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:          { label: 'بانتظار التأكيد', color: Colors.warning,  icon: '⏳' },
  RECEIVED:         { label: 'تم الاستلام',    color: Colors.info,     icon: '✅' },
  PREPARING:        { label: 'قيد التجهيز',    color: Colors.primary,  icon: '⚗️' },
  READY:            { label: 'جاهز للاستلام',  color: Colors.success,  icon: '🎉' },
  OUT_FOR_DELIVERY: { label: 'في الطريق',      color: Colors.info,     icon: '🛵' },
  DELIVERED:        { label: 'تم التسليم',     color: Colors.success,  icon: '✅' },
  CANCELLED:        { label: 'ملغي',           color: Colors.error,    icon: '❌' },
};

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: Colors.textHint, icon: '📦' };
  const date = new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20' }]}>
          <Text style={styles.statusIcon}>{cfg.icon}</Text>
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>

      <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
      <Text style={styles.pharmacyName}>{(order as any).branch?.name ?? 'الصيدلية'}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>{(order.items?.length ?? 0)} منتج</Text>
        <Text style={styles.total}>
          {order.totalAmount > 0 ? `${order.totalAmount.toFixed(2)} ج.م` : 'سيتم التحديد'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function OrdersListScreen() {
  const nav = useNavigation<Nav>();
  const { orders, isLoading, fetchOrders } = useOrdersStore();

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = useCallback(() => { fetchOrders(); }, []);

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>طلباتي</Text>
        <Text style={styles.subtitle}>{orders.length} طلب</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => nav.navigate('OrderTracking', { orderId: item.id })}
          />
        )}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptyHint}>اطلب دواءك من أقرب صيدلية</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 20, paddingHorizontal: Spacing.base, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title:          { fontSize: Typography.xl, fontWeight: '700', color: Colors.white },
  subtitle:       { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)' },
  list:           { padding: Spacing.base, gap: Spacing.md },
  emptyContainer: { flex: 1 },
  card:           { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.base, ...Shadow.sm },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  statusIcon:     { fontSize: 13 },
  statusLabel:    { fontSize: Typography.xs, fontWeight: '600' },
  date:           { fontSize: Typography.xs, color: Colors.textHint },
  orderId:        { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 2, textAlign: 'right' },
  pharmacyName:   { fontSize: Typography.md, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right', marginBottom: Spacing.sm },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  itemCount:      { fontSize: Typography.sm, color: Colors.textSecondary },
  total:          { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyIcon:      { fontSize: 64, marginBottom: Spacing.base },
  emptyTitle:     { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptyHint:      { fontSize: Typography.base, color: Colors.textSecondary },
});
