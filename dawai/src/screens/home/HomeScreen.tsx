import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, Badge } from '@components/ui';
import { useAuthStore } from '@store/auth.store';
import { ordersApi } from '@api/services';
import { COLORS, SPACING, FONTS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@constants/config';

const ACTIONS = [
  { icon: 'location-outline',    label: 'أقرب صيدلية',  screen: 'Pharmacies',   color: '#2196F3' },
  { icon: 'cart-outline',        label: 'اطلب دواء',    screen: 'NewOrder',     color: COLORS.primary },
  { icon: 'alarm-outline',       label: 'تذكير الدواء', screen: 'Reminders',    color: '#FF9800' },
  { icon: 'document-text-outline', label: 'وصفاتي',     screen: 'Prescriptions',color: '#4CAF50' },
] as const;

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();

  const [orders,      setOrders]      = useState<any[]>([]);
  const [refreshing,  setRefreshing]  = useState(false);

  const loadOrders = async () => {
    try {
      const res = await ordersApi.list({ limit: 3 });
      setOrders(res.data?.data ?? []);
    } catch {}
  };

  useEffect(() => { loadOrders(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.textMuted}/>
        </TouchableOpacity>
      </View>

      {/* Hero card */}
      <Card glow style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroRx}>Rx</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>دوائي — صيدليتك في جيبك</Text>
            <Text style={styles.heroSub}>اطلب أدويتك من أقرب صيدلية وتابع طلبك مباشرة</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>ماذا تريد؟</Text>
      <View style={styles.actions}>
        {ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.screen}
            style={[styles.action, { borderColor: a.color + '33' }]}
            onPress={() => navigation.navigate(a.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}>
              <Ionicons name={a.icon as any} size={26} color={a.color}/>
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>آخر الطلبات</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {orders.map((order: any) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => navigation.navigate('OrderDetail', { id: order.id })}
              activeOpacity={0.8}
            >
              <Card style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <View>
                    <Text style={styles.orderNum}>طلب #{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderBranch}>{order.branch?.name ?? '—'}</Text>
                  </View>
                  <Badge
                    label={ORDER_STATUS_LABELS[order.status] ?? order.status}
                    color={ORDER_STATUS_COLORS[order.status] ?? COLORS.textMuted}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  content:      { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting:     { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  name:         { color: '#fff', fontSize: FONTS.size.xl, fontWeight: '800' },
  logout:       { padding: 8 },
  hero:         { marginBottom: SPACING.lg },
  heroInner:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  heroIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  heroRx:       { color: '#fff', fontSize: 18, fontWeight: '900' },
  heroTitle:    { color: '#fff', fontSize: FONTS.size.md, fontWeight: '700', marginBottom: 4 },
  heroSub:      { color: COLORS.textMuted, fontSize: FONTS.size.xs, lineHeight: 16 },
  sectionTitle: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '700', marginBottom: SPACING.md },
  sectionRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  seeAll:       { color: COLORS.primary, fontSize: FONTS.size.sm },
  actions: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            SPACING.sm,
    marginBottom:   SPACING.lg,
  },
  action: {
    width:           '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius:    16,
    padding:         SPACING.md,
    alignItems:      'center',
    gap:             SPACING.sm,
    borderWidth:     1,
  },
  actionIcon:   { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel:  { color: '#fff', fontSize: FONTS.size.sm, fontWeight: '600' },
  orderCard:    { marginBottom: SPACING.sm },
  orderRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum:     { color: '#fff', fontSize: FONTS.size.md, fontWeight: '700' },
  orderBranch:  { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
});
-e 
export default HomeScreen;
