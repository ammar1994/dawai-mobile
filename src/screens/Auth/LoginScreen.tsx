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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())    e.email    = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'بريد إلكتروني غير صحيح';
    if (!password)        e.password = 'كلمة المرور مطلوبة';
    else if (password.length < 6) e.password = 'كلمة المرور 6 أحرف على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation handled automatically by RootNavigator watching isAuthenticated
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

      {/* Header gradient */}
      <LinearGradient
        colors={['#1A1A2E', '#2D1040']}
        style={styles.header}
      >
        <Text style={styles.logoEn}>DAWAI</Text>
        <Text style={styles.logoAr}>دوائي</Text>
        <Text style={styles.tagline}>القلب والعلاج</Text>
      </LinearGradient>

      {/* Form card */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>أهلاً بعودتك 👋</Text>

          {/* API error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <Input
            label="البريد الإلكتروني"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="كلمة المرور"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            error={errors.password}
            rightIcon={
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            }
            onRightIconPress={() => setShowPass(v => !v)}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <Button
            title="تسجيل الدخول"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginBtn}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="إنشاء حساب جديد"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />

          <Text style={styles.terms}>
            بتسجيل الدخول، أنت توافق على{' '}
            <Text style={styles.termsLink}>شروط الاستخدام</Text>
            {' و'}
            <Text style={styles.termsLink}> سياسة الخصوصية</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  logoEn: {
    fontSize: Typography.xxl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 8,
  },
  logoAr: {
    fontSize: Typography.md,
    color: Colors.accent,
    letterSpacing: 4,
    marginTop: 2,
  },
  tagline: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.4)',
    marginTop: Spacing.sm,
    letterSpacing: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.base,
    paddingTop: Spacing.xxl,
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
  title: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginBottom: Spacing.xl,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  forgotText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  loginBtn: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.sm,
    color: Colors.textHint,
    marginHorizontal: Spacing.md,
  },
  terms: {
    fontSize: Typography.xs,
    color: Colors.textHint,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  eyeIcon: { fontSize: 18 },
});
