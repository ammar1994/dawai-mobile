import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';
import type { Order } from '../../types';
import { formatDate, formatPrice } from '../../utils/format';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

interface Props {
  order      : Order;
  onPress    : () => void;
  onReorder? : () => void;
}

export default function OrderCard({ order, onPress, onReorder }: Props) {
  return (
    <Card style={styles.card} padded={false}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.inner}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orderId}>طلب #{order.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.pharmacyRow}>
            <Icon name="pharmacy" size={14} color={Colors.textHint} />
            <Text style={styles.pharmacyName} numberOfLines={1}>{order.branch.name}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.total}>{formatPrice(order.totalAmount)}</Text>
            {onReorder ? (
              <TouchableOpacity onPress={onReorder} style={styles.reorderBtn}>
                <Icon name="refresh" size={14} color={Colors.primary} />
                <Text style={styles.reorderText}>إعادة</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card       : { marginBottom: Spacing.sm },
  inner      : { padding: Spacing.md },
  header     : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId    : { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  date       : { fontSize: FontSize.xs, color: Colors.textHint, marginTop: 2 },
  divider    : { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  footer     : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pharmacyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  pharmacyName: { fontSize: FontSize.sm, color: Colors.textSecondary, writingDirection: 'rtl', flex: 1 },
  right      : { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  total      : { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  reorderBtn : { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryGlow, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  reorderText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
});
