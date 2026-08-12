import React, { useEffect, useRef } from 'react';
import { I18nManager, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { RootNavigator } from './src/navigation';
import {
  requestPermission,
  setupForegroundHandler,
  setupNotificationChannels,
  handleNotificationOpen,
} from './src/services/notifications.service';
import { useAddressesStore } from './src/store/addresses.store';
import { useFavoritesStore }  from './src/store/favorites.store';
import { Colors } from './src/theme';

// إجبار الاتجاه RTL
I18nManager.forceRTL(true);

export default function App() {
  const loadFavorites = useFavoritesStore(s => s.loadFavorites);
  const loadAddresses = useAddressesStore(s => s.loadAddresses);

  // مرجع للـ navigator — نمرره لـ handleNotificationOpen
  const navRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    // تحميل البيانات المحلية
    loadFavorites();
    loadAddresses();

    // إعداد قنوات الإشعارات وطلب الإذن
    setupNotificationChannels();
    requestPermission();

    // معالجة الإشعارات الواردة (Foreground)
    const unsubscribe = setupForegroundHandler();

    // ─── Deep Link: فتح التطبيق من إشعار → OrderDetail ──
    handleNotificationOpen((screen, params) => {
      // ننتظر حتى يكون الـ navigator جاهزاً
      if (navRef.current?.isReady()) {
        navRef.current.navigate(screen as never, params as never);
      }
    });

    return () => {
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary}
        translucent
      />
      <RootNavigator navRef={navRef} />
      <Toast />
    </GestureHandlerRootView>
  );
}
