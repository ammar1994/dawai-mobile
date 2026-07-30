import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';

interface Props {
  label: string;
  icon: string;
}

export const PlaceholderScreen: React.FC<Props> = ({ label, icon }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.sub}>قريباً في الجزء التالي 🚀</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  icon:  { fontSize: 64, marginBottom: 16 },
  label: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub:   { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 8 },
});
