import { AppRegistry, I18nManager } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ─── RTL دائماً ──────────────────────────────────────────────────────────────
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

AppRegistry.registerComponent(appName, () => App);
