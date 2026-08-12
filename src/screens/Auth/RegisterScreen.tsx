import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const register   = useAuthStore(s => s.register);
  const isLoading  = useAuthStore(s => s.isLoading);

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim()) {
      Toast.show({ type: 'error', text1: 'الاسم مطلوب' });
      return;
    }
    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'بريد إلكتروني غير صحيح' });
      return;
    }
    if (!isValidPassword(password)) {
      Toast.show({ type: 'error', text1: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      return;
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'كلمتا المرور غير متطابقتين' });
      return;
    }
    try {
      await register({
        firstName : firstName.trim(),
        lastName  : lastName.trim(),
        email     : email.trim(),
        password,
        phone     : phone.trim() || undefined,
      });
      Toast.show({ type: 'success', text1: 'تم إنشاء الحساب بنجاح 🎉' });
      // auth store يغير isAuthenticated → التطبيق يتوجه لـ Main
    } catch (err: any) {
      Toast.show({
        type  : 'error',
        text1 : 'فشل إنشاء الحساب',
        text2 : err?.response?.data?.message ?? 'حاول مرة أخرى',
      });
    }
  }

  function Field({
    label, value, onChange, placeholder, keyboard = 'default', secure = false,
  }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; keyboard?: any; secure?: boolean;
  }) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textHint}
          keyboardType={keyboard}
          secureTextEntry={secure && !showPass}
          autoCapitalize="none"
          textAlign="right"
        />
      </>
    );
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
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
          <Text style={styles.title}>إنشاء حساب</Text>
          <Text style={styles.subtitle}>انضم إلى دوائي</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>الاسم الأول</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="محمد"
                placeholderTextColor={Colors.textHint}
                textAlign="right"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>الاسم الأخير</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="الأحمد"
                placeholderTextColor={Colors.textHint}
                textAlign="right"
              />
            </View>
          </View>

          <Field label="البريد الإلكتروني" value={email} onChange={setEmail}
            placeholder="example@email.com" keyboard="email-address" />
          <Field label="رقم الهاتف (اختياري)" value={phone} onChange={setPhone}
            placeholder="05xxxxxxxx" keyboard="phone-pad" />
          <Field label="كلمة المرور" value={password} onChange={setPassword}
            placeholder="••••••••" secure />

          <Text style={styles.label}>تأكيد كلمة المرور</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              placeholderTextColor={Colors.textHint}
              secureTextEntry={!showPass}
              textAlign="right"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>إنشاء الحساب</Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>لديك حساب؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>سجّل الدخول</Text>
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
  header  : { alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.xxl },
  title   : { color: Colors.white, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, marginTop: Spacing.xs },
  form    : {
    flex                : 1,
    backgroundColor     : Colors.surface,
    borderTopStartRadius: Radius.xl,
    borderTopEndRadius  : Radius.xl,
    marginTop           : -Radius.xl,
    padding             : Spacing.lg,
    paddingTop          : Spacing.xl,
  },
  row     : { flexDirection: 'row', gap: Spacing.sm },
  half    : { flex: 1 },
  label   : {
    color       : Colors.textPrimary,
    fontSize    : FontSize.sm,
    fontWeight  : FontWeight.medium,
    marginBottom: Spacing.xs,
    textAlign   : 'right',
  },
  input   : {
    backgroundColor  : Colors.surfaceAlt,
    borderRadius     : Radius.md,
    borderWidth      : 1,
    borderColor      : Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical  : Spacing.sm + 2,
    fontSize         : FontSize.md,
    color            : Colors.textPrimary,
    marginBottom     : Spacing.md,
    textAlign        : 'right',
  },
  passRow  : { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  eyeBtn   : { marginStart: Spacing.sm, padding: Spacing.xs },
  btn      : {
    backgroundColor: Colors.primary,
    borderRadius   : Radius.md,
    paddingVertical: Spacing.md,
    alignItems     : 'center',
    marginBottom   : Spacing.lg,
    elevation      : 3,
    shadowColor    : Colors.primary,
    shadowOffset   : { width: 0, height: 3 },
    shadowOpacity  : 0.3,
    shadowRadius   : 6,
  },
  btnDisabled: { opacity: 0.65 },
  btnText    : { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  loginRow   : { flexDirection: 'row', justifyContent: 'center' },
  loginText  : { color: Colors.textSecondary, fontSize: FontSize.sm },
  loginLink  : { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
