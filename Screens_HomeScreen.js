import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from './Context_AppContext';
import { COLORS } from './Constants_theme';
import { groupTasksByStatus, groupTasksByPlant, formatDate } from './Utils_helpers';
import { PLANTS } from './Constants_plants';
import ScoreRing from './Components_ScoreRing';
import StatCard  from './Components_StatCard';
import PlantCard from './Components_PlantCard';
import TaskCard  from './Components_TaskCard';
import dayjs from 'dayjs';

export default function HomeScreen({ navigation }) {
  const { state, loadTodayTasks } = useApp();
  const { tasks, loading } = state;

  const grouped = groupTasksByStatus(tasks);
  const total   = tasks.length;
  const done    = grouped.done.length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTodayTasks} tintColor={COLORS.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Safety Hub 🛡️</Text>
            <Text style={styles.headerSub}>{dayjs().format('dddd, DD MMMM YYYY')}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            {grouped.overdue.length > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* Compliance Ring Hero */}
        <View style={styles.heroCard}>
          <ScoreRing pct={pct} size={90} strokeWidth={9} />
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>Today's Compliance</Text>
            <Text style={styles.heroValue}>{done} / {total}</Text>
            <Text style={styles.heroSub}>tasks completed</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
          </View>
        </View>

        {/* Stat Row */}
        <View style={styles.statRow}>
          <StatCard
            label="Overdue 🚨"
            value={grouped.overdue.length}
            valueColor={COLORS.red}
            sub="Needs attention"
            onPress={() => navigation.navigate('Tasks')}
          />
          <StatCard
            label="Pending ⏳"
            value={grouped.pending.length}
            valueColor={COLORS.amber}
            sub="Due today"
            onPress={() => navigation.navigate('Tasks')}
          />
        </View>

        {/* Plants Overview */}
        <Text style={styles.sectionHead}>Plants Overview</Text>
        {PLANTS.slice(0, 4).map(plant => {
          const plantTasks  = tasks.filter(t => t.plantId === plant.id);
          const plantDone   = plantTasks.filter(t => t.status === 'done').length;
          const plantOver   = plantTasks.filter(t => t.status === 'overdue').length;
          const plantPct    = plantTasks.length > 0 ? Math.round((plantDone / plantTasks.length) * 100) : 0;
          return (
            <PlantCard
              key={plant.id}
              plant={plant}
              pct={plantPct}
              overdue={plantOver}
              total={plantTasks.length}
              onPress={() => navigation.navigate('Tasks', { screen: 'TasksList', params: { plantId: plant.id } })}
            />
          );
        })}

        {/* Recent Overdue */}
        {grouped.overdue.length > 0 && (
          <>
            <Text style={[styles.sectionHead, { color: COLORS.red }]}>🚨 Overdue Tasks</Text>
            {grouped.overdue.slice(0, 3).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { task } })}
              />
            ))}
          </>
        )}

        {/* Recent Done */}
        {grouped.done.length > 0 && (
          <>
            <Text style={styles.sectionHead}>✅ Recently Completed</Text>
            {grouped.done.slice(0, 3).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { task } })}
              />
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg0 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text1 },
  headerSub:   { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  bellBtn:     { position: 'relative', padding: 4 },
  bellDot:     { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  heroCard:    { margin: 16, padding: 16, backgroundColor: COLORS.bg2, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(79,124,255,0.25)', flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroInfo:    { flex: 1 },
  heroLabel:   { fontSize: 13, color: COLORS.text2, marginBottom: 4 },
  heroValue:   { fontSize: 26, fontWeight: '700', color: COLORS.text1, letterSpacing: -0.5 },
  heroSub:     { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  progressBar: { height: 6, backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill:{ height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  statRow:     { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  sectionHead: { fontSize: 12, fontWeight: '600', color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
});
