import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { PLANTS } from '../constants/plants';
import { EQUIPMENTS } from '../constants/equipments';
import { getMonthlyStats } from '../utils/taskGenerator';
import { getFreqLabel } from '../utils/helpers';
import dayjs from 'dayjs';

export default function ReportsScreen() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [month,   setMonth]   = useState(dayjs().month() + 1);
  const [year,    setYear]    = useState(dayjs().year());

  useEffect(() => { loadStats(); }, [month, year]);

  const loadStats = async () => {
    setLoading(true);
    const data = await getMonthlyStats(year, month);
    setStats(data);
    setLoading(false);
  };

  const exportReport = async () => {
    if (!stats) return;
    const lines = [
      `Safety Checklist Report - ${dayjs(`${year}-${month}-01`).format('MMMM YYYY')}`,
      `================================================`,
      `Total Tasks   : ${stats.total}`,
      `Completed     : ${stats.done}`,
      `Missed/Overdue: ${stats.missed}`,
      `Compliance    : ${stats.compliance}%`,
      ``,
      `Plant-wise Compliance:`,
      ...PLANTS.map(p => {
        const ps = stats.plantStats?.[p.id];
        if (!ps) return `  ${p.name}: No data`;
        const pct = ps.total > 0 ? Math.round((ps.done / ps.total) * 100) : 0;
        return `  ${p.name}: ${pct}% (${ps.done}/${ps.total})`;
      }),
    ];
    try {
      await Share.share({ message: lines.join('\n'), title: 'Safety Report' });
    } catch {
      Alert.alert('Error', 'Could not share report.');
    }
  };

  const monthLabel = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).format('MMMM YYYY');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports 📊</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={exportReport}>
          <Ionicons name="share-outline" size={18} color={COLORS.accent} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setMonth(m => m > 1 ? m - 1 : (setYear(y => y - 1) || 12))}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text1} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={() => setMonth(m => m < 12 ? m + 1 : (setYear(y => y + 1) || 1))}>
          <Ionicons name="chevron-forward" size={22} color={COLORS.text1} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : !stats || stats.total === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 36 }}>📭</Text>
          <Text style={styles.noDataText}>No data for this month</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          {/* Summary Cards */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Compliance</Text>
              <Text style={[styles.statVal, { color: stats.compliance >= 80 ? COLORS.green : stats.compliance >= 60 ? COLORS.amber : COLORS.red }]}>
                {stats.compliance}%
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Tasks</Text>
              <Text style={styles.statVal}>{stats.total}</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Completed ✅</Text>
              <Text style={[styles.statVal, { color: COLORS.green }]}>{stats.done}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Missed 🚨</Text>
              <Text style={[styles.statVal, { color: COLORS.red }]}>{stats.missed}</Text>
            </View>
          </View>

          {/* Plant-wise */}
          <Text style={styles.sectionHead}>Plant-wise Compliance</Text>
          {PLANTS.map(plant => {
            const ps  = stats.plantStats?.[plant.id];
            if (!ps || ps.total === 0) return null;
            const pct = Math.round((ps.done / ps.total) * 100);
            const col = pct >= 85 ? COLORS.green : pct >= 65 ? COLORS.amber : COLORS.red;
            return (
              <View key={plant.id} style={styles.plantRow}>
                <View style={[styles.plantDot, { backgroundColor: plant.color }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.plantRowTop}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={[styles.plantPct, { color: col }]}>{pct}%</Text>
                  </View>
                  <View style={styles.bar}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: col }]} />
                  </View>
                  <Text style={styles.plantSub}>{ps.done}/{ps.total} tasks done</Text>
                </View>
              </View>
            );
          })}

          {/* Equipment compliance */}
          <Text style={styles.sectionHead}>Equipment Overview</Text>
          {EQUIPMENTS.map(eq => (
            <View key={eq.id} style={styles.equipRow}>
              <Text style={styles.equipIcon}>{eq.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.equipName} numberOfLines={1}>{eq.name}</Text>
                <Text style={styles.equipSub}>{eq.checklistNo} · {getFreqLabel(eq.freq)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg0 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title:       { fontSize: 22, fontWeight: '700', color: COLORS.text1 },
  exportBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, backgroundColor: COLORS.bg2, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  exportText:  { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  monthNav:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, paddingVertical: 10, backgroundColor: COLORS.bg2, marginHorizontal: 16, borderRadius: 12, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border },
  monthLabel:  { fontSize: 16, fontWeight: '600', color: COLORS.text1, minWidth: 140, textAlign: 'center' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noDataText:  { fontSize: 16, color: COLORS.text2 },
  statRow:     { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard:    { flex: 1, backgroundColor: COLORS.bg2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  statLabel:   { fontSize: 11, color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  statVal:     { fontSize: 26, fontWeight: '700', color: COLORS.text1, letterSpacing: -0.5 },
  sectionHead: { fontSize: 12, fontWeight: '600', color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  plantRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  plantDot:    { width: 10, height: 40, borderRadius: 5 },
  plantRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  plantName:   { fontSize: 13, fontWeight: '600', color: COLORS.text1 },
  plantPct:    { fontSize: 13, fontWeight: '700' },
  bar:         { height: 5, backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden' },
  barFill:     { height: 5, borderRadius: 3 },
  plantSub:    { fontSize: 11, color: COLORS.text3, marginTop: 3 },
  equipRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bg2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  equipIcon:   { fontSize: 22 },
  equipName:   { fontSize: 13, fontWeight: '500', color: COLORS.text1 },
  equipSub:    { fontSize: 11, color: COLORS.text2, marginTop: 3 },
});
