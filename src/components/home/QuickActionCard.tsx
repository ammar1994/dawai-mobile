import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface Props {
  icon    : string;
  label   : string;
  color?  : string;
  bgColor?: string;
  onPress : () => void;
}

export default function QuickActionCard({ icon, label, color = Colors.primary, bgColor = Colors.primaryGlow, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={26} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card   : { alignItems: 'center', width: 76 },
  iconBox: { width: 56, height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  label  : { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textPrimary, textAlign: 'center', writingDirection: 'rtl' },
});
