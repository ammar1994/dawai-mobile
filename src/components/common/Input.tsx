import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            rightIcon ? styles.inputWithRight : null,
            style,
          ]}
          placeholderTextColor={Colors.textHint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    minHeight: 52,
  },
  focused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    textAlign: 'right',
  },
  inputWithLeft: {
    paddingLeft: 0,
  },
  inputWithRight: {
    paddingRight: 0,
  },
  leftIcon: {
    paddingLeft: Spacing.base,
  },
  rightIcon: {
    paddingRight: Spacing.base,
    paddingLeft: Spacing.sm,
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
});
