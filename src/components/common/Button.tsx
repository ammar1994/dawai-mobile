import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface Props extends TouchableOpacityProps {
  title       : string;
  variant?    : 'primary' | 'outline' | 'ghost' | 'danger';
  size?       : 'sm' | 'md' | 'lg';
  loading?    : boolean;
  fullWidth?  : boolean;
  style?      : ViewStyle;
}

export default function Button({
  title,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  style,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  const heights: Record<string, number> = { sm: 40, md: 50, lg: 58 };
  const fontSizes: Record<string, number> = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, style]}
        {...rest}
      >
        <LinearGradient
          colors={isDisabled ? [Colors.textDisabled, Colors.textDisabled] : [Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { height: heights[size], borderRadius: Radius.lg }]}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={[styles.textPrimary, { fontSize: fontSizes[size] }]}>{title}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const outlineStyle = variant === 'outline'
    ? { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: 'transparent' }
    : variant === 'danger'
    ? { borderWidth: 1.5, borderColor: Colors.error, backgroundColor: Colors.errorLight }
    : { backgroundColor: 'transparent' };

  const textColor = variant === 'outline' ? Colors.primary
    : variant === 'danger' ? Colors.error
    : Colors.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={[
        styles.base,
        { height: heights[size], borderRadius: Radius.lg, opacity: isDisabled ? 0.5 : 1 },
        outlineStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color={textColor} />
        : <Text style={[styles.textPrimary, { fontSize: fontSizes[size], color: textColor }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems     : 'center',
    justifyContent : 'center',
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: { width: '100%' },
  textPrimary: {
    color      : Colors.white,
    fontWeight : FontWeight.bold,
    writingDirection: 'rtl',
  },
});
