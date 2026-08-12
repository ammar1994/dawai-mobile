import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';
import type { Pharmacy } from '../../types';
import Card from './Card';

interface Props {
  pharmacy    : Pharmacy;
  isFavorite? : boolean;
  onPress     : () => void;
  onFavorite? : () => void;
  onOrder?    : () => void;
}

export default function PharmacyCard({ pharmacy, isFavorite, onPress, onFavorite, onOrder }: Props) {
  return (
    <Card style={styles.card} padded={false}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.inner}>
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: pharmacy.isActive ? Colors.primaryGlow : Colors.surfaceAlt }]}>
          <Icon
            name="pharmacy"
            size={28}
            color={pharmacy.isActive ? Colors.primary : Colors.textHint}
          />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{pharmacy.tenant.name}</Text>
          {pharmacy.name !== pharmacy.tenant.name ? (
            <Text style={styles.branch} numberOfLines={1}>{pharmacy.name}</Text>
          ) : null}
          {pharmacy.address ? (
            <Text style={styles.address} numberOfLines={1}>{pharmacy.address}</Text>
          ) : null}
          <View style={styles.meta}>
            {pharmacy.distanceKm !== undefined ? (
              <View style={styles.metaItem}>
                <Icon name="map-marker" size={12} color={Colors.textHint} />
                <Text style={styles.metaText}>{pharmacy.distanceKm.toFixed(1)} كم</Text>
              </View>
            ) : null}
            <View style={[styles.badge, { backgroundColor: pharmacy.isActive ? Colors.successLight : Colors.surfaceAlt }]}>
              <Text style={[styles.badgeText, { color: pharmacy.isActive ? Colors.success : Colors.textHint }]}>
                {pharmacy.isActive ? 'نشط' : 'غير نشط'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onFavorite ? (
            <TouchableOpacity onPress={onFavorite} style={styles.actionBtn}>
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? Colors.primary : Colors.textHint}
              />
            </TouchableOpacity>
          ) : null}
          {onOrder ? (
            <TouchableOpacity onPress={onOrder} style={[styles.actionBtn, styles.orderBtn]}>
              <Icon name="cart-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card      : { marginBottom: Spacing.sm },
  inner     : { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  iconBox   : { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginEnd: Spacing.md },
  info      : { flex: 1 },
  name      : { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, writingDirection: 'rtl' },
  branch    : { fontSize: FontSize.sm, color: Colors.textSecondary, writingDirection: 'rtl', marginTop: 2 },
  address   : { fontSize: FontSize.xs, color: Colors.textHint, marginTop: 2, writingDirection: 'rtl' },
  meta      : { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, gap: Spacing.sm },
  metaItem  : { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaText  : { fontSize: FontSize.xs, color: Colors.textHint },
  badge     : { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeText : { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  actions   : { alignItems: 'center', gap: Spacing.sm },
  actionBtn : { padding: Spacing.xs },
  orderBtn  : { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.sm },
});
