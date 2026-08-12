import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface Props extends TextInputProps {
  label?         : string;
  error?         : string;
  containerStyle?: ViewStyle;
  leftIcon?      : string;
  rightIcon?     : string;
  onRightPress?  : () => void;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightPress,
  showPasswordToggle,
  secureTextEntry,
  ...rest
}: Props) {
  const [secure, setSecure] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? Colors.error : focused ? Colors.primary : Colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, { borderColor }]}>
        {leftIcon ? (
          <Icon name={leftIcon} size={20} color={Colors.textHint} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textHint}
          secureTextEntry={secure}
          textAlign="right"
          writingDirection="rtl"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {showPasswordToggle ? (
          <TouchableOpacity onPress={() => setSecure(s => !s)} style={styles.rightIcon}>
            <Icon name={secure ? 'eye-off' : 'eye'} size={20} color={Colors.textHint} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={Colors.textHint} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container : { marginBottom: Spacing.md },
  label     : {
    fontSize   : FontSize.sm,
    fontWeight : FontWeight.semibold,
    color      : Colors.textPrimary,
    marginBottom: Spacing.xs,
    writingDirection: 'rtl',
  },
  inputRow  : {
    flexDirection  : 'row',
    alignItems     : 'center',
    borderWidth    : 1.5,
    borderRadius   : Radius.md,
    backgroundColor: Colors.surface,
    height         : 52,
    paddingHorizontal: Spacing.md,
  },
  leftIcon  : { marginEnd: Spacing.sm },
  rightIcon : { marginStart: Spacing.sm },
  input     : {
    flex       : 1,
    fontSize   : FontSize.md,
    color      : Colors.textPrimary,
    paddingVertical: 0,
  },
  error     : {
    fontSize  : FontSize.xs,
    color     : Colors.error,
    marginTop : Spacing.xs,
    writingDirection: 'rtl',
  },
});
