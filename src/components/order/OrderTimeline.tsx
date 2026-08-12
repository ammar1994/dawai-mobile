import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';
import type { OrderStatus } from '../../types';

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'PENDING',          label: 'في الانتظار',   icon: 'clock-outline'        },
  { status: 'RECEIVED',         label: 'تم الاستلام',   icon: 'check-circle-outline' },
  { status: 'PREPARING',        label: 'قيد التحضير',   icon: 'pill'                 },
  { status: 'READY',            label: 'جاهز',           icon: 'package-variant'      },
  { status: 'OUT_FOR_DELIVERY', label: 'في الطريق',     icon: 'moped'                },
  { status: 'DELIVERED',        label: 'تم التوصيل',    icon: 'home-check-outline'   },
];

interface Props {
  status: OrderStatus;
}

export default function OrderTimeline({ status }: Props) {
  const isCancelled = status === 'CANCELLED';
  const currentIndex = STEPS.findIndex(s => s.status === status);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isDone    = !isCancelled && index < currentIndex;
        const isActive  = !isCancelled && index === currentIndex;
        const isFuture  = isCancelled ? true : index > currentIndex;

        const circleColor = isDone || isActive ? Colors.primary : Colors.border;
        const iconColor   = isDone || isActive ? Colors.white   : Colors.textHint;
        const lineColor   = isDone ? Colors.primary : Colors.border;

        return (
          <View key={step.status} style={styles.stepRow}>
            {/* Line above (except first) */}
            {index > 0 && <View style={[styles.line, { backgroundColor: lineColor }]} />}

            <View style={styles.stepContent}>
              {/* Circle */}
              <View style={[styles.circle, { backgroundColor: circleColor, borderColor: circleColor }]}>
                {isCancelled && index === currentIndex ? (
                  <Icon name="close" size={14} color={Colors.white} />
                ) : (
                  <Icon name={step.icon} size={14} color={iconColor} />
                )}
              </View>

              {/* Label */}
              <View style={styles.labelBox}>
                <Text style={[
                  styles.label,
                  isActive  && styles.labelActive,
                  isFuture  && !isCancelled && styles.labelFuture,
                  isCancelled && index === currentIndex && styles.labelCancelled,
                ]}>
                  {step.label}
                </Text>
                {isActive && !isCancelled && (
                  <View style={styles.activeDot} />
                )}
              </View>
            </View>
          </View>
        );
      })}

      {/* CANCELLED badge */}
      {isCancelled && (
        <View style={styles.cancelledBadge}>
          <Icon name="close-circle" size={16} color={Colors.error} />
          <Text style={styles.cancelledText}>تم إلغاء الطلب</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container      : { paddingVertical: Spacing.md },
  stepRow        : { alignItems: 'flex-start' },
  line           : { width: 2, height: 28, marginStart: 15, marginVertical: 2 },
  stepContent    : { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  circle         : {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  labelBox       : { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label          : { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, writingDirection: 'rtl' },
  labelActive    : { fontWeight: FontWeight.bold, color: Colors.primary },
  labelFuture    : { color: Colors.textHint },
  labelCancelled : { color: Colors.error, fontWeight: FontWeight.bold },
  activeDot      : { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  cancelledBadge : { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, backgroundColor: Colors.errorLight, borderRadius: 8, padding: Spacing.sm },
  cancelledText  : { color: Colors.error, fontWeight: FontWeight.semibold, fontSize: FontSize.sm, writingDirection: 'rtl' },
});
