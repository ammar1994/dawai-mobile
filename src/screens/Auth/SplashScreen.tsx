import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const loadSession = useAuthStore(s => s.loadSession);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    async function init() {
      await loadSession();
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // بعد loadSession تنتهي — isAuthenticated يتغير ونحول
    // نتجنب setTimeout تماماً — نعتمد على state change
    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.isLoading === false && prev.isLoading === true) {
        if (state.isAuthenticated) {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
      }
    });
    return unsub;
  }, [navigation]);

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.secondary]}
      style={styles.container}
    >
      <View style={styles.center}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>💊</Text>
        </View>
        <Text style={styles.appName}>دوائي</Text>
        <Text style={styles.tagline}>صيدليتك في جيبك</Text>
      </View>
      <ActivityIndicator color={Colors.white} size="large" style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center   : { alignItems: 'center', marginBottom: Spacing.xxl },
  logoBox  : {
    width           : 96,
    height          : 96,
    borderRadius    : 28,
    backgroundColor : 'rgba(255,255,255,0.2)',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : Spacing.md,
  },
  logoEmoji: { fontSize: 48 },
  appName  : {
    color      : Colors.white,
    fontSize   : FontSize.xxxl,
    fontWeight : FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  tagline  : {
    color    : 'rgba(255,255,255,0.75)',
    fontSize : FontSize.md,
  },
  loader   : { position: 'absolute', bottom: 64 },
});
