import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  const handleSend = async () => {
    if (!email.trim()) { setError('البريد الإلكتروني مطلوب'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/customer/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'حدث خطأ، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <LinearGradient colors={['#1A1A2E', '#2D1040']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>استعادة كلمة المرور</Text>
      </LinearGradient>

      <View style={styles.card}>
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>📧</Text>
            <Text style={styles.successTitle}>تم الإرسال!</Text>
            <Text style={styles.successText}>
              تحقق من بريدك الإلكتروني، سيصلك رابط إعادة تعيين كلمة المرور خلال دقائق.
            </Text>
            <Button
              title="العودة لتسجيل الدخول"
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        ) : (
          <>
            <Text style={styles.description}>
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </Text>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Input
              label="البريد الإلكتروني"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="إرسال رابط الاستعادة"
              onPress={handleSend}
              loading={loading}
              style={{ marginTop: Spacing.md }}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  backBtn: { marginBottom: Spacing.md },
  backIcon: { fontSize: 24, color: Colors.white },
  title: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'right',
  },
  card: {
    margin: Spacing.base,
    marginTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    elevation: 6,
  },
  description: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: Typography.sm, textAlign: 'right' },
  successBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  successEmoji: { fontSize: 60, marginBottom: Spacing.lg },
  successTitle: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
