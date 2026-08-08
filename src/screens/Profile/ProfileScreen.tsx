import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl,
  Modal, Image, ActionSheetIOS, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  launchCamera, launchImageLibrary,
  type ImagePickerResponse, type Asset, type PhotoQuality,
} from 'react-native-image-picker';
import { useAuthStore } from '../../store/auth.store';
import { prescriptionsService, PrescriptionImage } from '../../services/prescriptions.service';
import api, { storage } from '../../services/api';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

type ActiveTab = 'profile' | 'prescriptions';

// ── Image Picker Helper ────────────────────────────────────────────
async function pickImage(): Promise<Asset | null> {
  return new Promise(resolve => {
    const options = {
      mediaType: 'photo' as const,
      quality:   0.85 as PhotoQuality,
      maxWidth:  1280,
      maxHeight: 1280,
    };

    const handler = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) { resolve(null); return; }
      const asset = response.assets?.[0] ?? null;
      resolve(asset);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['إلغاء', 'التقاط صورة', 'اختيار من المعرض'], cancelButtonIndex: 0, title: 'رفع وصفة طبية' },
        idx => {
          if (idx === 1) launchCamera(options, handler);
          else if (idx === 2) launchImageLibrary(options, handler);
          else resolve(null);
        },
      );
    } else {
      // Android — Alert بخيارين
      Alert.alert(
        'رفع وصفة طبية',
        'اختر مصدر الصورة',
        [
          { text: 'إلغاء', style: 'cancel', onPress: () => resolve(null) },
          { text: '📷 الكاميرا',  onPress: () => launchCamera(options, handler) },
          { text: '🖼️ المعرض',   onPress: () => launchImageLibrary(options, handler) },
        ],
      );
    }
  });
}

export function ProfileScreen() {
  const { customer, logout } = useAuthStore();

  const [activeTab,     setActiveTab]     = useState<ActiveTab>('profile');
  const [saving,        setSaving]        = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionImage[]>([]);
  const [presLoading,   setPresLoading]   = useState(false);
  const [uploadModal,   setUploadModal]   = useState(false);
  const [imageUrl,      setImageUrl]      = useState('');
  const [imageUri,      setImageUri]      = useState<string | null>(null);
  const [imageNotes,    setImageNotes]    = useState('');
  const [uploading,     setUploading]     = useState(false);
  const [previewItem,   setPreviewItem]   = useState<PrescriptionImage | null>(null);

  // Profile edit state
  const [firstName, setFirstName] = useState(customer?.firstName ?? '');
  const [lastName,  setLastName]  = useState(customer?.lastName  ?? '');
  const [phone,     setPhone]     = useState(customer?.phone     ?? '');

  const loadPrescriptions = useCallback(async () => {
    setPresLoading(true);
    try {
      const list = await prescriptionsService.list();
      setPrescriptions(list);
    } catch {
      // silent
    } finally {
      setPresLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'prescriptions') loadPrescriptions();
  }, [activeTab, loadPrescriptions]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch<{ success: boolean; data: { firstName: string; lastName: string; phone: string; email: string; id: string; createdAt: string } }>(
        '/mobile/auth/profile',
        { firstName, lastName, phone },
      );
      // ── تحديث المتجر والـ storage بالبيانات الجديدة ──────────────
      if (data?.data) {
        const updated = { ...customer, ...data.data };
        useAuthStore.setState({ customer: updated as any });
        storage.set('customer', JSON.stringify(updated));
      }
      Alert.alert('تم الحفظ ✅', 'تم تحديث بياناتك بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err?.response?.data?.message ?? 'فشل التحديث');
    } finally {
      setSaving(false);
    }
  };

  // ── فتح صفحة الرفع مع اختيار الصورة فوراً ────────────────────────
  const handleOpenUpload = async () => {
    setImageUrl('');
    setImageUri(null);
    setImageNotes('');
    setUploadModal(true);
  };

  const handlePickImage = async () => {
    const asset = await pickImage();
    if (!asset) return;
    setImageUri(asset.uri ?? null);
    setImageUrl('');  // URI يتغلب على URL
  };

  const handleUpload = async () => {
    const source = imageUri ?? imageUrl.trim();
    if (!source) {
      Alert.alert('تنبيه', 'اختر صورة أو أدخل رابطاً');
      return;
    }
    setUploading(true);
    try {
      await prescriptionsService.upload(source, imageNotes.trim() || undefined);
      setUploadModal(false);
      setImageUrl('');
      setImageUri(null);
      setImageNotes('');
      await loadPrescriptions();
    } catch {
      Alert.alert('خطأ', 'فشل الرفع، حاول مرة أخرى');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (item: PrescriptionImage) => {
    Alert.alert(
      'حذف الوصفة',
      'هل تريد حذف هذه الوصفة نهائياً؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف', style: 'destructive',
          onPress: async () => {
            try {
              await prescriptionsService.delete(item.id);
              setPrescriptions(p => p.filter(x => x.id !== item.id));
            } catch {
              Alert.alert('خطأ', 'فشل الحذف');
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrescriptions();
    setRefreshing(false);
  };

  const initials = `${customer?.firstName?.[0] ?? ''}${customer?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1A1A2E', '#2D1040']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{customer?.firstName} {customer?.lastName}</Text>
        <Text style={styles.email}>{customer?.email}</Text>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabs}>
        {(['profile', 'prescriptions'] as ActiveTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'profile' ? '👤 حسابي' : '📄 وصفاتي'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Profile Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxxl }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>تعديل البيانات</Text>

            <Text style={styles.fieldLabel}>الاسم الأول</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="الاسم الأول"
              placeholderTextColor={Colors.textHint}
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>الاسم الأخير</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="الاسم الأخير"
              placeholderTextColor={Colors.textHint}
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+966xxxxxxxxx"
              placeholderTextColor={Colors.textHint}
              keyboardType="phone-pad"
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{customer?.email}</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.btnDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.saveBtnText}>حفظ التغييرات</Text>}
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>🚪 تسجيل الخروج</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ─── Prescriptions Tab ──────────────────────────────────────────────── */}
      {activeTab === 'prescriptions' && (
        <>
          {/* Upload FAB */}
          <TouchableOpacity style={styles.fab} onPress={handleOpenUpload} activeOpacity={0.85}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.fabGradient}>
              <Text style={styles.fabIcon}>+ رفع وصفة</Text>
            </LinearGradient>
          </TouchableOpacity>

          {presLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
              {prescriptions.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>📄</Text>
                  <Text style={styles.emptyTitle}>لا توجد وصفات بعد</Text>
                  <Text style={styles.emptySub}>ارفع وصفاتك الطبية لتجد فيها مرجعاً دائماً</Text>
                </View>
              ) : (
                prescriptions.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.presCard}
                    onPress={() => setPreviewItem(item)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.presThumb}>
                      {item.imageUrl.startsWith('http') || item.imageUrl.startsWith('file') ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.presImg} resizeMode="cover" />
                      ) : (
                        <Text style={{ fontSize: 32 }}>📄</Text>
                      )}
                    </View>
                    <View style={styles.presInfo}>
                      <Text style={styles.presDate}>
                        {new Date(item.uploadedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                      {item.notes && <Text style={styles.presNotes} numberOfLines={2}>{item.notes}</Text>}
                    </View>
                    {/* RTL-safe: استخدام hitSlop بدون left/right ثابتة */}
                    <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </>
      )}

      {/* ─── Upload Modal ─────────────────────────────────────────────────── */}
      <Modal visible={uploadModal} transparent animationType="slide" onRequestClose={() => setUploadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>رفع وصفة طبية</Text>

            {/* زر اختيار الصورة */}
            <TouchableOpacity style={styles.pickerBtn} onPress={handlePickImage} activeOpacity={0.85}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.pickerPreview} resizeMode="cover" />
              ) : (
                <View style={styles.pickerPlaceholder}>
                  <Text style={styles.pickerIcon}>📷</Text>
                  <Text style={styles.pickerText}>التقاط صورة / اختيار من المعرض</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* أو إدخال رابط */}
            {!imageUri && (
              <>
                <Text style={styles.orDivider}>— أو أدخل رابط الصورة —</Text>
                <Text style={styles.fieldLabel}>رابط الصورة (URL)</Text>
                <TextInput
                  style={styles.input}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://..."
                  placeholderTextColor={Colors.textHint}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>ملاحظات (اختياري)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={imageNotes}
              onChangeText={setImageNotes}
              placeholder="اسم الطبيب، التشخيص، ..."
              placeholderTextColor={Colors.textHint}
              multiline
              numberOfLines={3}
              textAlign="right"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setUploadModal(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadConfirmBtn, uploading && styles.btnDisabled]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.uploadConfirmText}>رفع ⬆️</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Preview Modal ───────────────────────────────────────────────── */}
      <Modal visible={!!previewItem} transparent animationType="fade" onRequestClose={() => setPreviewItem(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewItem(null)}>
            <Text style={styles.previewCloseText}>✕</Text>
          </TouchableOpacity>
          {previewItem && (
            <Image
              source={{ uri: previewItem.imageUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles — RTL-Safe (marginStart/End بدل Left/Right) ──────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  header:      { paddingTop: 60, paddingBottom: 24, alignItems: 'center' },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm, borderWidth: 2, borderColor: Colors.primary },
  avatarText:  { fontSize: Typography.xl, fontWeight: '700', color: Colors.white },
  name:        { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
  email:       { fontSize: Typography.sm, color: Colors.textHint, marginTop: 4 },

  tabs:        { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:         { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText:     { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  scroll:      { flex: 1 },
  card:        { margin: Spacing.base, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md },
  cardTitle:   { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  fieldLabel:  { fontSize: Typography.xs, color: Colors.textHint, fontWeight: '600', marginBottom: 6, marginTop: Spacing.xs },
  input:       { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, fontSize: Typography.base, color: Colors.textPrimary, backgroundColor: Colors.surface, marginBottom: Spacing.sm },
  inputDisabled: { backgroundColor: Colors.background, justifyContent: 'center' },
  inputDisabledText: { color: Colors.textHint, fontSize: Typography.base },
  textArea:    { minHeight: 80, textAlignVertical: 'top' },

  saveBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  saveBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  logoutBtn:   { marginHorizontal: Spacing.base, marginTop: Spacing.sm, backgroundColor: Colors.white, borderRadius: Radius.md, paddingVertical: Spacing.base, alignItems: 'center', borderWidth: 1, borderColor: Colors.error + '44' },
  logoutText:  { color: Colors.error, fontSize: Typography.base, fontWeight: '600' },

  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:   { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle:  { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySub:    { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },

  // RTL-safe end بدلاً من right
  fab:         { position: 'absolute', bottom: Spacing.xl, end: Spacing.lg, zIndex: 10, borderRadius: Radius.full, overflow: 'hidden', ...Shadow.lg },
  fabGradient: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  fabIcon:     { color: Colors.white, fontWeight: '700', fontSize: Typography.base },

  presCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, ...Shadow.sm },
  presThumb:   { width: 60, height: 60, borderRadius: Radius.sm, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginEnd: Spacing.md },
  presImg:     { width: 60, height: 60 },
  presInfo:    { flex: 1 },
  presDate:    { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  presNotes:   { fontSize: Typography.xs, color: Colors.textSecondary },
  // RTL-safe: paddingStart بدل paddingLeft
  deleteIcon:  { fontSize: 20, paddingStart: Spacing.sm },

  // Image Picker
  pickerBtn:         { width: '100%', height: 140, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary + '66', borderStyle: 'dashed', overflow: 'hidden', marginBottom: Spacing.sm },
  pickerPreview:     { width: '100%', height: '100%' },
  pickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  pickerIcon:        { fontSize: 36 },
  pickerText:        { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600', textAlign: 'center' },
  orDivider:         { textAlign: 'center', color: Colors.textHint, fontSize: Typography.xs, marginVertical: Spacing.xs },

  modalOverlay:    { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: Colors.white, borderTopStartRadius: Radius.xl, borderTopEndRadius: Radius.xl, padding: Spacing.xl, paddingBottom: 40 },
  modalTitle:      { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.lg },
  modalActions:    { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  cancelBtn:       { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  cancelBtnText:   { color: Colors.textSecondary, fontWeight: '600' },
  uploadConfirmBtn:{ flex: 2, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  uploadConfirmText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },

  previewOverlay:  { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  // RTL-safe: end بدل right
  previewClose:    { position: 'absolute', top: 52, end: Spacing.lg, zIndex: 10 },
  previewCloseText:{ color: '#fff', fontSize: Typography.xl, fontWeight: '700' },
  previewImage:    { width: '95%', height: '80%' },
});
