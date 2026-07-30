import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'lg',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.wrapper, sizeStyles[size], style, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={isDisabled
            ? [Colors.textHint, Colors.textHint]
            : [Colors.primaryLight, Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[styles.primaryText, sizeTextStyles[size], textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.outline,
          sizeStyles[size],
          style,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <Text style={[styles.outlineText, sizeTextStyles[size], textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[styles.ghost, style]}
    >
      <Text style={[styles.ghostText, sizeTextStyles[size], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.md,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  primaryText: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  ghost: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  ghostText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.55,
  },
});

const sizeStyles: Record<string, ViewStyle> = {
  sm: { height: 40, paddingHorizontal: Spacing.lg },
  md: { height: 48, paddingHorizontal: Spacing.xl },
  lg: { height: 56, paddingHorizontal: Spacing.xxl },
};

const sizeTextStyles: Record<string, TextStyle> = {
  sm: { fontSize: Typography.sm },
  md: { fontSize: Typography.base },
  lg: { fontSize: Typography.md },
};
