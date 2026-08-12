import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';
import api from '../../api/client';

interface SearchResult { medicineName: string; branchId: string; branchName: string; tenantName: string; available: boolean; }

export function MedicineSearchScreen() {
  const navigation = useNavigation<any>();
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched,  setSearched]  = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setIsLoading(true); setSearched(true);
    try {
      const { data } = await api.get('/pharmacies/search-medicine', { params: { query: query.trim() } });
      setResults(data.data ?? data);
    } catch { setResults([]); }
    finally { setIsLoading(false); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>→</Text></TouchableOpacity>
        <Text style={styles.title}>البحث عن دواء</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchBox}>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="اسم الدواء..."
          placeholderTextColor={Colors.textHint}
          textAlign="right"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      {isLoading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} size="large" />
        : (
          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Pharmacies', { screen: 'PharmacyDetail', params: { pharmacyId: item.branchId } })}
                activeOpacity={0.85}
              >
                <View style={[styles.avail, { backgroundColor: item.available ? Colors.successLight : Colors.errorLight }]}>
                  <Text style={{ color: item.available ? Colors.success : Colors.error, fontSize: FontSize.xs, fontWeight: FontWeight.medium }}>
                    {item.available ? 'متوفر' : 'غير متوفر'}
                  </Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.medName}>{item.medicineName}</Text>
                  <Text style={styles.branchName}>{item.tenantName} — {item.branchName}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searched ? <View style={styles.empty}><Text style={styles.emptyIcon}>🔍</Text><Text style={styles.emptyText}>لا نتائج لـ "{query}"</Text></View> :
              <View style={styles.empty}><Text style={styles.emptyIcon}>💊</Text><Text style={styles.emptyText}>ابحث عن أي دواء لمعرفة الصيدليات التي توفره</Text></View>
            }
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: FontSize.lg, color: Colors.primary, padding: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  searchBox: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary },
  searchBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  searchBtnText: { color: Colors.white, fontWeight: FontWeight.bold },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardText: { flex: 1, alignItems: 'flex-end', marginEnd: Spacing.sm },
  medName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: 'right' },
  branchName: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
  avail: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  empty: { alignItems: 'center', marginTop: 64, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },
});
