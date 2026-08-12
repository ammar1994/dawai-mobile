import React, { RefObject } from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';

import { Colors, FontSize } from '../theme';
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  PharmaciesStackParamList,
  OrdersStackParamList,
  MoreStackParamList,
} from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────
import { SplashScreen }        from '../screens/Auth/SplashScreen';
import { LoginScreen }         from '../screens/Auth/LoginScreen';
import { RegisterScreen }      from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';

// ─── Home ────────────────────────────────────────────────────────────────────
import { HomeScreen } from '../screens/Home/HomeScreen';

// ─── Pharmacies ──────────────────────────────────────────────────────────────
import { PharmacyListScreen }   from '../screens/Pharmacy/PharmacyListScreen';
import { PharmacyMapScreen }    from '../screens/Pharmacy/PharmacyMapScreen';
import { PharmacyDetailScreen } from '../screens/Pharmacy/PharmacyDetailScreen';
import { CartScreen }           from '../screens/Orders/CartScreen';
import { NewOrderScreen }       from '../screens/Orders/NewOrderScreen';

// ─── Orders ──────────────────────────────────────────────────────────────────
import { OrdersListScreen }  from '../screens/Orders/OrdersListScreen';
import { OrderDetailScreen } from '../screens/Orders/OrderDetailScreen';
import { PaymentScreen }     from '../screens/Orders/PaymentScreen';

// ─── Prescriptions ───────────────────────────────────────────────────────────
import { PrescriptionsScreen } from '../screens/Prescriptions/PrescriptionsScreen';

// ─── More ────────────────────────────────────────────────────────────────────
import { MoreMenuScreen }      from '../screens/Profile/MoreMenuScreen';
import { ProfileScreen }       from '../screens/Profile/ProfileScreen';
import { RemindersScreen }     from '../screens/Reminders/RemindersScreen';
import { MedicineSearchScreen } from '../screens/Search/MedicineSearchScreen';
import { FavoritesScreen }     from '../screens/Favorites/FavoritesScreen';
import { SavedAddressesScreen } from '../screens/Addresses/SavedAddressesScreen';

// ─── Navigators ───────────────────────────────────────────────────────────────
const Root        = createNativeStackNavigator<RootStackParamList>();
const Auth        = createNativeStackNavigator<AuthStackParamList>();
const Tab         = createBottomTabNavigator<MainTabParamList>();
const Pharmacies  = createNativeStackNavigator<PharmaciesStackParamList>();
const Orders      = createNativeStackNavigator<OrdersStackParamList>();
const More        = createNativeStackNavigator<MoreStackParamList>();

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login"          component={LoginScreen} />
      <Auth.Screen name="Register"       component={RegisterScreen} />
      <Auth.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Auth.Navigator>
  );
}

// ─── Pharmacies Stack ─────────────────────────────────────────────────────────
function PharmaciesNavigator() {
  return (
    <Pharmacies.Navigator screenOptions={{ headerShown: false }}>
      <Pharmacies.Screen name="PharmacyList"   component={PharmacyListScreen} />
      <Pharmacies.Screen name="PharmacyMap"    component={PharmacyMapScreen} />
      <Pharmacies.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
      <Pharmacies.Screen name="Cart"           component={CartScreen} />
      <Pharmacies.Screen name="NewOrder"       component={NewOrderScreen} />
    </Pharmacies.Navigator>
  );
}

// ─── Orders Stack ─────────────────────────────────────────────────────────────
function OrdersNavigator() {
  return (
    <Orders.Navigator screenOptions={{ headerShown: false }}>
      <Orders.Screen name="OrdersList"  component={OrdersListScreen} />
      <Orders.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Orders.Screen name="Payment"     component={PaymentScreen} />
    </Orders.Navigator>
  );
}

// ─── More Stack ───────────────────────────────────────────────────────────────
function MoreNavigator() {
  return (
    <More.Navigator screenOptions={{ headerShown: false }}>
      <More.Screen name="MoreMenu"       component={MoreMenuScreen} />
      <More.Screen name="Profile"        component={ProfileScreen} />
      <More.Screen name="Reminders"      component={RemindersScreen} />
      <More.Screen name="MedicineSearch" component={MedicineSearchScreen} />
      <More.Screen name="Favorites"      component={FavoritesScreen} />
      <More.Screen name="SavedAddresses" component={SavedAddressesScreen} />
    </More.Navigator>
  );
}

// ─── Tab Icons & Labels ───────────────────────────────────────────────────────
const TAB_ICONS: Record<string, string> = {
  Home          : '🏠',
  Pharmacies    : '🏥',
  Orders        : '📦',
  Prescriptions : '📄',
  More          : '☰',
};

const TAB_LABELS: Record<string, string> = {
  Home          : 'الرئيسية',
  Pharmacies    : 'الصيدليات',
  Orders        : 'طلباتي',
  Prescriptions : 'الوصفات',
  More          : 'المزيد',
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown          : false,
        tabBarStyle          : styles.tabBar,
        tabBarActiveTintColor   : Colors.primary,
        tabBarInactiveTintColor : Colors.textHint,
        tabBarLabelStyle     : styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.55 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      })}
    >
      <Tab.Screen name="Home"          component={HomeScreen} />
      <Tab.Screen name="Pharmacies"    component={PharmaciesNavigator} />
      <Tab.Screen name="Orders"        component={OrdersNavigator} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsScreen} />
      <Tab.Screen name="More"          component={MoreNavigator} />
    </Tab.Navigator>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface RootNavigatorProps {
  navRef?: RefObject<any>;
}

export function RootNavigator({ navRef }: RootNavigatorProps) {
  return (
    <NavigationContainer ref={navRef}>
      <Root.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Root.Screen name="Splash" component={SplashScreen} />
        <Root.Screen name="Auth"   component={AuthNavigator} />
        <Root.Screen name="Main"   component={MainNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor : Colors.white,
    borderTopWidth  : 1,
    borderTopColor  : Colors.border,
    height          : 72,
    paddingBottom   : 12,
    paddingTop      : 8,
    elevation       : 12,
    shadowColor     : Colors.secondary,
    shadowOffset    : { width: 0, height: -2 },
    shadowOpacity   : 0.07,
    shadowRadius    : 8,
  },
  tabLabel: {
    fontSize   : FontSize.xs,
    fontWeight : '500',
  },
});
