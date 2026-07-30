import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

import { useAuthStore } from '../store/auth.store';
import { Colors, Typography } from '../theme';

// Screens
import { SplashScreen }         from '../screens/Auth/SplashScreen';
import { LoginScreen }          from '../screens/Auth/LoginScreen';
import { RegisterScreen }       from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { HomeScreen }           from '../screens/Home/HomeScreen';

// Placeholder screens for parts 2-4
import { PlaceholderScreen }    from './PlaceholderScreen';

import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from '../types';

const Root = createNativeStackNavigator<RootStackParamList>();
const Auth = createNativeStackNavigator<AuthStackParamList>();
const Tab  = createBottomTabNavigator<MainTabParamList>();

// ─── Auth Stack ──────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login"          component={LoginScreen} />
      <Auth.Screen name="Register"       component={RegisterScreen} />
      <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Auth.Navigator>
  );
}

// ─── Tab icons ────────────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, string> = {
  Home:       '🏠',
  Pharmacies: '🏥',
  Orders:     '📦',
  Reminders:  '⏰',
  Profile:    '👤',
};
const TAB_LABELS: Record<string, string> = {
  Home:       'الرئيسية',
  Pharmacies: 'الصيدليات',
  Orders:     'طلباتي',
  Reminders:  'تذكير',
  Profile:    'حسابي',
};

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textHint,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen} />
      <Tab.Screen name="Pharmacies" component={() => <PlaceholderScreen label="الصيدليات — الجزء 2" icon="🏥" />} />
      <Tab.Screen name="Orders"     component={() => <PlaceholderScreen label="الطلبات — الجزء 3" icon="📦" />} />
      <Tab.Screen name="Reminders"  component={() => <PlaceholderScreen label="التذكير — الجزء 4" icon="⏰" />} />
      <Tab.Screen name="Profile"    component={() => <PlaceholderScreen label="الملف الشخصي" icon="👤" />} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export function RootNavigator() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="Splash" component={SplashScreen} />
        {isAuthenticated ? (
          <Root.Screen name="Main" component={MainNavigator} />
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontSize: Typography.xs,
    fontWeight: '500',
  },
});
