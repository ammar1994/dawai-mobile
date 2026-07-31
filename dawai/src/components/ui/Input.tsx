import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '@constants/config';

interface Props extends TextInputProps {
  label?:       string;
  error?:       string;
  icon?:        keyof typeof Ionicons.glyphMap;
  isPassword?:  boolean;
}

export function Input({ label, error, icon, isPassword, style, ...rest }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error ? styles.errorBorder : null]}>
        {icon && (
          <Ionicons name={icon} size={18} color={COLORS.textMuted} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !show}
          selectionColor={COLORS.primary}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eye}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { marginBottom: SPACING.md },
  label:     { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginBottom: 6, fontWeight: '500' },
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgInput,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.md,
    height:          52,
  },
  errorBorder: { borderColor: COLORS.error },
  icon:  { marginRight: SPACING.sm },
  input: {
    flex:      1,
    color:     COLORS.textPrimary,
    fontSize:  FONTS.size.md,
  },
  eye:   { padding: 4 },
  error: { color: COLORS.error, fontSize: FONTS.size.xs, marginTop: 4 },
});
