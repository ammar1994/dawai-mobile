import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';
import type { OrderStatus } from '../../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING         : { label: 'في الانتظار',    bg: Colors.warningLight, text: Colors.warning  },
  RECEIVED        : { label: 'تم الاستلام',    bg: Colors.infoLight,    text: Colors.info     },
  PREPARING       : { label: 'قيد التحضير',    bg: Colors.infoLight,    text: Colors.info     },
  READY           : { label: 'جاهز',            bg: Colors.successLight, text: Colors.success  },
  OUT_FOR_DELIVERY: { label: 'في الطريق',      bg: Colors.primaryGlow,  text: Colors.primary  },
  DELIVERED       : { label: 'تم التوصيل',     bg: Colors.successLight, text: Colors.success  },
  CANCELLED       : { label: 'ملغي',            bg: Colors.errorLight,   text: Colors.error    },
};

interface Props {
  status: OrderStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: Colors.surfaceAlt, text: Colors.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  text : { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, writingDirection: 'rtl' },
});
