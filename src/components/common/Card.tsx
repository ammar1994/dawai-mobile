import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../theme';

interface Props {
  children : React.ReactNode;
  style?   : ViewStyle;
  padded?  : boolean;
}

export default function Card({ children, style, padded = true }: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius   : Radius.lg,
    shadowColor    : Colors.black,
    shadowOffset   : { width: 0, height: 2 },
    shadowOpacity  : 0.06,
    shadowRadius   : 8,
    elevation      : 3,
  },
  padded: { padding: Spacing.md },
});
