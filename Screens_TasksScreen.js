import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/theme';
import { PLANTS } from '../constants/plants';
import TaskCard from '../components/TaskCard';

const STATUS_FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'overdue', label: '🚨 Overdue' },
  { key: 'pending', label: '⏳ Pending' },
  { key: 'done',    label: '✅ Done' },
];

export default function TasksScreen({ navigation, route }) {
  const { state } = useApp();
  const { tasks } = state;

  const [statusFilter, setStatusFilter] = useState(route?.params?.status || 'all');
  const [plantFilter,  setPlantFilter]  = useState(route?.params?.plantId || 'ALL');
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    if (route?.params?.status) setStatusFilter(route.params.status);
    if (route?.params?.plantId) setPlantFilter(route.params.plantId);
  }, [route?.params]);

  const filtered = tasks.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPlant  = plantFilter === 'ALL' || t.plantId === plantFilter;
    const matchSearch = !search || t.equipmentName.toLowerCase().includes(search.toLowerCase()) || t.plantName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPlant && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.sub}>{filtered.length} tasks</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.text3} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search equipment or plant..."
          placeholderTextColor={COLORS.text3}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Status Filter Chips */}
      <View style={styles.chipRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, statusFilter === f.key && styles.chipActive]}
            onPress={() => setStatusFilter(f.key)}
          >
            <Text style={[styles.chipText, statusFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plant Filter Chips */}
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, plantFilter === 'ALL' && styles.chipActive]}
          onPress={() => setPlantFilter('ALL')}
        >
          <Text style={[styles.chipText, plantFilter === 'ALL' && styles.chipTextActive]}>All Plants</Text>
        </TouchableOpacity>
        {PLANTS.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, plantFilter === p.id && styles.chipActive, plantFilter === p.id && { borderColor: p.color }]}
            onPress={() => setPlantFilter(p.id)}
          >
            <Text style={[styles.chipText, plantFilter === p.id && { color: p.color }]}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { task: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🎉</Text>
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptySub}>No tasks match this filter.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.bg0 },
  header:        { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title:         { fontSize: 22, fontWeight: '700', color: COLORS.text1 },
  sub:           { fontSize: 13, color: COLORS.text2 },
  searchRow:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: COLORS.bg2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  searchInput:   { flex: 1, color: COLORS.text1, fontSize: 14 },
  chipRow:       { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4, flexWrap: 'wrap', gap: 6 },
  chip:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border },
  chipActive:    { backgroundColor: 'rgba(79,124,255,0.15)', borderColor: COLORS.accent },
  chipText:      { fontSize: 12, fontWeight: '500', color: COLORS.text2 },
  chipTextActive:{ color: COLORS.accent },
  empty:         { alignItems: 'center', paddingTop: 60 },
  emptyTitle:    { fontSize: 18, fontWeight: '600', color: COLORS.text1, marginTop: 12 },
  emptySub:      { fontSize: 13, color: COLORS.text2, marginTop: 6 },
});
