import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '@constants/config';

interface Props {
  title:     string;
  onPress:   () => void;
  loading?:  boolean;
  disabled?: boolean;
  variant?:  'primary' | 'outline' | 'ghost';
  style?:    ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, loading, disabled, variant = 'primary', style, textStyle }: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : COLORS.primary} size="small" />
        : <Text style={[
            styles.text,
            isOutline && styles.textOutline,
            variant === 'ghost' && styles.textGhost,
            textStyle,
          ]}>
            {title}
          </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height:         52,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  primary: {
    backgroundColor: COLORS.primary,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       8,
  },
  outline: {
    borderWidth:  1.5,
    borderColor:  COLORS.primary,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color:      '#fff',
    fontSize:   FONTS.size.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textGhost: {
    color: COLORS.textMuted,
  },
});
