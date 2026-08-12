import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { getInitials } from '../../utils/format';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName ?? '');
  const [phone,     setPhone]     = useState(user?.phone ?? '');

  async function handleSave() {
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() || undefined });
      Toast.show({ type: 'success', text1: 'تم حفظ التعديلات ✅' });
    } catch { Toast.show({ type: 'error', text1: 'فشل الحفظ، حاول مجدداً' }); }
  }

  const initials = user ? getInitials(user.firstName, user.lastName) : '؟';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>الملف الشخصي</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.avatarBox}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>الاسم الأول</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="الاسم الأول" placeholderTextColor={Colors.textHint} textAlign="right" />
        <Text style={styles.label}>الاسم الأخير</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="الاسم الأخير" placeholderTextColor={Colors.textHint} textAlign="right" />
        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="05xxxxxxxx" placeholderTextColor={Colors.textHint} keyboardType="phone-pad" textAlign="right" />

        <TouchableOpacity style={[styles.saveBtn, isLoading && styles.btnDisabled]} onPress={handleSave} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>حفظ التعديلات</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  avatarBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  avatarText: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  email: { color: Colors.textSecondary, fontSize: FontSize.sm },
  form: { marginHorizontal: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs, textAlign: 'right' },
  input: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: Spacing.md, textAlign: 'right' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.sm, elevation: 3, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnDisabled: { opacity: 0.65 },
  saveBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
