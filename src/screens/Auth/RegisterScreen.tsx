import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/auth.store';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass]         = useState(false);
  const [errors, setErrors]             = useState<Partial<typeof form>>({});
  const { register, isLoading, error, clearError } = useAuthStore();

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
    if (!form.lastName.trim())  e.lastName  = 'اسم العائلة مطلوب';
    if (!form.email.trim())     e.email     = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'بريد إلكتروني غير صحيح';
    if (!form.phone.trim())     e.phone     = 'رقم الهاتف مطلوب';
    if (!form.password)         e.password  = 'كلمة المرور مطلوبة';
    else if (form.password.length < 6) e.password = 'كلمة المرور 6 أحرف على الأقل';
    if (form.confirmPassword !== form.password)
      e.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim().toLowerCase(),
        phone:     form.phone.trim(),
        password:  form.password,
      });
    } catch {
      // error displayed from store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <LinearGradient colors={['#1A1A2E', '#2D1040']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إنشاء حساب</Text>
        <Text style={styles.headerSub}>انضم إلى دوائي اليوم</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="الاسم الأول"
                placeholder="محمد"
                value={form.firstName}
                onChangeText={set('firstName')}
                error={errors.firstName}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="اسم العائلة"
                placeholder="أحمد"
                value={form.lastName}
                onChangeText={set('lastName')}
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label="البريد الإلكتروني"
            placeholder="example@email.com"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="رقم الهاتف"
            placeholder="05xxxxxxxx"
            value={form.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="كلمة المرور"
            placeholder="••••••••"
            value={form.password}
            onChangeText={set('password')}
            secureTextEntry={!showPass}
            error={errors.password}
            rightIcon={
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            }
            onRightIconPress={() => setShowPass(v => !v)}
          />

          <Input
            label="تأكيد كلمة المرور"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            secureTextEntry={!showPass}
            error={errors.confirmPassword}
          />

          <Button
            title="إنشاء الحساب"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerBtn}
          />

          <Button
            title="لدي حساب بالفعل — تسجيل الدخول"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    marginBottom: Spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: Typography.base,
    color: Colors.accent,
    textAlign: 'right',
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorBoxText: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: { flex: 1 },
  registerBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  eyeIcon: { fontSize: 18 },
});
