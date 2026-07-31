import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Input, Button } from '@components/ui';
import { useAuthStore } from '@store/auth.store';
import { COLORS, SPACING, FONTS } from '@constants/config';

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
    if (!form.lastName.trim())  e.lastName  = 'اسم العائلة مطلوب';
    if (!form.email.trim())     e.email     = 'البريد الإلكتروني مطلوب';
    if (form.password.length < 6) e.password = 'كلمة المرور 6 أحرف على الأقل';
    if (form.password !== form.confirm) e.confirm = 'كلمتا المرور لا تتطابقان';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
        password:  form.password,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'حدث خطأ، حاول مرة أخرى';
      Alert.alert('خطأ', msg);
    }
  };

  return (
    <Screen scroll keyboard>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>إنشاء حساب جديد</Text>
        <Text style={styles.sub}>سجّل مجاناً وابدأ الاستخدام فوراً</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="الاسم الأول" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="محمد" error={errors.firstName}/>
          </View>
          <View style={{ flex: 1 }}>
            <Input label="اسم العائلة" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="أحمد" error={errors.lastName}/>
          </View>
        </View>

        <Input label="البريد الإلكتروني" icon="mail-outline" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="example@email.com" error={errors.email}/>

        <Input label="رقم الهاتف (اختياري)" icon="call-outline" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" placeholder="01XXXXXXXXX"/>

        <Input label="كلمة المرور" icon="lock-closed-outline" value={form.password} onChangeText={v => set('password', v)} isPassword placeholder="6 أحرف على الأقل" error={errors.password}/>

        <Input label="تأكيد كلمة المرور" icon="lock-closed-outline" value={form.confirm} onChangeText={v => set('confirm', v)} isPassword placeholder="أعد كتابة كلمة المرور" error={errors.confirm}/>

        <Button title="إنشاء الحساب" onPress={handleRegister} loading={isLoading} style={styles.btn}/>

        <View style={styles.loginRow}>
          <Text style={styles.muted}>لديك حساب بالفعل؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:   { paddingBottom: SPACING.lg },
  back:     { marginBottom: SPACING.lg },
  backText: { color: COLORS.primary, fontSize: FONTS.size.md },
  title:    { color: '#fff', fontSize: FONTS.size.xxl, fontWeight: '800' },
  sub:      { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 4 },
  form:     {},
  row:      { flexDirection: 'row' },
  btn:      { marginTop: SPACING.sm },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  muted:    { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  link:     { color: COLORS.primary, fontSize: FONTS.size.sm, fontWeight: '700' },
});

export default RegisterScreen;
