import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coords {
  latitude  : number;
  longitude : number;
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title   : 'إذن الموقع',
        message : 'يحتاج التطبيق إلى موقعك لإيجاد الصيدليات القريبة',
        buttonPositive: 'موافق',
        buttonNegative: 'رفض',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS يتعامل معها عبر react-native-permissions
}

export function getCurrentLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

// Haversine — للاستخدام المحلي في الخريطة
export function calculateDistance(a: Coords, b: Coords): number {
  const R  = 6371;
  const dL = toRad(b.latitude  - a.latitude);
  const dN = toRad(b.longitude - a.longitude);
  const x  =
    Math.sin(dL / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
