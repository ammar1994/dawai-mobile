import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { usePharmacyStore } from '../../store/pharmacy.store';
import { useFavoritesStore } from '../../store/favorites.store';
import { getCurrentLocation, requestLocationPermission } from '../../utils/location';
import { formatDistance } from '../../utils/format';
import type { Pharmacy } from '../../types';

export function PharmacyListScreen() {
  const navigation = useNavigation<any>();
  const { pharmacies, isLoading, fetchNearby } = usePharmacyStore();
  const { isFavorite, toggleFavorite, loadFavorites } = useFavoritesStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  async function load() {
    loadFavorites();
    const ok = await requestLocationPermission();
    if (ok) {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        await fetchNearby(latitude, longitude);
      } catch {
        Toast.show({ type: 'error', text1: 'تعذر الحصول على موقعك' });
      }
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = pharmacies.filter(p => {
    const matchFilter = filter === 'all' || (filter === 'active' ? p.isActive : !p.isActive);
    const matchSearch = search === '' || p.tenant.name.includes(search) || p.name.includes(search);
    return matchFilter && matchSearch;
  });

  function renderItem({ item }: { item: Pharmacy }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => toggleFavorite(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.heart}>{isFavorite(item.id) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <View style={styles.nameBox}>
              <Text style={styles.tenantName}>{item.tenant.name}</Text>
              <Text style={styles.branchName}>{item.name}</Text>
            </View>
          </View>
          {item.address && <Text style={styles.address} numberOfLines={1}>{item.address}</Text>}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.orderBtn}
              onPress={() => navigation.navigate('Cart', { pharmacyId: item.id })}
            >
              <Text style={styles.orderBtnText}>اطلب الآن</Text>
            </TouchableOpacity>
            <View style={styles.meta}>
              {item.distanceKm != null && <Text style={styles.distance}>{formatDistance(item.distanceKm)}</Text>}
              <View style={[styles.statusBadge, { backgroundColor: item.isActive ? Colors.successLight : Colors.surfaceAlt }]}>
                <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.textHint }]}>
                  {item.isActive ? 'نشط' : 'غير نشط'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>الصيدليات القريبة</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PharmacyMap')} style={styles.mapBtn}>
          <Text style={styles.mapBtnText}>🗺️ الخريطة</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن صيدلية..."
          placeholderTextColor={Colors.textHint}
          textAlign="right"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'inactive'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'الكل' : f === 'active' ? 'نشط' : 'غير نشط'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={Colors.primary} />}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} /> :
          <View style={styles.empty}><Text style={styles.emptyIcon}>🏥</Text><Text style={styles.emptyText}>لا توجد صيدليات في المنطقة</Text></View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: 52, paddingBottom: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  mapBtn: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: Spacing.md },
  mapBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  searchBox: { padding: Spacing.md, backgroundColor: Colors.surface },
  searchInput: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm, backgroundColor: Colors.surface },
  filterTab: { flex: 1, paddingVertical: 6, borderRadius: Radius.full, alignItems: 'center', backgroundColor: Colors.surfaceAlt },
  filterTabActive: { backgroundColor: Colors.primaryGlow },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.primary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardContent: { padding: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
  nameBox: { alignItems: 'flex-end', flex: 1, marginEnd: Spacing.sm },
  tenantName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  branchName: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  heart: { fontSize: 20 },
  address: { fontSize: FontSize.xs, color: Colors.textHint, textAlign: 'right', marginBottom: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  distance: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  statusBadge: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: Spacing.md },
  orderBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  empty: { alignItems: 'center', marginTop: 64 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md },
});
