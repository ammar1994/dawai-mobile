import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface Props {
  title    : string;
  subtitle?: string;
  icon?    : string;
  onPress? : () => void;
}

export default function PromoBanner({ title, subtitle, icon = 'pill', onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={!onPress}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.iconBox}>
          <Icon name={icon} size={40} color="rgba(255,255,255,0.25)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner : {
    borderRadius     : Radius.xl,
    padding          : Spacing.lg,
    flexDirection    : 'row',
    alignItems       : 'center',
    justifyContent   : 'space-between',
    overflow         : 'hidden',
    marginBottom     : Spacing.md,
  },
  textCol  : { flex: 1 },
  title    : { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white, writingDirection: 'rtl' },
  subtitle : { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4, writingDirection: 'rtl' },
  iconBox  : { marginStart: Spacing.md },
});
