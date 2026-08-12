import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface Props {
  visible     : boolean;
  title       : string;
  message?    : string;
  confirmText?: string;
  cancelText? : string;
  onConfirm   : () => void;
  onCancel    : () => void;
  danger?     : boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText  = 'إلغاء',
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: danger ? Colors.error : Colors.primary }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay    : { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' },
  dialog     : { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, width: '85%' },
  title      : { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', writingDirection: 'rtl' },
  message    : { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, writingDirection: 'rtl' },
  actions    : { flexDirection: 'row', marginTop: Spacing.xl, gap: Spacing.md },
  cancelBtn  : { flex: 1, height: 48, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelText : { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  confirmBtn : { flex: 1, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold },
});
