import React from 'react';
import {
  View, ScrollView, StyleSheet, ViewStyle,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@constants/config';

interface Props {
  children:   React.ReactNode;
  scroll?:    boolean;
  style?:     ViewStyle;
  padded?:    boolean;
  keyboard?:  boolean;
}

export function Screen({ children, scroll, style, padded = true, keyboard }: Props) {
  const content = (
    <SafeAreaView style={styles.safe}>
      {scroll
        ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[padded && styles.padded, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        )
        : (
          <View style={[styles.view, padded && styles.padded, style]}>
            {children}
          </View>
        )
      }
    </SafeAreaView>
  );

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.bg },
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  view:   { flex: 1 },
  padded: { padding: SPACING.md },
});
