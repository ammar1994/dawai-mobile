import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@constants/config';

// Screens
import HomeScreen from '@screens/home/HomeScreen';
import PharmaciesScreen from '@screens/pharmacies/PharmaciesScreen';
import NewOrderScreen from '@screens/orders/NewOrderScreen';
import OrdersScreen from '@screens/orders/OrdersScreen';
import OrderDetailScreen from '@screens/orders/OrderDetailScreen';
import RemindersScreen from '@screens/reminders/RemindersScreen';
import NewReminderScreen from '@screens/reminders/NewReminderScreen';
import PrescriptionsScreen from '@screens/prescriptions/PrescriptionsScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICON: Record<string, { active: string; inactive: string }> = {
  Home:          { active: 'home',            inactive: 'home-outline' },
  Orders:        { active: 'cart',            inactive: 'cart-outline' },
  Reminders:     { active: 'alarm',           inactive: 'alarm-outline' },
  Prescriptions: { active: 'document-text',   inactive: 'document-text-outline' },
  Profile:       { active: 'person',          inactive: 'person-outline' },
};

const TAB_LABEL: Record<string, string> = {
  Home: 'الرئيسية',
  Orders: 'طلباتي',
  Reminders: 'تذكيرات',
  Prescriptions: 'وصفاتي',
  Profile: 'حسابي',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A0520',
          borderTopColor: 'rgba(233,30,140,0.2)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONTS.size.xs,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarLabel: TAB_LABEL[route.name] ?? route.name,
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICON[route.name];
          const name = focused ? icons?.active : icons?.inactive;
          return (
            <Ionicons
              name={(name ?? 'ellipse-outline') as any}
              size={size}
              color={focused ? COLORS.primary : COLORS.textMuted}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        cardStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Pharmacies" component={PharmaciesScreen} options={{ title: 'اختر صيدلية' }} />
      <Stack.Screen name="NewOrder" component={NewOrderScreen} options={{ title: 'طلب جديد' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'تفاصيل الطلب' }} />
      <Stack.Screen name="NewReminder" component={NewReminderScreen} options={{ title: 'تذكير جديد' }} />
    </Stack.Navigator>
  );
}
