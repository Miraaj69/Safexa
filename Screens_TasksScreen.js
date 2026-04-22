import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SEMANTIC, SPACING, RADIUS, FONT } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { EmptyState, Row, Spacer } from './Components_UIComponents';
import { TaskCard } from './Components_TaskCard';
import { FAB, FABSheet } from './Components_FABSheet';
import { useApp } from './Context_AppContext';

const STATUS_FILTERS = [
  { id: 'all',       label: 'All'     },
  { id: 'pending',   label: '⏳ Pending' },
  { id: 'overdue',   label: '🚨 Overdue' },
  { id: 'completed', label: '✅ Done'    },
];

export default function TasksScreen({ navigation }) {
  const { colors } = useTheme();
  const { state, completeTask, deleteTask } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [plantFilter,  setPlantFilter]  = useState('all');
  const [search,       setSearch]       = useState('');
  const [fabOpen,      setFabOpen]      = useState(false);

  const filteredTasks = useMemo(() => {
    let tasks = [...state.tasks].sort((a, b) => {
      const o = { overdue: 0, pending: 1, completed: 2 };
      return (o[a.status] ?? 3) - (o[b.status] ?? 3);
    });
    if (statusFilter !== 'all') tasks = tasks.filter(t => t.status === statusFilter);
    if (plantFilter !== 'all')  tasks = tasks.filter(t => t.plantId === plantFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      const clMap = {};
      state.checklists.forEach(c => { clMap[c.id] = c.name.toLowerCase(); });
      tasks = tasks.filter(t =>
        clMap[t.checklistId]?.includes(q) ||
        state.plants.find(p => p.id === t.plantId)?.name.toLowerCase().includes(q)
      );
    }
    return tasks;
  }, [state.tasks, state.checklists, statusFilter, plantFilter, search]);

  const overdueCount = state.tasks.filter(t => t.status === 'overdue').length;

  const renderItem = useCallback(({ item }) => (
    <TaskCard
      task={item}
      onComplete={id => completeTask(id)}
      onDelete={id => deleteTask(id)}
      onPress={task => navigation.navigate('TaskDetail', { task })}
    />
  ), [completeTask, deleteTask, navigation]);

  // Chip styles — same height, rounded pills, consistent
  const chip = (active, color) => ({
    paddingVertical:   7,
    paddingHorizontal: 14,
    borderRadius:      RADIUS.full,
    borderWidth:       1,
    borderColor:       active ? (color || SEMANTIC.primary) : colors.border,
    backgroundColor:   active ? (color ? color + '22' : SEMANTIC.primaryDim) : colors.bgCard,
    marginRight:       SPACING.sm,
    marginBottom:      SPACING.sm,
  });
  const chipText = (active, color) => ({
    color:      active ? (color || SEMANTIC.primary) : colors.textSub,
    fontSize:   12,
    fontWeight: FONT.medium,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        {overdueCount > 0 && (
          <View style={{ backgroundColor: SEMANTIC.dangerDim, borderRadius: RADIUS.full, paddingVertical: 4, paddingHorizontal: 12 }}>
            <Text style={{ color: SEMANTIC.danger, fontSize: 12, fontWeight: FONT.semibold }}>{overdueCount} overdue</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={{ fontSize: 14 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={search} onChangeText={setSearch}
          placeholder="Search tasks..." placeholderTextColor={colors.textMuted}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter — scrollable row, uniform pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}
      >
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity key={f.id} style={chip(statusFilter === f.id)} onPress={() => setStatusFilter(f.id)}>
            <Text style={chipText(statusFilter === f.id)}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plant Filter — scrollable row, plant color when active */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm }}
      >
        <TouchableOpacity style={chip(plantFilter === 'all')} onPress={() => setPlantFilter('all')}>
          <Text style={chipText(plantFilter === 'all')}>All Plants</Text>
        </TouchableOpacity>
        {state.plants.map(p => (
          <TouchableOpacity key={p.id} style={chip(plantFilter === p.id, p.color)} onPress={() => setPlantFilter(p.id)}>
            <Text style={chipText(plantFilter === p.id, p.color)}>{p.code || p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm }}>
        {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji="🎯"
            title={search ? 'No results found' : 'You\'re all caught up!'}
            subtitle={search ? 'Try a different search term' : 'No tasks match this filter.'}
          />
        }
      />

      <FAB onPress={() => setFabOpen(true)} />
      <FABSheet visible={fabOpen} onClose={() => setFabOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { fontSize: 28, fontWeight: FONT.bold },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md, gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 11 },
});
