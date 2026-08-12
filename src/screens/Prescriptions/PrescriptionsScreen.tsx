import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import api from '../../api/client';
import { useOrdersStore } from '../../store/orders.store';
import type { Prescription } from '../../types';
import { formatDate } from '../../utils/format';

export function PrescriptionsScreen() {
  const navigation = useNavigation<any>();
  const { clearCart, addToCart } = useOrdersStore();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [uploading,     setUploading]     = useState(false);

  // ─── تحميل الوصفات ───────────────────────────────────────
  async function load() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data.data ?? data);
    } catch {
      Toast.show({ type: 'error', text1: 'فشل تحميل الوصفات' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ─── رفع وصفة جديدة ─────────────────────────────────────
  async function handleUpload() {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (!result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const form = new FormData();
      // ⚠️ field name يجب أن يكون "file" بالضبط
      form.append('file', {
        uri  : asset.uri,
        name : asset.fileName ?? 'rx.jpg',
        type : asset.type ?? 'image/jpeg',
      } as any);
      await api.post('/prescriptions/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Toast.show({ type: 'success', text1: 'تم رفع الوصفة ✅' });
      load();
    } catch {
      Toast.show({ type: 'error', text1: 'فشل رفع الوصفة — تحقق من حجم الملف (حد 10MB)' });
    } finally {
      setUploading(false);
    }
  }

  // ─── حذف وصفة ───────────────────────────────────────────
  function handleDelete(item: Prescription) {
    Alert.alert('حذف الوصفة', 'هل تريد حذف هذه الوصفة؟', [
      { text: 'إلغاء' },
      {
        text    : 'حذف',
        style   : 'destructive',
        onPress : async () => {
          try {
            await api.delete(`/prescriptions/${item.id}`);
            setPrescriptions(prev => prev.filter(p => p.id !== item.id));
            Toast.show({ type: 'success', text1: 'تم حذف الوصفة' });
          } catch {
            Toast.show({ type: 'error', text1: 'فشل الحذف' });
          }
        },
      },
    ]);
  }

  // ─── اطلب بهذه الوصفة → Cart ────────────────────────────
  function handleOrderWithRx(item: Prescription) {
    // نمسح السلة ونضيف الوصفة كـ prescriptionImageUrl
    clearCart();
    // نحفظ الـ URL مؤقتاً في أول عنصر وهمي حتى تصل لـ NewOrderScreen
    // الأفضل: navigating to PharmacyList فالمستخدم يختار الصيدلية أولاً
    Alert.alert(
      'اطلب بهذه الوصفة',
      'اختر الصيدلية التي تريد إرسال الوصفة إليها',
      [
        { text: 'إلغاء' },
        {
          text    : 'اختر صيدلية',
          onPress : () => {
            // نحفظ imageUrl في store مؤقتاً ونذهب لقائمة الصيدليات
            useOrdersStore.setState({ pendingPrescriptionUrl: item.imageUrl });
            navigation.navigate('Pharmacies');
          },
        },
      ],
    );
  }

  // ─── Render بطاقة وصفة ─────────────────────────────────
  function renderItem({ item }: { item: Prescription }) {
    return (
      <View style={styles.card}>
        {/* صورة الوصفة */}
        {item.imageUrl
          ? <Image source={{ uri: item.imageUrl }} style={styles.img} />
          : (
            <View style={styles.imgPlaceholder}>
              <Text style={styles.imgPlaceholderText}>📄</Text>
            </View>
          )
        }

        {/* معلومات */}
        <View style={styles.cardInfo}>
          <Text style={styles.date}>{formatDate(item.uploadedAt)}</Text>
          {item.notes ? (
            <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
          ) : null}

          {/* أزرار */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.orderBtn} onPress={() => handleOrderWithRx(item)}>
              <Text style={styles.orderBtnText}>🛒 اطلب بهذه الوصفة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>وصفاتي الطبية</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <Text style={styles.uploadBtnText}>+ رفع وصفة</Text>
          }
        </TouchableOpacity>
      </View>

      <FlatList
        data={prescriptions}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
            : (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📄</Text>
                <Text style={styles.emptyText}>لا توجد وصفات{'\n'}ارفع أولى وصفاتك الطبية</Text>
              </View>
            )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container   : { flex: 1, backgroundColor: Colors.background },
  header      : {
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    paddingTop      : 52,
    paddingHorizontal: Spacing.md,
    paddingBottom   : Spacing.md,
    backgroundColor : Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title       : { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  uploadBtn   : {
    backgroundColor : Colors.primary,
    borderRadius    : Radius.full,
    paddingVertical : 6,
    paddingHorizontal: Spacing.md,
    minWidth        : 100,
    alignItems      : 'center',
  },
  uploadBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  list        : { padding: Spacing.md, gap: Spacing.sm },
  card        : {
    backgroundColor : Colors.surface,
    borderRadius    : Radius.lg,
    overflow        : 'hidden',
    elevation       : 2,
    shadowColor     : Colors.secondary,
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.06,
    shadowRadius    : 8,
    flexDirection   : 'row',
    alignItems      : 'flex-start',
  },
  img         : { width: 90, height: 110, resizeMode: 'cover' },
  imgPlaceholder: {
    width          : 90,
    height         : 110,
    backgroundColor: Colors.surfaceAlt,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  imgPlaceholderText: { fontSize: 32 },
  cardInfo    : { flex: 1, padding: Spacing.md, alignItems: 'flex-end', gap: Spacing.sm },
  date        : { fontSize: FontSize.sm, color: Colors.textHint },
  notes       : { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  actions     : { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  orderBtn    : {
    flex            : 1,
    backgroundColor : Colors.primaryGlow,
    borderRadius    : Radius.sm,
    paddingVertical : 6,
    paddingHorizontal: Spacing.sm,
    alignItems      : 'center',
  },
  orderBtnText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  deleteBtn   : {
    backgroundColor: Colors.errorLight,
    borderRadius   : Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
  },
  deleteBtnText: { fontSize: FontSize.sm },
  empty       : { alignItems: 'center', marginTop: 64 },
  emptyIcon   : { fontSize: 48, marginBottom: Spacing.md },
  emptyText   : {
    color     : Colors.textSecondary,
    fontSize  : FontSize.md,
    textAlign : 'center',
    lineHeight: 24,
  },
});
