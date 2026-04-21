import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT } from './Constants_theme';
import { Card, Row, Spacer, ProgressBar, SectionHeader } from './Components_UIComponents';
import { useApp } from './Context_AppContext';
import { MONTHS } from './Constants_data';
import dayjs from 'dayjs';

export default function ReportsScreen() {
  const { state, getMonthlyStats, getPlantStats } = useApp();
  const now  = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year,  setYear]  = useState(now.year());

  const monthlyStats = useMemo(() =>
    getMonthlyStats(month, year),
    [month, year, state.tasks]
  );

  // Monthly tasks breakdown
  const monthStart = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).format('YYYY-MM-DD');
  const monthEnd   = dayjs(monthStart).endOf('month').format('YYYY-MM-DD');
  const monthTasks = state.tasks.filter(t => t.date >= monthStart && t.date <= monthEnd);

  const plantBreakdown = useMemo(() =>
    state.plants.map(plant => {
      const tasks     = monthTasks.filter(t => t.plantId === plant.id);
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending   = tasks.filter(t => t.status === 'pending').length;
      const overdue   = tasks.filter(t => t.status === 'overdue').length;
      const pct       = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      return { ...plant, tasks: tasks.length, completed, pending, overdue, pct };
    }),
    [monthTasks, state.plants]
  );

  const checklistBreakdown = useMemo(() =>
    state.checklists.map(cl => {
      const tasks     = monthTasks.filter(t => t.checklistId === cl.id);
      const completed = tasks.filter(t => t.status === 'completed').length;
      return { ...cl, total: tasks.length, completed };
    }).filter(c => c.total > 0),
    [monthTasks, state.checklists]
  );

  const complianceColor =
    monthlyStats.compliance >= 80 ? COLORS.success :
    monthlyStats.compliance >= 50 ? COLORS.warning  : COLORS.danger;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Reports</Text>

        {/* Month Picker */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: SPACING.lg }}
          contentContainerStyle={{ gap: SPACING.sm }}
        >
          {MONTHS.map((m, i) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMonth(i + 1)}
              style={[styles.monthChip, month === i + 1 && styles.monthChipActive]}
            >
              <Text style={[styles.monthText, month === i + 1 && { color: '#fff' }]}>
                {m.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Card */}
        <Card glow style={styles.summaryCard}>
          <Text style={styles.summaryMonth}>{MONTHS[month - 1]} {year}</Text>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: SPACING.sm }}>
            <View>
              <Text style={[styles.compliancePct, { color: complianceColor }]}>
                {monthlyStats.compliance}%
              </Text>
              <Text style={styles.complianceLabel}>Compliance Rate</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statNum}>{monthlyStats.total}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.statNum, { color: COLORS.success }]}>{monthlyStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </Row>
          <Spacer size={SPACING.md} />
          <ProgressBar progress={monthlyStats.compliance} color={complianceColor} height={10} />
        </Card>

        {/* Quick Stats */}
        <Row style={{ gap: SPACING.sm, marginBottom: SPACING.lg }}>
          {[
            { label: 'Pending', value: monthTasks.filter(t => t.status === 'pending').length,   color: COLORS.warning },
            { label: 'Overdue', value: monthTasks.filter(t => t.status === 'overdue').length,   color: COLORS.danger  },
            { label: 'Done',    value: monthTasks.filter(t => t.status === 'completed').length, color: COLORS.success },
          ].map(s => (
            <Card key={s.label} style={[styles.quickStat, { flex: 1, borderColor: s.color + '20' }]}>
              <Text style={[styles.quickValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.quickLabel}>{s.label}</Text>
            </Card>
          ))}
        </Row>

        {/* Plant Breakdown */}
        <SectionHeader title="Plant-wise Compliance" />
        {plantBreakdown.map(p => (
          <Card key={p.id} style={styles.plantCard}>
            <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Row style={{ gap: SPACING.sm }}>
                <View style={[styles.dot, { backgroundColor: p.color }]} />
                <Text style={styles.plantName}>{p.name}</Text>
              </Row>
              <Text style={[styles.plantPct, {
                color: p.pct >= 80 ? COLORS.success : p.pct >= 50 ? COLORS.warning : COLORS.danger
              }]}>{p.pct}%</Text>
            </Row>
            <ProgressBar progress={p.pct} color={p.color} height={6} />
            <Row style={{ marginTop: SPACING.sm, gap: SPACING.lg }}>
              <Text style={styles.miniStat}>✅ {p.completed}</Text>
              <Text style={styles.miniStat}>⏳ {p.pending}</Text>
              <Text style={styles.miniStat}>🚨 {p.overdue}</Text>
              <Text style={[styles.miniStat, { marginLeft: 'auto' }]}>{p.tasks} total</Text>
            </Row>
          </Card>
        ))}

        {checklistBreakdown.length > 0 && (
          <>
            <Spacer size={SPACING.sm} />
            <SectionHeader title="Checklist Performance" />
            {checklistBreakdown.map(cl => (
              <Card key={cl.id} style={styles.clCard}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={styles.clName} numberOfLines={1}>{cl.name}</Text>
                  <Text style={styles.clPct}>
                    {cl.total > 0 ? Math.round((cl.completed / cl.total) * 100) : 0}%
                  </Text>
                </Row>
                <ProgressBar
                  progress={cl.total > 0 ? (cl.completed / cl.total) * 100 : 0}
                  color={COLORS.primary}
                  height={4}
                />
                <Text style={styles.clSub}>{cl.no} · {cl.completed}/{cl.total}</Text>
              </Card>
            ))}
          </>
        )}

        <Spacer size={80} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  title:   { color: COLORS.text, fontSize: 28, fontWeight: FONT.bold, marginBottom: SPACING.lg },
  monthChip: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  monthChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  monthText:       { color: COLORS.textSub, fontSize: 13, fontWeight: FONT.medium },
  summaryCard:     { marginBottom: SPACING.lg },
  summaryMonth:    { color: COLORS.textSub, fontSize: 13, fontWeight: FONT.medium },
  compliancePct:   { fontSize: 48, fontWeight: FONT.extrabold, lineHeight: 56 },
  complianceLabel: { color: COLORS.textSub, fontSize: 12 },
  statNum:   { color: COLORS.text, fontSize: 22, fontWeight: FONT.bold },
  statLabel: { color: COLORS.textSub, fontSize: 11, marginTop: 2 },
  quickStat: { padding: SPACING.md, alignItems: 'center' },
  quickValue:{ fontSize: 24, fontWeight: FONT.bold },
  quickLabel:{ color: COLORS.textSub, fontSize: 11, marginTop: 2 },
  plantCard: { marginBottom: SPACING.sm, padding: SPACING.md },
  dot:       { width: 10, height: 10, borderRadius: 5 },
  plantName: { color: COLORS.text, fontSize: 14, fontWeight: FONT.medium },
  plantPct:  { fontSize: 14, fontWeight: FONT.bold },
  miniStat:  { color: COLORS.textMuted, fontSize: 11 },
  clCard:    { marginBottom: SPACING.sm, padding: SPACING.md },
  clName:    { color: COLORS.text, fontSize: 13, fontWeight: FONT.medium, flex: 1, marginRight: SPACING.sm },
  clPct:     { color: COLORS.primary, fontSize: 13, fontWeight: FONT.bold },
  clSub:     { color: COLORS.textMuted, fontSize: 11, marginTop: 4, fontFamily: 'monospace' },
});
