import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { isValidEmail } from '../../utils/validation';
import type { AuthStackParamList, RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export function LoginScreen() {
  const navigation  = useNavigation<Nav>();
  const login       = useAuthStore(s => s.login);
  const isLoading   = useAuthStore(s => s.isLoading);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'بريد إلكتروني غير صحيح' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'كلمة المرور قصيرة جداً' });
      return;
    }
    try {
      await login({ email: email.trim(), password });
      // auth store يغير isAuthenticated → RootNavigator يعيد التوجيه
    } catch (err: any) {
      Toast.show({
        type  : 'error',
        text1 : 'فشل تسجيل الدخول',
        text2 : err?.response?.data?.message ?? 'تحقق من بياناتك',
      });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
          <Text style={styles.emoji}>💊</Text>
          <Text style={styles.appName}>دوائي</Text>
          <Text style={styles.subtitle}>أهلاً بعودتك</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            placeholderTextColor={Colors.textHint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="right"
          />

          <Text style={styles.label}>كلمة المرور</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.passInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textHint}
              secureTextEntry={!showPass}
              textAlign="right"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
            }
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>أنشئ حساباً</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex    : { flex: 1, backgroundColor: Colors.background },
  scroll  : { flexGrow: 1 },
  header  : {
    alignItems    : 'center',
    paddingTop    : 72,
    paddingBottom : Spacing.xxl,
  },
  emoji   : { fontSize: 48, marginBottom: Spacing.sm },
  appName : { color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, marginTop: Spacing.xs },
  form    : {
    flex           : 1,
    backgroundColor: Colors.surface,
    borderTopStartRadius: Radius.xl,
    borderTopEndRadius  : Radius.xl,
    marginTop      : -Radius.xl,
    padding        : Spacing.lg,
    paddingTop     : Spacing.xl,
  },
  label   : {
    color        : Colors.textPrimary,
    fontSize     : FontSize.sm,
    fontWeight   : FontWeight.medium,
    marginBottom : Spacing.xs,
    textAlign    : 'right',
  },
  input   : {
    backgroundColor : Colors.surfaceAlt,
    borderRadius    : Radius.md,
    borderWidth     : 1,
    borderColor     : Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical : Spacing.sm + 2,
    fontSize        : FontSize.md,
    color           : Colors.textPrimary,
    marginBottom    : Spacing.md,
    textAlign       : 'right',
  },
  passRow  : { position: 'relative' },
  passInput: { paddingEnd: 52 },
  eyeBtn   : { position: 'absolute', end: Spacing.md, top: 10 },
  eyeIcon  : { fontSize: 20 },
  forgotBtn: { alignSelf: 'flex-start', marginBottom: Spacing.lg },
  forgotText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  loginBtn : {
    backgroundColor : Colors.primary,
    borderRadius    : Radius.md,
    paddingVertical : Spacing.md,
    alignItems      : 'center',
    marginBottom    : Spacing.lg,
    elevation       : 3,
    shadowColor     : Colors.primary,
    shadowOffset    : { width: 0, height: 3 },
    shadowOpacity   : 0.3,
    shadowRadius    : 6,
  },
  btnDisabled   : { opacity: 0.65 },
  loginBtnText  : { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  registerRow   : { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText  : { color: Colors.textSecondary, fontSize: FontSize.sm },
  registerLink  : { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
