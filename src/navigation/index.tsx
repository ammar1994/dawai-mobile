import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

import { useAuthStore } from '../store/auth.store';
import { Colors, Typography } from '../theme';

// Auth screens
import { SplashScreen }         from '../screens/Auth/SplashScreen';
import { LoginScreen }          from '../screens/Auth/LoginScreen';
import { RegisterScreen }       from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';

// Home
import { HomeScreen } from '../screens/Home/HomeScreen';

// Pharmacy (Part 2)
import { PharmacyMapScreen }    from '../screens/Pharmacy/PharmacyMapScreen';
import { PharmacyDetailScreen } from '../screens/Pharmacy/PharmacyDetailScreen';

// Orders (Part 3)
import { OrdersListScreen }    from '../screens/Orders/OrdersListScreen';
import { OrderTrackingScreen } from '../screens/Orders/OrderTrackingScreen';
import { NewOrderScreen }      from '../screens/Orders/NewOrderScreen';

// Reminders (Part 4)
import { RemindersScreen } from '../screens/Reminders/RemindersScreen';

import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  PharmacyStackParamList,
  OrdersStackParamList,
} from '../types';

const Root     = createNativeStackNavigator<RootStackParamList>();
const Auth     = createNativeStackNavigator<AuthStackParamList>();
const Tab      = createBottomTabNavigator<MainTabParamList>();
const Pharmacy = createNativeStackNavigator<PharmacyStackParamList>();
const Orders   = createNativeStackNavigator<OrdersStackParamList>();

function AuthNavigator() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login"          component={LoginScreen} />
      <Auth.Screen name="Register"       component={RegisterScreen} />
      <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Auth.Navigator>
  );
}

function PharmacyNavigator() {
  return (
    <Pharmacy.Navigator screenOptions={{ headerShown: false }}>
      <Pharmacy.Screen name="PharmacyMap"    component={PharmacyMapScreen} />
      <Pharmacy.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
      <Pharmacy.Screen name="NewOrder"       component={NewOrderScreen} />
    </Pharmacy.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <Orders.Navigator screenOptions={{ headerShown: false }}>
      <Orders.Screen name="OrdersList"    component={OrdersListScreen} />
      <Orders.Screen name="OrderDetail"   component={OrderTrackingScreen} />
      <Orders.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Orders.Navigator>
  );
}

const TAB_ICONS: Record<string, string> = {
  Home: '🏠', Pharmacies: '🏥', Orders: '📦', Reminders: '⏰', Profile: '👤',
};
const TAB_LABELS: Record<string, string> = {
  Home: 'الرئيسية', Pharmacies: 'الصيدليات', Orders: 'طلباتي', Reminders: 'تذكير', Profile: 'حسابي',
};

function ProfileScreen() {
  const { customer, logout } = useAuthStore();
  const { Text: T, View: V, StyleSheet: SS, TouchableOpacity: TO } = require('react-native');
  return null; // placeholder — Part 5
}

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
      <Tab.Screen name="Pharmacies" component={PharmacyNavigator} />
      <Tab.Screen name="Orders"     component={OrdersNavigator} />
      <Tab.Screen name="Reminders"  component={RemindersScreen} />
      <Tab.Screen name="Profile"    component={HomeScreen} />
    </Tab.Navigator>
  );
}

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
  tabLabel: { fontSize: Typography.xs, fontWeight: '500' },
});
