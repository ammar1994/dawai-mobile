import { AppRegistry, I18nManager } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// ── RTL First — دعم العربية قياسياً ──────────────────────────
// يجب أن يُشغَّل قبل أي render
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

AppRegistry.registerComponent(appName, () => App);
