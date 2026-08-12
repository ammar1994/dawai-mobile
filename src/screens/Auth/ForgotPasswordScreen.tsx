import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import { isValidEmail } from '../../utils/validation';
import api from '../../api/client';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email,     setEmail]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent,      setSent]      = useState(false);

  async function handleSend() {
    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'بريد إلكتروني غير صحيح' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch {
      // الـ Backend يُرجع دائماً success — إذا فشل هناك مشكلة شبكة
      Toast.show({ type: 'error', text1: 'تعذر الاتصال بالخادم، حاول لاحقاً' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>→</Text>
        </TouchableOpacity>
        <Text style={styles.title}>استعادة كلمة المرور</Text>
      </View>

      <View style={styles.body}>
        {!sent ? (
          <>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={styles.description}>
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </Text>

            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={Colors.textHint}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />

            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleSend}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.btnText}>إرسال رابط الاستعادة</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>📬</Text>
            <Text style={styles.doneTitle}>تم الإرسال</Text>
            <Text style={styles.doneText}>
              إذا كان البريد{' '}
              <Text style={styles.emailBold}>{email}</Text>
              {' '}مسجلاً لدينا، ستصلك رسالة خلال دقائق.
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>العودة لتسجيل الدخول</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container  : { flex: 1, backgroundColor: Colors.background },
  header     : {
    flexDirection  : 'row',
    alignItems     : 'center',
    paddingTop     : Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: Spacing.md,
    paddingBottom  : Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn    : { padding: Spacing.xs, marginEnd: Spacing.sm },
  backIcon   : { fontSize: FontSize.lg, color: Colors.primary },
  title      : { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right', flex: 1 },
  body       : { flex: 1, padding: Spacing.lg, alignItems: 'center', paddingTop: Spacing.xxl },
  emoji      : { fontSize: 64, marginBottom: Spacing.lg },
  description: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  label      : { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: Spacing.xs, alignSelf: 'stretch', textAlign: 'right' },
  input      : {
    backgroundColor  : Colors.surface,
    borderRadius     : Radius.md,
    borderWidth      : 1,
    borderColor      : Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical  : Spacing.sm + 2,
    fontSize         : FontSize.md,
    color            : Colors.textPrimary,
    marginBottom     : Spacing.lg,
    alignSelf        : 'stretch',
    textAlign        : 'right',
  },
  btn        : {
    backgroundColor: Colors.primary,
    borderRadius   : Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems     : 'center',
    alignSelf      : 'stretch',
    elevation      : 3,
    shadowColor    : Colors.primary,
    shadowOffset   : { width: 0, height: 3 },
    shadowOpacity  : 0.3,
    shadowRadius   : 6,
  },
  btnDisabled: { opacity: 0.65 },
  btnText    : { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  doneTitle  : { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  doneText   : { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  emailBold  : { fontWeight: FontWeight.bold, color: Colors.primary },
});
