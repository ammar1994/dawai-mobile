import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Loader, Card, Badge } from '@components/ui';
import { ordersApi } from '@api/services';
import { COLORS, FONTS, SPACING, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@constants/config';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total?: number;
  createdAt: string;
  branch?: { name: string };
  itemsCount?: number;
}

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await ordersApi.list();
      setOrders(res.data.orders ?? res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>طلباتي</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('Pharmacies')}
        >
          <Ionicons name="add" size={20} color={COLORS.textPrimary} />
          <Text style={styles.newBtnText}>طلب جديد</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
          <Text style={styles.emptyText}>اطلب أدويتك من أقرب صيدلية</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Pharmacies')}
          >
            <Text style={styles.emptyBtnText}>ابدأ طلباً</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.orderNum}>#{item.orderNumber}</Text>
                    {item.branch && (
                      <Text style={styles.branchName}>{item.branch.name}</Text>
                    )}
                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Badge
                      label={ORDER_STATUS_LABELS[item.status] ?? item.status}
                      color={ORDER_STATUS_COLORS[item.status] ?? COLORS.textMuted}
                    />
                    {item.total != null && (
                      <Text style={styles.total}>{item.total} ر.س</Text>
                    )}
                    <Ionicons name="chevron-back" size={16} color={COLORS.textMuted} style={{ marginTop: 4 }} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: '700' },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  newBtnText: { color: COLORS.textPrimary, fontSize: FONTS.size.sm, fontWeight: '600' },
  card: { marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNum: { color: COLORS.textPrimary, fontSize: FONTS.size.md, fontWeight: '700' },
  branchName: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 2 },
  date: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 4 },
  total: { color: COLORS.primary, fontSize: FONTS.size.md, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: '700', marginTop: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    borderRadius: 24, marginTop: SPACING.md,
  },
  emptyBtnText: { color: COLORS.textPrimary, fontWeight: '700' },
});
