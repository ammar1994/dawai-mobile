import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { usePharmacyStore } from '../../store/pharmacy.store';
import { getCurrentLocation, requestLocationPermission, Coords } from '../../utils/location';
import type { Pharmacy } from '../../types';

export function PharmacyMapScreen() {
  const navigation = useNavigation<any>();
  const { pharmacies, fetchNearby } = usePharmacyStore();
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [selected,   setSelected]   = useState<Pharmacy | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      const ok = await requestLocationPermission();
      if (ok) {
        try {
          const coords = await getCurrentLocation();
          setUserCoords(coords);
          await fetchNearby(coords.latitude, coords.longitude);
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const region = userCoords
    ? { latitude: userCoords.latitude, longitude: userCoords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 24.7136, longitude: 46.6753, latitudeDelta: 0.1, longitudeDelta: 0.1 }; // Riyadh default

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>→</Text>
        </TouchableOpacity>
        <Text style={styles.title}>خريطة الصيدليات</Text>
      </View>

      {loading
        ? <ActivityIndicator color={Colors.primary} style={styles.loader} size="large" />
        : (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            {pharmacies.map(p => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                pinColor={p.isActive ? Colors.primary : Colors.textHint}
                onPress={() => setSelected(p)}
              />
            ))}
          </MapView>
        )
      }

      {/* Bottom Sheet for selected pharmacy */}
      {selected && (
        <View style={styles.sheet}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.sheetName}>{selected.tenant.name}</Text>
          <Text style={styles.sheetBranch}>{selected.name}</Text>
          {selected.address && <Text style={styles.sheetAddress}>{selected.address}</Text>}
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => { setSelected(null); navigation.navigate('PharmacyDetail', { pharmacyId: selected.id }); }}
          >
            <Text style={styles.detailBtnText}>عرض التفاصيل</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: Spacing.xs, marginEnd: Spacing.sm },
  backIcon: { fontSize: FontSize.lg, color: Colors.primary },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  map: { flex: 1 },
  loader: { flex: 1 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopStartRadius: Radius.xl, borderTopEndRadius: Radius.xl, padding: Spacing.lg, elevation: 16 },
  closeBtn: { position: 'absolute', top: Spacing.md, start: Spacing.md, padding: Spacing.xs },
  closeIcon: { fontSize: FontSize.lg, color: Colors.textHint },
  sheetName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'right', marginBottom: 4 },
  sheetBranch: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right', marginBottom: 4 },
  sheetAddress: { fontSize: FontSize.sm, color: Colors.textHint, textAlign: 'right', marginBottom: Spacing.md },
  detailBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, alignItems: 'center' },
  detailBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
