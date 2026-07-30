import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/auth.store';
import { Colors, Typography, Spacing } from '../../theme';
import type { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const loadSession = useAuthStore(s => s.loadSession);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  // Animations
  const heartScale   = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const taglineY     = useRef(new Animated.Value(20)).current;
  const taglineOp    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Load persisted session
    loadSession();

    // 2. Play animations
    Animated.sequence([
      // Heart appears
      Animated.parallel([
        Animated.spring(heartScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Heartbeat pulse
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: 150, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
      ]),
      // Logo text
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Tagline
      Animated.parallel([
        Animated.timing(taglineOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // 3. Navigate after delay
    const timer = setTimeout(() => {
      navigation.replace(isAuthenticated ? 'Main' : 'Auth');
    }, 2600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient
      colors={['#0D0D1A', '#1A1A2E', '#2D1040']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* Glow effect */}
      <View style={styles.glow} />

      {/* Heart Icon */}
      <Animated.View
        style={[
          styles.heartContainer,
          { opacity: heartOpacity, transform: [{ scale: heartScale }] },
        ]}
      >
        <LinearGradient
          colors={['#FF4DB8', '#E91E8C', '#C2156F']}
          style={styles.heartBg}
        >
          <Text style={styles.heartEmoji}>🫀</Text>
          <Text style={styles.rxText}>Rx</Text>
          <View style={styles.ecgLine}>
            <Text style={styles.ecgSymbol}>⸻∧∨⸻</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: logoOpacity }}>
        <Text style={styles.appNameEn}>DAWAI</Text>
        <Text style={styles.appNameAr}>دوائي</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: taglineOp,
          transform: [{ translateY: taglineY }],
          marginTop: Spacing.xl,
        }}
      >
        <Text style={styles.tagline}>القلب والعلاج</Text>
      </Animated.View>

      {/* Bottom dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primaryGlow,
    top: height * 0.25,
    alignSelf: 'center',
  },
  heartContainer: {
    marginBottom: Spacing.xxl,
  },
  heartBg: {
    width: 140,
    height: 140,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  heartEmoji: {
    fontSize: 52,
    position: 'absolute',
    opacity: 0.3,
  },
  rxText: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 4,
  },
  ecgLine: {
    position: 'absolute',
    bottom: 28,
  },
  ecgSymbol: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: -2,
  },
  appNameEn: {
    fontSize: Typography.xxl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 10,
    textAlign: 'center',
  },
  appNameAr: {
    fontSize: Typography.lg,
    fontWeight: '400',
    color: Colors.accent,
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    fontSize: Typography.base,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    letterSpacing: 2,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
});
