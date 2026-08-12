import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface Props {
  icon?        : string;
  title        : string;
  subtitle?    : string;
  actionLabel? : string;
  onAction?    : () => void;
}

export default function EmptyState({ icon = 'inbox-outline', title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={Colors.textHint} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container  : { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  title      : { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginTop: Spacing.md, textAlign: 'center', writingDirection: 'rtl' },
  subtitle   : { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center', writingDirection: 'rtl' },
  action     : { marginTop: Spacing.lg, backgroundColor: Colors.primaryGlow, borderRadius: 999, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  actionText : { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
});
