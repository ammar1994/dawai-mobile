import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '@constants/config';

interface Props { label: string; color: string; }

export function Badge({ label, color }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      20,
    borderWidth:       1,
    alignSelf:         'flex-start',
  },
  text: { fontSize: FONTS.size.xs, fontWeight: '700' },
});
