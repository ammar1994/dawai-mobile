import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight } from '../../theme';

interface Props {
  name  : string;
  size? : number;
}

export default function Avatar({ name, size = 48 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '؟';
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.primary }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text  : { color: Colors.white, fontWeight: FontWeight.bold },
});
