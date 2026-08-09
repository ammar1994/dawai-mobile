import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../store/auth.store';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import type { RootStackParamList, MainTabParamList } from '../../types';

// HomeScreen عيشة داخل MainNavigator (Tab) الذي نفسه داخل RootNavigator (Stack)
// CompositeNavigationProp يدمج قدرات التنقل للمستويين
type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const customer  = useAuthStore(s => s.customer);
  const navigation = useNavigation<HomeNav>();

  const quickActions = [
    { icon: '🏥', label: 'أقرب صيدلية', color: '#FF4DB8', screen: 'Pharmacies' as const },
    { icon: '📋', label: 'طلباتي',       color: '#E91E8C', screen: 'Orders'     as const },
    { icon: '⏰', label: 'تذكير الدواء', color: '#C2156F', screen: 'Reminders'  as const },
    { icon: '📄', label: 'وصفاتي',       color: '#8B0A5A', screen: 'Profile'    as const },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <LinearGradient colors={['#1A1A2E', '#2D1040']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>مرحباً 👋</Text>
            <Text style={styles.userName}>
              {customer?.firstName} {customer?.lastName}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customer?.firstName?.[0]}{customer?.lastName?.[0]}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
      >
        {/* Quick actions */}
        <Text style={styles.sectionTitle}>ماذا تحتاج اليوم؟</Text>
        <View style={styles.grid}>
          {quickActions.map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard} activeOpacity={0.8}
              onPress={() => navigation.navigate(a.screen as never)}>
              <LinearGradient
                colors={[a.color + '22', a.color + '11']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>اطلب دواءك بسهولة</Text>
          <Text style={styles.bannerSub}>
            ابحث عن أقرب صيدلية وأرسل طلبك في ثوانٍ
          </Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>ابحث الآن ←</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Coming in part 2/3 */}
        <Text style={styles.sectionTitle}>آخر الطلبات</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>لا توجد طلبات بعد</Text>
          <Text style={styles.emptySubText}>
            ابدأ بالبحث عن صيدلية قريبة منك
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)' },
  userName: {
    fontSize: Typography.lg,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'right',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
  scroll: { flex: 1, marginTop: -Spacing.xl },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  actionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 32, marginBottom: Spacing.sm },
  actionLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  banner: {
    margin: Spacing.base,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  bannerTitle: {
    fontSize: Typography.lg,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  bannerSub: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    marginBottom: Spacing.lg,
  },
  bannerBtn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  bannerBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.sm,
  },
  emptyCard: {
    margin: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: {
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubText: { fontSize: Typography.sm, color: Colors.textSecondary },
});
