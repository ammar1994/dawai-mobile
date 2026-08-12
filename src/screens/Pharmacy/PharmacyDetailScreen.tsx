import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { usePharmacyStore } from '../../store/pharmacy.store';
import { useFavoritesStore } from '../../store/favorites.store';
import { formatDistance } from '../../utils/format';

export function PharmacyDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pharmacyId } = route.params;
  const { selected: pharmacy, isLoading, fetchById } = usePharmacyStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  useEffect(() => { fetchById(pharmacyId); }, [pharmacyId]);

  if (isLoading || !pharmacy) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  const fav = isFavorite(pharmacy.id);

  function callPharmacy() {
    if (pharmacy?.phone) Linking.openURL(`tel:${pharmacy.phone}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { toggleFavorite(pharmacy); Toast.show({ type: 'success', text1: fav ? 'أُزيلت من المفضلة' : 'أُضيفت للمفضلة ❤️' }); }}
          style={styles.favBtn}
        >
          <Text style={styles.favIcon}>{fav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={[styles.statusBadge, { backgroundColor: pharmacy.isActive ? Colors.successLight : Colors.surfaceAlt }]}>
          <Text style={[styles.statusText, { color: pharmacy.isActive ? Colors.success : Colors.textHint }]}>
            {pharmacy.isActive ? '● نشط' : '● غير نشط'}
          </Text>
        </View>
        <Text style={styles.tenantName}>{pharmacy.tenant.name}</Text>
        <Text style={styles.branchName}>{pharmacy.name}</Text>
        {pharmacy.distanceKm != null && (
          <Text style={styles.distance}>📍 {formatDistance(pharmacy.distanceKm)}</Text>
        )}
      </View>

      {/* Details */}
      {pharmacy.address && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>العنوان</Text>
          <Text style={styles.detailValue}>{pharmacy.address}</Text>
        </View>
      )}
      {pharmacy.phone && (
        <TouchableOpacity style={styles.detailRow} onPress={callPharmacy}>
          <Text style={styles.detailLabel}>الهاتف</Text>
          <Text style={[styles.detailValue, { color: Colors.primary }]}>{pharmacy.phone}</Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={() => navigation.navigate('Cart', { pharmacyId: pharmacy.id })}
          activeOpacity={0.85}
        >
          <Text style={styles.orderBtnText}>🛒 اطلب من هذه الصيدلية</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: Spacing.xs },
  backIcon: { fontSize: FontSize.lg, color: Colors.primary },
  favBtn: { padding: Spacing.xs },
  favIcon: { fontSize: 24 },
  infoCard: { margin: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'flex-end', elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  statusBadge: { borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 12, marginBottom: Spacing.sm },
  statusText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  tenantName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right' },
  branchName: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'right', marginBottom: Spacing.sm },
  distance: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  detailRow: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textHint },
  detailValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, textAlign: 'right', flex: 1, marginStart: Spacing.sm },
  actions: { margin: Spacing.md },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', elevation: 3, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  orderBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
