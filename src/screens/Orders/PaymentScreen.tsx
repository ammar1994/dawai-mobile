import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';

export function PaymentScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>الدفع</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.icon}>💳</Text>
        <Text style={styles.msg}>نظام الدفع سيتم ربطه عبر Stripe في المرحلة القادمة</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>عودة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  icon: { fontSize: 64, marginBottom: Spacing.lg },
  msg: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.xl },
  btnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
