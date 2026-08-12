import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { getInitials } from '../../utils/format';

interface MenuItem { icon: string; label: string; screen?: string; color?: string; onPress?: () => void; }

export function MoreMenuScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'إلغاء' },
      { text: 'خروج', style: 'destructive', onPress: () => logout() },
    ]);
  }

  const MENU: MenuItem[] = [
    { icon: '👤', label: 'الملف الشخصي',       screen: 'Profile' },
    { icon: '⏰', label: 'تذكيرات الأدوية',    screen: 'Reminders' },
    { icon: '🔍', label: 'البحث عن دواء',       screen: 'MedicineSearch' },
    { icon: '❤️', label: 'صيدلياتي المفضلة',  screen: 'Favorites' },
    { icon: '📍', label: 'العناوين المحفوظة',  screen: 'SavedAddresses' },
    { icon: '🚪', label: 'تسجيل الخروج',       color: Colors.error, onPress: handleLogout },
  ];

  const initials = user ? getInitials(user.firstName, user.lastName) : '؟';

  return (
    <ScrollView style={styles.container}>
      {/* Profile Banner */}
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.banner}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      {/* Menu */}
      <View style={styles.menu}>
        {MENU.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={item.onPress ?? (() => navigation.navigate(item.screen!))}
            activeOpacity={0.75}
          >
            <Text style={styles.menuArrow}>←</Text>
            <Text style={[styles.menuLabel, item.color && { color: item.color }]}>{item.label}</Text>
            <Text style={styles.menuIcon}>{item.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  banner: { alignItems: 'center', paddingTop: 52, paddingBottom: Spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  avatarText: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  name: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 4 },
  email: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  menu: { margin: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md + 2, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 22, marginEnd: Spacing.sm },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium, textAlign: 'right', marginEnd: Spacing.sm },
  menuArrow: { color: Colors.textHint, fontSize: FontSize.md },
});
