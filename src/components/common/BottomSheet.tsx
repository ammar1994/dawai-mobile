import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

interface Props {
  visible     : boolean;
  onClose     : () => void;
  title?      : string;
  children    : React.ReactNode;
  snapHeight? : number | string; // e.g. '60%'
}

export default function BottomSheet({ visible, onClose, title, children, snapHeight = '60%' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoidingView}
      >
        <View style={[styles.sheet, { maxHeight: snapHeight as any }]}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay    : { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay },
  avoidingView: { flex: 1, justifyContent: 'flex-end' },
  sheet      : {
    backgroundColor: Colors.surface,
    borderTopStartRadius: Radius.xl,
    borderTopEndRadius  : Radius.xl,
    minHeight: 200,
  },
  handle     : { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: Spacing.md },
  header     : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  title      : { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, writingDirection: 'rtl' },
  close      : { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  content    : { padding: Spacing.lg, paddingBottom: Spacing.xxl },
});
