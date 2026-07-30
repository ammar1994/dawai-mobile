import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp }           from '@react-navigation/native-stack';
import LinearGradient                          from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { PharmacyStackParamList, Pharmacy } from '../../types';
import api from '../../services/api';

type Route = RouteProp<PharmacyStackParamList, 'PharmacyDetail'>;
type Nav   = NativeStackNavigationProp<PharmacyStackParamList>;

const STATUS_BADGE = {
  open:   { bg: Colors.success + '22', text: Colors.success,   label: 'مفتوح الآن ●' },
  closed: { bg: Colors.error   + '22', text: Colors.error,     label: 'مغلق الآن ●' },
};

export function PharmacyDetailScreen() {
  const route = useRoute<Route>();
  const nav   = useNavigation<Nav>();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // The nearby API returns full pharmacy/branch data — re-use it via a simple GET
        const res = await api.get(`/mobile/pharmacies/${route.params.pharmacyId}`);
        setPharmacy(res.data.data);
      } catch {
        // Fallback: build minimal object from route params if the endpoint doesn't exist yet
        setPharmacy({
          id:       route.params.pharmacyId,
          name:     'الصيدلية',
          address:  '',
          phone:    '',
          lat:      0,
          lng:      0,
          isOpen:   true,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.pharmacyId]);

  const callPharmacy = () => {
    if (pharmacy?.phone) Linking.openURL(`tel:${pharmacy.phone}`);
  };

  const openMap = () => {
    if (pharmacy?.lat && pharmacy?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${pharmacy.lat},${pharmacy.lng}`;
      Linking.openURL(url);
    }
  };

  const goOrder = () => {
    if (!pharmacy) return;
    nav.navigate('NewOrder', { pharmacyId: pharmacy.id, pharmacyName: pharmacy.name });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!pharmacy) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>تعذّر تحميل الصيدلية</Text>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const badge = STATUS_BADGE[pharmacy.isOpen ? 'open' : 'closed'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1A1A2E', '#2D1040']} style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backArrow}>
          <Text style={styles.backArrowText}>← العودة</Text>
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏥</Text>
        </View>
        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>

        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>معلومات الصيدلية</Text>

          <InfoRow icon="📍" label="العنوان"     value={pharmacy.address || 'غير محدد'} />
          <InfoRow icon="📞" label="الهاتف"      value={pharmacy.phone   || 'غير محدد'} />
          {pharmacy.distance !== undefined && (
            <InfoRow icon="📏" label="المسافة"   value={`${(pharmacy.distance / 1000).toFixed(1)} كم`} />
          )}
          {pharmacy.rating && (
            <InfoRow icon="⭐" label="التقييم"   value={`${pharmacy.rating} / 5`} />
          )}
          {pharmacy.workingHours && (
            <InfoRow
              icon="🕐"
              label="أوقات العمل"
              value={`${pharmacy.workingHours.open} — ${pharmacy.workingHours.close}`}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={callPharmacy} activeOpacity={0.8}>
            <Text style={styles.actionBtnIcon}>📞</Text>
            <Text style={styles.actionBtnLabel}>اتصال</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={openMap} activeOpacity={0.8}>
            <Text style={styles.actionBtnIcon}>🗺️</Text>
            <Text style={styles.actionBtnLabel}>الخريطة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Order CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.ctaBtn, !pharmacy.isOpen && styles.ctaBtnDisabled]}
          onPress={pharmacy.isOpen ? goOrder : () => Alert.alert('الصيدلية مغلقة', 'حاول مرة أخرى لاحقاً')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={pharmacy.isOpen ? [Colors.primary, Colors.primaryDark] : ['#ccc', '#aaa']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>
              {pharmacy.isOpen ? '🛒 اطلب من هذه الصيدلية' : '🔒 الصيدلية مغلقة'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Sub-component ─────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View style={infoStyles.content}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  header:      { paddingTop: 56, paddingBottom: 28, alignItems: 'center', paddingHorizontal: Spacing.lg },
  backArrow:   { position: 'absolute', top: 56, left: Spacing.base },
  backArrowText: { color: Colors.white, fontSize: Typography.sm, opacity: 0.85 },
  logoCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  logoEmoji:   { fontSize: 40 },
  pharmacyName:{ fontSize: Typography.xl, fontWeight: '700', color: Colors.white, textAlign: 'center', marginBottom: Spacing.sm },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full },
  statusText:  { fontSize: Typography.sm, fontWeight: '600' },
  scroll:      { flex: 1 },
  card:        { margin: Spacing.base, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md },
  sectionTitle:{ fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  actionsRow:  { flexDirection: 'row', marginHorizontal: Spacing.base, gap: Spacing.md },
  actionBtn:   { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, alignItems: 'center', paddingVertical: Spacing.lg, ...Shadow.sm },
  actionBtnIcon: { fontSize: 28, marginBottom: 6 },
  actionBtnLabel:{ fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },
  ctaWrap:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  ctaBtn:      { borderRadius: Radius.lg, overflow: 'hidden' },
  ctaBtnDisabled: { opacity: 0.7 },
  ctaGradient: { paddingVertical: Spacing.base + 2, alignItems: 'center' },
  ctaText:     { color: Colors.white, fontSize: Typography.base, fontWeight: '700' },
  errorText:   { color: Colors.textSecondary, fontSize: Typography.base, marginBottom: Spacing.md },
  backBtn:     { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  backBtnText: { color: Colors.white, fontWeight: '600' },
});

const infoStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.base },
  icon:    { fontSize: 20, marginRight: Spacing.md, marginTop: 2 },
  content: { flex: 1 },
  label:   { fontSize: Typography.xs, color: Colors.textHint, marginBottom: 2, fontWeight: '500' },
  value:   { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: '500' },
});
