import { AppRegistry, I18nManager } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// ─── RTL دائماً ──────────────────────────────────────────────────────────────
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

// ─── Firebase Background Message Handler ────────────────────────────────────
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // يمكن إضافة local notification هنا إذا لزم
});

AppRegistry.registerComponent(appName, () => App);
