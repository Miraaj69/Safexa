import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, FlatList, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT } from './Constants_theme';
import { EmptyState, Row, Spacer, Badge } from './Components_UIComponents';
import { TaskCard } from './Components_TaskCard';
import { FAB, FABSheet } from './Components_FABSheet';
import { useApp } from './Context_AppContext';
import { PLANTS } from './Constants_data';

const STATUS_FILTERS = [
  { id: 'all',      label: 'All'     },
  { id: 'pending',  label: 'Pending' },
  { id: 'overdue',  label: 'Overdue' },
  { id: 'completed',label: 'Done'    },
];

export default function TasksScreen({ navigation }) {
  const { state, completeTask, deleteTask } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [plantFilter,  setPlantFilter]  = useState('all');
  const [search,       setSearch]       = useState('');
  const [fabOpen,      setFabOpen]      = useState(false);

  const filteredTasks = useMemo(() => {
    let tasks = [...state.tasks].sort((a, b) => {
      // Overdue first, then pending, then completed
      const order = { overdue: 0, pending: 1, completed: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

    if (statusFilter !== 'all') {
      tasks = tasks.filter(t => t.status === statusFilter);
    }
    if (plantFilter !== 'all') {
      tasks = tasks.filter(t => t.plantId === plantFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const clMap = {};
      state.checklists.forEach(c => clMap[c.id] = c.name.toLowerCase());
      tasks = tasks.filter(t =>
        clMap[t.checklistId]?.includes(q) ||
        PLANTS.find(p => p.id === t.plantId)?.name.toLowerCase().includes(q)
      );
    }
    return tasks;
  }, [state.tasks, state.checklists, statusFilter, plantFilter, search]);

  const overdueCount = state.tasks.filter(t => t.status === 'overdue').length;

  const renderItem = useCallback(({ item }) => (
    <TaskCard
      task={item}
      onComplete={(id) => completeTask(id)}
      onDelete={(id)   => deleteTask(id)}
      onPress={(task)  => navigation.navigate('TaskDetail', { task })}
    />
  ), [completeTask, deleteTask, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        {overdueCount > 0 && (
          <View style={styles.overdueAlert}>
            <Text style={styles.overdueText}>{overdueCount} overdue</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks..."
          placeholderTextColor={COLORS.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.textMuted }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.lg }}
      >
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setStatusFilter(f.id)}
            style={[styles.filterChip, statusFilter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, statusFilter === f.id && { color: '#fff' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plant Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.lg }}
      >
        <TouchableOpacity
          onPress={() => setPlantFilter('all')}
          style={[styles.plantChip, plantFilter === 'all' && styles.plantChipActive]}
        >
          <Text style={[styles.filterText, plantFilter === 'all' && { color: '#fff' }]}>All Plants</Text>
        </TouchableOpacity>
        {state.plants.map(p => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPlantFilter(p.id)}
            style={[styles.plantChip, plantFilter === p.id && { backgroundColor: p.color, borderColor: p.color }]}
          >
            <Text style={[styles.filterText, plantFilter === p.id && { color: '#fff' }]}>{p.code || p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={styles.count}>
        {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
      </Text>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji="🎯"
            title={search ? 'No results found' : 'No tasks here'}
            subtitle={search ? 'Try a different search' : 'All clear for this filter!'}
          />
        }
      />

      <FAB onPress={() => setFabOpen(true)} />
      <FABSheet visible={fabOpen} onClose={() => setFabOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop:      SPACING.lg,
    paddingBottom:   SPACING.md,
  },
  title: { color: COLORS.text, fontSize: 28, fontWeight: FONT.bold },
  overdueAlert: {
    backgroundColor: COLORS.dangerDim,
    borderRadius:    RADIUS.full,
    paddingVertical: 4, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.danger + '30',
  },
  overdueText: { color: COLORS.danger, fontSize: 12, fontWeight: FONT.semibold },
  searchBar: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.card,
    borderWidth:     1, borderColor: COLORS.border,
    borderRadius:    RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom:    SPACING.md,
    paddingHorizontal: SPACING.md,
    gap:             SPACING.sm,
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },
  filterRow:   { marginBottom: SPACING.sm },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius:   RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  plantChip: {
    paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  plantChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSub, fontSize: 13, fontWeight: FONT.medium },
  count: {
    color: COLORS.textMuted, fontSize: 12,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
});
