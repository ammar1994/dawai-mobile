import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '@constants/config';

interface Props {
  children: React.ReactNode;
  style?:   ViewStyle;
  glow?:    boolean;
}

export function Card({ children, style, glow }: Props) {
  return (
    <View style={[styles.card, glow && styles.glow, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    20,
    padding:         SPACING.md,
    borderWidth:     1,
    borderColor:     COLORS.borderLight,
  },
  glow: {
    borderColor:  COLORS.border,
    shadowColor:  COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius:  12,
    elevation:     4,
  },
});
