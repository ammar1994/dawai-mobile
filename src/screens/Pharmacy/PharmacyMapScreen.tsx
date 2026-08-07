import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
  PermissionsAndroid, Platform, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation    from '@react-native-community/geolocation';
import { useNavigation }                        from '@react-navigation/native';
import { NativeStackNavigationProp }            from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { PharmacyStackParamList, Pharmacy }       from '../../types';
import api from '../../services/api';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'PharmacyMap'>;

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_RADIUS_KM = 5;

// ─── Component ────────────────────────────────────────────────────────────────
export function PharmacyMapScreen() {
  const nav = useNavigation<Nav>();

  const [pharmacies,  setPharmacies]  = useState<Pharmacy[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [search,      setSearch]      = useState('');
  const [radius,      setRadius]      = useState(DEFAULT_RADIUS_KM);
  const [userLat,     setUserLat]     = useState<number | null>(null);
  const [userLng,     setUserLng]     = useState<number | null>(null);
  const [locError,    setLocError]    = useState<string | null>(null);
  const [filter,      setFilter]      = useState<'all' | 'open'>('all');

  // ── Location ─────────────────────────────────────────────────────────────────
  const requestLocation = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title:   'صلاحية الموقع',
          message: 'يحتاج التطبيق لموقعك لعرض أقرب الصيدليات',
          buttonPositive: 'السماح',
          buttonNegative: 'رفض',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocError('لم يتم منح صلاحية الموقع');
        setLoading(false);
        return;
      }
    }

    Geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocError(null);
      },
      err => {
        console.warn('Location error:', err);
        setLocError('تعذّر تحديد موقعك — تأكد من تفعيل GPS');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  // ── Fetch nearby pharmacies ───────────────────────────────────────────────────
  const fetchPharmacies = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await api.get('/mobile/pharmacies/nearby', {
        params: { lat, lng, radius: radius * 1000 }, // convert km → meters
      });
      setPharmacies(res.data?.data ?? []);
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message ?? 'فشل تحميل الصيدليات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [radius]);

  useEffect(() => {
    if (userLat !== null && userLng !== null) {
      setLoading(true);
      fetchPharmacies(userLat, userLng);
    }
  }, [userLat, userLng, fetchPharmacies]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userLat !== null && userLng !== null) {
      await fetchPharmacies(userLat, userLng);
    } else {
      await requestLocation();
    }
  };

  // ── Derived list ─────────────────────────────────────────────────────────────
  const filtered = pharmacies.filter(p => {
    const matchSearch = search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.isOpen;
    return matchSearch && matchFilter;
  });

  // ── Render card ──────────────────────────────────────────────────────────────
  const renderPharmacy = ({ item: p }: { item: Pharmacy }) => {
    const distKm = p.distance !== undefined
      ? p.distance >= 1000
        ? `${(p.distance / 1000).toFixed(1)} كم`
        : `${Math.round(p.distance)} م`
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('PharmacyDetail', { pharmacyId: p.id })}
        activeOpacity={0.82}
      >
        {/* Status stripe */}
        <View style={[styles.stripe, { backgroundColor: p.isOpen ? Colors.success : Colors.error }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>🏥</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.pharmacyName} numberOfLines={1}>{p.name}</Text>
              {p.address ? (
                <Text style={styles.pharmacyAddr} numberOfLines={1}>📍 {p.address}</Text>
              ) : null}
              {p.phone ? (
                <Text style={styles.pharmacyPhone}>📞 {p.phone}</Text>
              ) : null}
            </View>
            <View style={styles.cardRight}>
              {distKm && <Text style={styles.distance}>{distKm}</Text>}
              <View style={[styles.statusBadge, { backgroundColor: p.isOpen ? Colors.success + '22' : Colors.error + '22' }]}>
                <Text style={[styles.statusText, { color: p.isOpen ? Colors.success : Colors.error }]}>
                  {p.isOpen ? 'مفتوح' : 'مغلق'}
                </Text>
              </View>
            </View>
          </View>

          {p.workingHours && (
            <Text style={styles.hours}>
              🕐 {p.workingHours.open} – {p.workingHours.close}
            </Text>
          )}
          {p.rating && (
            <Text style={styles.rating}>{'⭐'.repeat(Math.round(p.rating))} {p.rating.toFixed(1)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Error / permission state ──────────────────────────────────────────────────
  if (locError && !loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.errorIcon}>📍</Text>
          <Text style={styles.errorTitle}>{locError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={requestLocation} activeOpacity={0.85}>
            <Text style={styles.retryText}>🔄 إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Search + Filters */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن صيدلية..."
          placeholderTextColor={Colors.textHint}
          textAlign="right"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <FilterPill label="الكل" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterPill label="مفتوح الآن" active={filter === 'open'} onPress={() => setFilter('open')} />
        {[2, 5, 10].map(r => (
          <FilterPill
            key={r}
            label={`${r} كم`}
            active={radius === r}
            onPress={() => setRadius(r)}
          />
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري تحديد موقعك وتحميل الصيدليات...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          renderItem={renderPharmacy}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>🏥</Text>
              <Text style={styles.emptyTitle}>لا توجد صيدليات في هذا النطاق</Text>
              <Text style={styles.emptySub}>جرّب توسيع نطاق البحث</Text>
            </View>
          }
        />
      )}

      {/* Results count */}
      {!loading && filtered.length > 0 && (
        <View style={styles.resultsBanner}>
          <Text style={styles.resultsText}>
            {filtered.length} صيدلية {radius} كم حولك
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Header() {
  return (
    <LinearGradient colors={['#1A1A2E', '#2D1040']} style={styles.header}>
      <Text style={styles.headerTitle}>🏥 الصيدليات القريبة</Text>
      <Text style={styles.headerSub}>ابحث عن صيدلية بالقرب منك</Text>
    </LinearGradient>
  );
}

function FilterPill({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header:       { paddingTop: 56, paddingBottom: 20, paddingHorizontal: Spacing.base, alignItems: 'center' },
  headerTitle:  { fontSize: Typography.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  headerSub:    { fontSize: Typography.sm, color: Colors.textHint },

  searchBar:    { flexDirection: 'row', alignItems: 'center', margin: Spacing.base, backgroundColor: Colors.white, borderRadius: Radius.full, paddingHorizontal: Spacing.base, ...Shadow.sm },
  searchInput:  { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, paddingVertical: Spacing.sm + 2 },
  clearBtn:     { padding: 6 },
  clearText:    { color: Colors.textHint, fontSize: Typography.base },

  filterRow:    { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: 8, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  pill:         { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  pillActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText:     { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '600' },
  pillTextActive: { color: Colors.white },

  list:         { paddingHorizontal: Spacing.base, paddingBottom: 80 },

  card:         { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.lg, marginBottom: Spacing.sm, ...Shadow.md, overflow: 'hidden' },
  stripe:       { width: 5 },
  cardBody:     { flex: 1, padding: Spacing.base },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap:     { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginEnd: Spacing.sm },
  icon:         { fontSize: 22 },
  cardInfo:     { flex: 1 },
  cardRight:    { alignItems: 'flex-end', gap: 6 },
  pharmacyName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  pharmacyAddr: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 2 },
  pharmacyPhone:{ fontSize: Typography.xs, color: Colors.textSecondary },
  distance:     { fontSize: Typography.xs, fontWeight: '700', color: Colors.primary },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText:   { fontSize: Typography.xs, fontWeight: '700' },
  hours:        { fontSize: Typography.xs, color: Colors.textHint, marginTop: 6 },
  rating:       { fontSize: Typography.xs, color: Colors.textHint, marginTop: 3 },

  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText:  { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' },
  emptyIcon:    { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle:   { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs, textAlign: 'center' },
  emptySub:     { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },
  errorIcon:    { fontSize: 56, marginBottom: Spacing.md },
  errorTitle:   { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  retryBtn:     { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full },
  retryText:    { color: Colors.white, fontWeight: '700', fontSize: Typography.base },

  resultsBanner:{ position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: Colors.secondary + 'EE', paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.full },
  resultsText:  { color: Colors.white, fontSize: Typography.xs, fontWeight: '600' },
});
