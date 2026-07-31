import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@store/auth.store';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { Loader } from '@components/ui';
import { COLORS } from '@constants/config';

export default function App() {
  const { isLoggedIn, loadUser } = useAuthStore();
  const [hydrated, setHydrated] = React.useState(false);

  useEffect(() => {
    loadUser().finally(() => setHydrated(true));
  }, []);

  if (!hydrated) return <Loader />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={COLORS.bg} />
        <NavigationContainer>
          {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
