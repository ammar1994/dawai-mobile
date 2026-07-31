import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Input, Button } from '@components/ui';
import { useAuthStore } from '@store/auth.store';
import { COLORS, SPACING, FONTS } from '@constants/config';

export function LoginScreen() {
  const navigation  = useNavigation<any>();
  const { login, isLoading } = useAuthStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim())    e.email    = 'البريد الإلكتروني مطلوب';
    if (!password.trim()) e.password = 'كلمة المرور مطلوبة';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'بيانات الدخول غير صحيحة';
      Alert.alert('خطأ', msg);
    }
  };

  return (
    <Screen scroll keyboard>
      {/* Logo */}
      <View style={styles.logoArea}>
        <View style={styles.heart}>
          <Text style={styles.rx}>Rx</Text>
        </View>
        <Text style={styles.appName}>DAWAI</Text>
        <Text style={styles.appNameAr}>دوائي</Text>
        <Text style={styles.tagline}>صيدليتك في جيبك</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.title}>تسجيل الدخول</Text>

        <Input
          label="البريد الإلكتروني"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="example@email.com"
          error={errors.email}
        />

        <Input
          label="كلمة المرور"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          isPassword
          placeholder="••••••••"
          error={errors.password}
        />

        <Button
          title="دخول"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.btn}
        />

        <View style={styles.row}>
          <Text style={styles.muted}>ليس لديك حساب؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>إنشاء حساب</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoArea: { alignItems: 'center', paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  heart: {
    width:           100,
    height:          90,
    backgroundColor: COLORS.primary,
    borderRadius:    50,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.md,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.5,
    shadowRadius:    16,
    elevation:       10,
  },
  rx:       { color: '#fff', fontSize: 28, fontWeight: '900' },
  appName:  { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 5 },
  appNameAr:{ color: COLORS.primaryLight, fontSize: 16, marginTop: 2, opacity: 0.8 },
  tagline:  { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 8 },
  form:     { paddingHorizontal: SPACING.sm },
  title:    { color: '#fff', fontSize: FONTS.size.xl, fontWeight: '800', marginBottom: SPACING.lg },
  btn:      { marginTop: SPACING.sm },
  row:      { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  muted:    { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  link:     { color: COLORS.primary, fontSize: FONTS.size.sm, fontWeight: '700' },
});

export default LoginScreen;
