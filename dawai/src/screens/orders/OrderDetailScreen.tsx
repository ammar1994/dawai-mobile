import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Badge, Loader } from '@components/ui';
import { ordersApi } from '@api/services';
import { COLORS, SPACING, FONTS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@constants/config';

const STEPS = [
  { status: 'PENDING',          icon: 'time-outline',          label: 'في الانتظار' },
  { status: 'RECEIVED',         icon: 'checkmark-circle-outline', label: 'تم الاستلام' },
  { status: 'PREPARING',        icon: 'construct-outline',     label: 'جاري التحضير' },
  { status: 'READY',            icon: 'bag-check-outline',     label: 'جاهز' },
  { status: 'OUT_FOR_DELIVERY', icon: 'bicycle-outline',       label: 'في الطريق' },
  { status: 'DELIVERED',        icon: 'home-outline',          label: 'تم التسليم' },
];

export function OrderDetailScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const id         = route.params?.id;

  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      const res = await ordersApi.get(id);
      setOrder(res.data?.data ?? res.data);
    } catch {
      Alert.alert('خطأ', 'تعذر جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
    // Poll every 30 seconds for live tracking
    const timer = setInterval(loadOrder, 30000);
    return () => clearInterval(timer);
  }, [loadOrder]);

  const handleCancel = async () => {
    Alert.alert('إلغاء الطلب', 'هل أنت متأكد؟', [
      { text: 'لا', style: 'cancel' },
      {
        text: 'نعم، إلغاء', style: 'destructive',
        onPress: async () => {
          try {
            await ordersApi.cancel(id);
            loadOrder();
          } catch { Alert.alert('خطأ', 'تعذر إلغاء الطلب'); }
        },
      },
    ]);
  };

  if (loading || !order) return <Loader text="جاري تحميل الطلب..." />;

  const currentIdx = STEPS.findIndex(s => s.status === order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>تتبع الطلب</Text>
        <TouchableOpacity onPress={loadOrder}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Order ID + status */}
      <Card glow style={styles.statusCard}>
        <Text style={styles.orderId}>طلب #{id.slice(-8).toUpperCase()}</Text>
        <Badge
          label={ORDER_STATUS_LABELS[order.status] ?? order.status}
          color={ORDER_STATUS_COLORS[order.status] ?? COLORS.textMuted}
        />
        <Text style={styles.pharmacy}>{order.branch?.name}</Text>
      </Card>

      {/* Progress stepper */}
      {order.status !== 'CANCELLED' && (
        <Card style={styles.stepperCard}>
          <Text style={styles.stepperTitle}>مراحل الطلب</Text>
          {STEPS.map((step, idx) => {
            const done    = idx <= currentIdx;
            const current = idx === currentIdx;
            return (
              <View key={step.status} style={styles.step}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepCircle,
                    done    && styles.stepDone,
                    current && styles.stepCurrent,
                  ]}>
                    <Ionicons
                      name={done ? 'checkmark' : step.icon as any}
                      size={14}
                      color={done ? '#fff' : COLORS.textMuted}
                    />
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.stepLine, done && styles.stepLineDone]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                  {step.label}
                  {current && ' ◀ الآن'}
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      {/* Items */}
      {order.items?.length > 0 && (
        <Card style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>الأدوية</Text>
          {order.items.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Ionicons name="medical-outline" size={16} color={COLORS.primary} />
              <Text style={styles.itemName}>{item.medicineName}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>ملاحظات</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </Card>
      )}

      {/* Cancel button */}
      {['PENDING', 'RECEIVED'].includes(order.status) && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>إلغاء الطلب</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  content:      { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  title:        { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '800' },
  statusCard:   { marginBottom: SPACING.md, gap: SPACING.sm },
  orderId:      { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  pharmacy:     { color: '#fff', fontSize: FONTS.size.md, fontWeight: '600', marginTop: 4 },
  stepperCard:  { marginBottom: SPACING.md },
  stepperTitle: { color: '#fff', fontWeight: '700', marginBottom: SPACING.md },
  step:         { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  stepLeft:     { alignItems: 'center', width: 24 },
  stepCircle:   { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  stepDone:     { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepCurrent:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepLine:     { width: 2, height: 24, backgroundColor: COLORS.borderLight, marginTop: 2 },
  stepLineDone: { backgroundColor: COLORS.success },
  stepLabel:    { color: COLORS.textMuted, fontSize: FONTS.size.sm, paddingTop: 3, flex: 1 },
  stepLabelDone:{ color: '#fff' },
  itemsCard:    { marginBottom: SPACING.md },
  sectionTitle: { color: '#fff', fontWeight: '700', marginBottom: SPACING.sm },
  itemRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 6 },
  itemName:     { flex: 1, color: '#fff', fontSize: FONTS.size.sm },
  itemQty:      { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  notesCard:    { marginBottom: SPACING.md },
  notesText:    { color: COLORS.textMuted, fontSize: FONTS.size.sm, lineHeight: 20 },
  cancelBtn:    { borderWidth: 1.5, borderColor: COLORS.error, borderRadius: 14, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  cancelText:   { color: COLORS.error, fontWeight: '700', fontSize: FONTS.size.md },
});
export default OrderDetailScreen;
