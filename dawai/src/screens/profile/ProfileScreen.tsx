import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Input, Button, Card } from '@components/ui';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/services';
import { COLORS, FONTS, SPACING } from '@constants/config';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await authApi.updateProfile({ firstName, lastName, phone });
      setEditing(false);
      Alert.alert('تم', 'تم تحديث بياناتك بنجاح');
    } catch {
      Alert.alert('خطأ', 'تعذّر تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: logout },
    ]);
  };

  const avatar = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>البيانات الشخصية</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Ionicons
                name={editing ? 'close' : 'pencil'}
                size={18} color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <Input label="الاسم الأول" value={firstName} onChangeText={setFirstName} />
              <Input label="اسم العائلة" value={lastName} onChangeText={setLastName} />
              <Input label="رقم الجوال" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Button title="حفظ التغييرات" onPress={saveProfile} loading={loading} style={{ marginTop: SPACING.sm }} />
            </>
          ) : (
            <>
              <InfoRow icon="person-outline" label="الاسم" value={`${user?.firstName} ${user?.lastName}`} />
              <InfoRow icon="mail-outline" label="البريد" value={user?.email ?? '-'} />
              <InfoRow icon="call-outline" label="الجوال" value={user?.phone ?? 'غير مُضاف'} />
            </>
          )}
        </Card>

        {/* Settings */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>الإعدادات</Text>
          <SettingRow icon="notifications-outline" label="الإشعارات" />
          <SettingRow icon="shield-checkmark-outline" label="الخصوصية والأمان" />
          <SettingRow icon="help-circle-outline" label="المساعدة والدعم" />
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <Text style={styles.version}>دوائي v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon as any} size={16} color={COLORS.textMuted} />
      <View style={infoStyles.texts}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={infoStyles.row}>
      <Ionicons name={icon as any} size={18} color={COLORS.primary} />
      <Text style={[infoStyles.value, { flex: 1, marginRight: SPACING.sm }]}>{label}</Text>
      <Ionicons name="chevron-back" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, paddingBottom: 80 },
  avatarWrap: { alignItems: 'center', marginVertical: SPACING.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: '700' },
  name: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: '700' },
  email: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 4 },
  card: { marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.md, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: COLORS.error, borderRadius: 12,
    marginBottom: SPACING.md,
  },
  logoutText: { color: COLORS.error, fontSize: FONTS.size.md, fontWeight: '600' },
  version: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textAlign: 'center' },
});

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  texts: { flex: 1 },
  label: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  value: { color: COLORS.textPrimary, fontSize: FONTS.size.sm, marginTop: 2 },
});
