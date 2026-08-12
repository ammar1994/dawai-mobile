import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme';

interface Props {
  size?  : 'small' | 'large';
  color? : string;
  full?  : boolean;
}

export default function LoadingSpinner({ size = 'large', color = Colors.primary, full = true }: Props) {
  return (
    <View style={[full && styles.full]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
