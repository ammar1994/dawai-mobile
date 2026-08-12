import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useAuthStore }    from '../../store/auth.store';
import { usePharmacyStore } from '../../store/pharmacy.store';
import { useOrdersStore }  from '../../store/orders.store';
import { getCurrentLocation, requestLocationPermission } from '../../utils/location';
import { formatDistance, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/format';

export function HomeScreen() {
  const navigation      = useNavigation<any>();
  const user            = useAuthStore(s => s.user);
  const { pharmacies, isLoading: pharmLoading, fetchNearby } = usePharmacyStore();
  const { orders, isLoading: ordersLoading, fetchOrders }    = useOrdersStore();

  const isLoading = pharmLoading || ordersLoading;

  async function loadData() {
    await fetchOrders();
    const ok = await requestLocationPermission();
    if (ok) {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        await fetchNearby(latitude, longitude);
      } catch { /* GPS unavailable */ }
    }
  }

  useEffect(() => { loadData(); }, []);

  const nearestPharmacy = pharmacies.find(p => p.isActive) ?? pharmacies[0];
  const lastOrder       = orders[0];

  const QUICK_ACTIONS = [
    { icon: '🏥', label: 'الصيدليات',  onPress: () => navigation.navigate('Pharmacies') },
    { icon: '📦', label: 'طلباتي',     onPress: () => navigation.navigate('Orders') },
    { icon: '📄', label: 'الوصفات',    onPress: () => navigation.navigate('Prescriptions') },
    { icon: '⏰', label: 'تذكيراتي',  onPress: () => navigation.navigate('More', { screen: 'Reminders' }) },
    { icon: '❤️', label: 'المفضلة',    onPress: () => navigation.navigate('More', { screen: 'Favorites' }) },
    { icon: '👤', label: 'حسابي',      onPress: () => navigation.navigate('More', { screen: 'Profile' }) },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={Colors.primary} />
      }
    >
      {/* Greeting Header */}
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.navigate('More', { screen: 'Profile' })}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '؟'}
            </Text>
          </TouchableOpacity>
          <View style={styles.greetBox}>
            <Text style={styles.greeting}>مرحباً 👋</Text>
            <Text style={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : '...'}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSub}>ماذا تحتاج اليوم؟</Text>
      </LinearGradient>

      {/* Nearest Pharmacy Card */}
      {nearestPharmacy && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أقرب صيدلية</Text>
          <TouchableOpacity
            style={styles.pharmacyCard}
            onPress={() => navigation.navigate('Pharmacies', {
              screen: 'PharmacyDetail',
              params: { pharmacyId: nearestPharmacy.id },
            })}
            activeOpacity={0.85}
          >
            <View style={styles.pharmacyInfo}>
              <View style={[styles.activeDot, { backgroundColor: nearestPharmacy.isActive ? Colors.success : Colors.textHint }]} />
              <View style={styles.pharmacyText}>
                <Text style={styles.pharmacyName}>{nearestPharmacy.tenant.name}</Text>
                <Text style={styles.pharmacyBranch}>{nearestPharmacy.name}</Text>
                {nearestPharmacy.address && (
                  <Text style={styles.pharmacyAddress} numberOfLines={1}>{nearestPharmacy.address}</Text>
                )}
              </View>
            </View>
            <View style={styles.pharmacyRight}>
              {nearestPharmacy.distanceKm != null && (
                <Text style={styles.distance}>{formatDistance(nearestPharmacy.distanceKm)}</Text>
              )}
              <Text style={styles.arrow}>←</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Last Order */}
      {lastOrder && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر طلب</Text>
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('Orders', {
              screen: 'OrderDetail',
              params: { orderId: lastOrder.id },
            })}
            activeOpacity={0.85}
          >
            <View style={styles.orderInfo}>
              <Text style={styles.orderBranch}>{lastOrder.branch.name}</Text>
              <Text style={styles.orderItems}>
                {lastOrder.items.length} {lastOrder.items.length === 1 ? 'منتج' : 'منتجات'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS_COLOR[lastOrder.status] + '22' }]}>
              <Text style={[styles.statusText, { color: ORDER_STATUS_COLOR[lastOrder.status] }]}>
                {ORDER_STATUS_LABEL[lastOrder.status]}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اختصارات</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container    : { flex: 1, backgroundColor: Colors.background },
  content      : { paddingBottom: Spacing.xxl },
  header       : { paddingTop: 52, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  headerTop    : { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar       : {
    width           : 44,
    height          : 44,
    borderRadius    : 22,
    backgroundColor : 'rgba(255,255,255,0.25)',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginEnd       : Spacing.md,
  },
  avatarText   : { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  greetBox     : { flex: 1, alignItems: 'flex-end' },
  greeting     : { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  userName     : { color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  headerSub    : { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, textAlign: 'right' },

  section      : { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  sectionTitle : { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'right' },

  pharmacyCard : {
    backgroundColor : Colors.surface,
    borderRadius    : Radius.lg,
    padding         : Spacing.md,
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    elevation       : 2,
    shadowColor     : Colors.secondary,
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.06,
    shadowRadius    : 8,
  },
  pharmacyInfo : { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  activeDot    : { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginEnd: Spacing.sm },
  pharmacyText : { flex: 1, alignItems: 'flex-end' },
  pharmacyName : { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  pharmacyBranch: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  pharmacyAddress: { fontSize: FontSize.xs, color: Colors.textHint, textAlign: 'right', marginTop: 2 },
  pharmacyRight: { alignItems: 'center', marginStart: Spacing.sm },
  distance     : { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  arrow        : { fontSize: FontSize.lg, color: Colors.textHint },

  orderCard    : {
    backgroundColor : Colors.surface,
    borderRadius    : Radius.lg,
    padding         : Spacing.md,
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    elevation       : 2,
    shadowColor     : Colors.secondary,
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.06,
    shadowRadius    : 8,
  },
  orderInfo    : { alignItems: 'flex-end' },
  orderBranch  : { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  orderItems   : { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  statusBadge  : { borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 12 },
  statusText   : { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  actionsGrid  : { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard   : {
    backgroundColor : Colors.surface,
    borderRadius    : Radius.lg,
    width           : '30.5%',
    aspectRatio     : 1,
    justifyContent  : 'center',
    alignItems      : 'center',
    elevation       : 2,
    shadowColor     : Colors.secondary,
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.06,
    shadowRadius    : 8,
  },
  actionIcon   : { fontSize: 28, marginBottom: Spacing.xs },
  actionLabel  : { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});
