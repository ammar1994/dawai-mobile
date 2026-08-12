import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useOrdersStore } from '../../store/orders.store';
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/format';
import type { Order } from '../../types';

export function OrdersListScreen() {
  const navigation = useNavigation<any>();
  const { orders, isLoading, fetchOrders, clearCart, addToCart } = useOrdersStore();

  useEffect(() => { fetchOrders(); }, []);

  // ─── إعادة الطلب ♻️ ─────────────────────────────────────
  function handleReorder(order: Order) {
    if (!order.items || order.items.length === 0) {
      Toast.show({ type: 'info', text1: 'الطلب لا يحتوي على أصناف' });
      return;
    }

    Alert.alert(
      'إعادة الطلب ♻️',
      `إضافة ${order.items.length} صنف من طلب "${order.branch.name}" للسلة؟`,
      [
        { text: 'إلغاء' },
        {
          text    : 'نعم، أعد الطلب',
          onPress : () => {
            clearCart();
            order.items.forEach(item => {
              addToCart({ medicineName: item.medicineName, quantity: item.quantity });
            });
            Toast.show({ type: 'success', text1: '✅ تمت إضافة الأصناف للسلة' });
            navigation.navigate('Cart', { pharmacyId: order.branch.id });
          },
        },
      ],
    );
  }

  // ─── بطاقة الطلب ─────────────────────────────────────────
  function renderItem({ item }: { item: Order }) {
    const color    = ORDER_STATUS_COLOR[item.status];
    const isDone   = item.status === 'DELIVERED' || item.status === 'CANCELLED';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        activeOpacity={0.85}
      >
        {/* الصف العلوي: الحالة + اسم الصيدلية */}
        <View style={styles.cardTop}>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.badgeText, { color }]}>{ORDER_STATUS_LABEL[item.status]}</Text>
          </View>
          <Text style={styles.branchName} numberOfLines={1}>{item.branch.name}</Text>
        </View>

        {/* الصف السفلي: التاريخ + عدد الأصناف + زر إعادة */}
        <View style={styles.cardBottom}>
          {/* زر ♻️ إعادة الطلب — يظهر فقط للطلبات المكتملة أو الملغاة */}
          {isDone && (
            <TouchableOpacity
              style={styles.reorderBtn}
              onPress={() => handleReorder(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.reorderText}>♻️ إعادة</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.itemCount}>
            {item.items.length} {item.items.length === 1 ? 'صنف' : 'أصناف'}
          </Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>طلباتي</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchOrders} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
            : (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>لا توجد طلبات حتى الآن</Text>
              </View>
            )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container  : { flex: 1, backgroundColor: Colors.background },
  header     : {
    paddingTop        : 52,
    paddingHorizontal : Spacing.md,
    paddingBottom     : Spacing.md,
    backgroundColor   : Colors.surface,
    borderBottomWidth : 1,
    borderBottomColor : Colors.border,
  },
  title      : {
    fontSize   : FontSize.xl,
    fontWeight : FontWeight.bold,
    color      : Colors.textPrimary,
    textAlign  : 'right',
  },
  list       : { padding: Spacing.md, gap: Spacing.sm },
  card       : {
    backgroundColor : Colors.surface,
    borderRadius    : Radius.lg,
    padding         : Spacing.md,
    elevation       : 2,
    shadowColor     : Colors.secondary,
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.06,
    shadowRadius    : 8,
  },
  cardTop    : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
    marginBottom   : Spacing.sm,
  },
  branchName : {
    fontSize   : FontSize.md,
    fontWeight : FontWeight.semibold,
    color      : Colors.textPrimary,
    textAlign  : 'right',
    flex       : 1,
    marginStart: Spacing.sm,
  },
  badge      : { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText  : { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  cardBottom : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
  },
  reorderBtn : {
    backgroundColor : Colors.primaryGlow,
    borderRadius    : Radius.sm,
    paddingVertical : 4,
    paddingHorizontal: Spacing.sm,
    borderWidth     : 1,
    borderColor     : Colors.primaryLight,
  },
  reorderText: {
    fontSize   : FontSize.xs,
    color      : Colors.primary,
    fontWeight : FontWeight.semibold,
  },
  date       : { color: Colors.textHint, fontSize: FontSize.sm },
  itemCount  : { color: Colors.textSecondary, fontSize: FontSize.sm },
  empty      : { alignItems: 'center', marginTop: 64 },
  emptyIcon  : { fontSize: 48, marginBottom: Spacing.md },
  emptyText  : { color: Colors.textSecondary, fontSize: FontSize.md },
});
