import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { RootNavigator } from './src/navigation';
import { getStorageReady } from './src/services/api';

// bootsplash — يُخفى بعد اكتمال init
let BootSplash: any = null;
try { BootSplash = require('react-native-bootsplash').default; } catch {}

export default function App() {
  useEffect(() => {
    // ننتظر storage جاهز ثم نُخفي Splash الأصلي
    getStorageReady().then(() => {
      BootSplash?.hide({ fade: true });
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <Toast />
    </GestureHandlerRootView>
  );
}
