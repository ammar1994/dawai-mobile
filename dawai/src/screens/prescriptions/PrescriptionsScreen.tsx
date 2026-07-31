import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Loader, Card } from '@components/ui';
import { prescriptionsApi } from '@api/services';
import { COLORS, FONTS, SPACING } from '@constants/config';

interface Prescription {
  id: string;
  imageUrl: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'في الانتظار',
  REVIEWING: 'قيد المراجعة',
  APPROVED: 'مقبول',
  REJECTED: 'مرفوض',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.warning,
  REVIEWING: COLORS.info,
  APPROVED: COLORS.success,
  REJECTED: COLORS.error,
};

export default function PrescriptionsScreen({ navigation }: any) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      const res = await prescriptionsApi.list();
      setPrescriptions(res.data.prescriptions ?? res.data);
    } catch {
      Alert.alert('خطأ', 'تعذّر تحميل الوصفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      await prescriptionsApi.upload({ imageUrl: uri });
      Alert.alert('تم الرفع', 'سيراجع الصيدلاني وصفتك قريباً');
      fetchPrescriptions();
    } catch {
      Alert.alert('خطأ', 'تعذّر رفع الوصفة');
    } finally {
      setUploading(false);
    }
  };

  const deletePrescription = (id: string) => {
    Alert.alert('حذف الوصفة', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          await prescriptionsApi.delete(id);
          setPrescriptions(p => p.filter(x => x.id !== id));
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>وصفاتي الطبية</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickAndUpload} disabled={uploading}>
          <Ionicons name="camera" size={20} color={COLORS.textPrimary} />
          <Text style={styles.uploadBtnText}>{uploading ? 'جارٍ الرفع...' : 'رفع وصفة'}</Text>
        </TouchableOpacity>
      </View>

      {prescriptions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد وصفات</Text>
          <Text style={styles.emptyText}>ارفع وصفتك الطبية وسيعدّها الصيدلاني لك</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={pickAndUpload}>
            <Text style={styles.emptyBtnText}>ارفع وصفة الآن</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              <View style={styles.cardBody}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] ?? COLORS.textMuted }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? COLORS.textMuted }]}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                </View>
                {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                </Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePrescription(item.id)}>
                  <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                  <Text style={styles.deleteBtnText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: FONTS.size.xxl, fontWeight: '700' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  uploadBtnText: { color: COLORS.textPrimary, fontSize: FONTS.size.sm, fontWeight: '600' },
  card: { flexDirection: 'row', marginBottom: SPACING.sm, overflow: 'hidden', padding: 0 },
  image: { width: 100, height: 100 },
  cardBody: { flex: 1, padding: SPACING.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FONTS.size.sm, fontWeight: '600' },
  notes: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 4 },
  date: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xs, alignSelf: 'flex-end' },
  deleteBtnText: { color: COLORS.error, fontSize: FONTS.size.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: '700', marginTop: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center', paddingHorizontal: SPACING.xl },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    borderRadius: 24, marginTop: SPACING.md,
  },
  emptyBtnText: { color: COLORS.textPrimary, fontWeight: '700' },
});
