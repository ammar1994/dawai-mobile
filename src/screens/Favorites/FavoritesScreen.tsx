import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useFavoritesStore } from '../../store/favorites.store';
import { formatDistance } from '../../utils/format';
import type { Pharmacy } from '../../types';

export function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { favorites, loadFavorites, removeFavorite } = useFavoritesStore();

  useEffect(() => { loadFavorites(); }, []);

  function renderItem({ item }: { item: Pharmacy }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Pharmacies', { screen: 'PharmacyDetail', params: { pharmacyId: item.id } })} activeOpacity={0.85}>
        <TouchableOpacity onPress={() => removeFavorite(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.heartIcon}>❤️</Text>
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.tenantName}>{item.tenant.name}</Text>
          <Text style={styles.branchName}>{item.name}</Text>
          {item.distanceKm != null && <Text style={styles.distance}>{formatDistance(item.distanceKm)}</Text>}
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={() => navigation.navigate('Pharmacies', { screen: 'Cart', params: { pharmacyId: item.id } })}>
          <Text style={styles.orderBtnText}>اطلب</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>صيدلياتي المفضلة</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={favorites}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>❤️</Text><Text style={styles.emptyText}>لا توجد مفضلة — أضف صيدليات من قائمة الصيدليات</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  heartIcon: { fontSize: 22, marginEnd: Spacing.sm },
  info: { flex: 1, alignItems: 'flex-end' },
  tenantName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  branchName: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  distance: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  orderBtn: { marginStart: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: Spacing.md },
  orderBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  empty: { alignItems: 'center', marginTop: 64, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
});
