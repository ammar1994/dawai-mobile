import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

interface Props  { children: ReactNode }
interface State  { hasError: boolean; error: Error | null; info: ErrorInfo | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    // يمكن إضافة crash reporting هنا (Sentry / Firebase Crashlytics)
    console.error('[ErrorBoundary] Caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>💊</Text>
        <Text style={styles.title}>حدث خطأ غير متوقع</Text>
        <Text style={styles.subtitle}>
          نأسف على هذا الإزعاج. يرجى المحاولة مجدداً.
        </Text>

        {__DEV__ && this.state.error && (
          <ScrollView style={styles.devBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.devText}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.info?.componentStack}
            </Text>
          </ScrollView>
        )}

        <TouchableOpacity style={styles.btn} onPress={this.handleReset} activeOpacity={0.85}>
          <Text style={styles.btnText}>🔄 إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emoji:    { fontSize: 72, marginBottom: Spacing.lg },
  title:    { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl },
  devBox: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  devText: { fontSize: 11, color: '#ff6b6b', fontFamily: 'monospace' },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
});
