import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { EQUIPMENTS, FREQ_LABELS } from '../constants/equipments';
import { PLANTS } from '../constants/plants';

const FREQ_COLORS = {
  W: { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
  M: { bg: 'rgba(79,124,255,0.15)',  text: '#7ea6ff' },
  Q: { bg: 'rgba(124,95,255,0.15)',  text: '#a58fff' },
  Y: { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
};

export default function MasterScreen() {
  const [search, setSearch] = useState('');
  const [tab,    setTab]    = useState('equipment'); // 'equipment' | 'plants'

  const filteredEquip = EQUIPMENTS.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.checklistNo.includes(search)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Master Data ⚙️</Text>
        <Text style={styles.sub}>{EQUIPMENTS.length} checklists · {PLANTS.length} plants</Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'equipment' && styles.tabBtnActive]}
          onPress={() => setTab('equipment')}
        >
          <Text style={[styles.tabText, tab === 'equipment' && styles.tabTextActive]}>
            🧯 Equipment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'plants' && styles.tabBtnActive]}
          onPress={() => setTab('plants')}
        >
          <Text style={[styles.tabText, tab === 'plants' && styles.tabTextActive]}>
            🏭 Plants
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'equipment' ? (
        <>
          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color={COLORS.text3} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or checklist no..."
              placeholderTextColor={COLORS.text3}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredEquip}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const fc = FREQ_COLORS[item.freq] || FREQ_COLORS.M;
              return (
                <View style={styles.equipCard}>
                  <View style={styles.equipIconBox}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.equipName}>{item.name}</Text>
                    <Text style={styles.equipNo}>{item.checklistNo}</Text>
                    <Text style={styles.equipCat}>{item.category}</Text>
                  </View>
                  <View>
                    <View style={[styles.freqBadge, { backgroundColor: fc.bg }]}>
                      <Text style={[styles.freqText, { color: fc.text }]}>
                        {FREQ_LABELS[item.freq]}
                      </Text>
                    </View>
                    <Text style={styles.equipId}>{item.id}</Text>
                  </View>
                </View>
              );
            }}
          />
        </>
      ) : (
        <FlatList
          data={PLANTS}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.plantCard}>
              <View style={[styles.plantColorBar, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.plantName}>{item.name}</Text>
                <Text style={styles.plantId}>ID: {item.id}</Text>
              </View>
              <Text style={styles.plantEquipCount}>
                {Object.keys(require('../constants/plants').PLANT_SCHEDULE[item.id] || {}).length} equipments
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.bg0 },
  header:        { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title:         { fontSize: 22, fontWeight: '700', color: COLORS.text1 },
  sub:           { fontSize: 12, color: COLORS.text2 },
  tabRow:        { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.bg2, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  tabBtn:        { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabBtnActive:  { backgroundColor: COLORS.bg3 },
  tabText:       { fontSize: 13, fontWeight: '500', color: COLORS.text2 },
  tabTextActive: { color: COLORS.text1 },
  searchRow:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.bg2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  searchInput:   { flex: 1, color: COLORS.text1, fontSize: 14 },
  equipCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bg2, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  equipIconBox:  { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bg3, alignItems: 'center', justifyContent: 'center' },
  equipName:     { fontSize: 13, fontWeight: '600', color: COLORS.text1, marginBottom: 3 },
  equipNo:       { fontSize: 11, color: COLORS.text2 },
  equipCat:      { fontSize: 11, color: COLORS.text3, marginTop: 2 },
  freqBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignItems: 'center', marginBottom: 4 },
  freqText:      { fontSize: 10, fontWeight: '600' },
  equipId:       { fontSize: 10, color: COLORS.text3, textAlign: 'center' },
  plantCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.bg2, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  plantColorBar: { width: 6, height: 44, borderRadius: 3 },
  plantName:     { fontSize: 15, fontWeight: '600', color: COLORS.text1 },
  plantId:       { fontSize: 12, color: COLORS.text2, marginTop: 3 },
  plantEquipCount:{ fontSize: 12, color: COLORS.text3 },
});
