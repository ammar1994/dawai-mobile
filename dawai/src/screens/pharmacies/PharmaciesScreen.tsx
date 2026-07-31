import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen, Card, Loader } from '@components/ui';
import { pharmaciesApi } from '@api/services';
import { COLORS, SPACING, FONTS } from '@constants/config';

export function PharmaciesScreen() {
  const navigation = useNavigation<any>();
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [location,   setLocation]   = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('تنبيه', 'نحتاج إذن الموقع لإيجاد أقرب صيدلية');
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;
    setLocation({ lat, lng });
    fetchNearby(lat, lng);
  };

  const fetchNearby = async (lat: number, lng: number) => {
    try {
      const res = await pharmaciesApi.nearby(lat, lng, 10);
      setPharmacies(res.data?.branches ?? res.data ?? []);
    } catch {
      Alert.alert('خطأ', 'تعذر جلب الصيدليات القريبة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="جاري تحديد موقعك..." />;

  return (
    <Screen padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>أقرب صيدلية</Text>
        <TouchableOpacity onPress={getLocation}>
          <Ionicons name="refresh" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={pharmacies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا توجد صيدليات في نطاق 10 كم</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('NewOrder', { pharmacy: item })}
            activeOpacity={0.8}
          >
            <Card glow style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="medical" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.tenant?.nameAr ?? item.tenant?.name ?? item.name}</Text>
                  <Text style={styles.address}>{item.address ?? 'العنوان غير متاح'}</Text>
                  <View style={styles.distRow}>
                    <Ionicons name="location" size={12} color={COLORS.primary} />
                    <Text style={styles.dist}>{item.distanceKm} كم</Text>
                  </View>
                </View>
                <View style={styles.orderBtn}>
                  <Text style={styles.orderBtnText}>اطلب</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         SPACING.md,
    paddingTop:      SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  back:    { padding: 4 },
  title:   { color: '#fff', fontSize: FONTS.size.lg, fontWeight: '800' },
  list:    { padding: SPACING.md, gap: SPACING.sm },
  card:    { marginBottom: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconBox: {
    width:           48,
    height:          48,
    borderRadius:    14,
    backgroundColor: COLORS.primary + '22',
    alignItems:      'center',
    justifyContent:  'center',
  },
  name:     { color: '#fff', fontSize: FONTS.size.md, fontWeight: '700' },
  address:  { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  distRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  dist:     { color: COLORS.primary, fontSize: FONTS.size.xs, fontWeight: '600' },
  orderBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  orderBtnText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: '700' },
  empty:     { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.md },
});
export default PharmaciesScreen;
