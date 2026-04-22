import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Rect } from 'react-native-svg';
import { SEMANTIC, SPACING, RADIUS, FONT, SHADOW } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { Card, Row, Spacer, ProgressBar, SectionHeader } from './Components_UIComponents';
import { useApp } from './Context_AppContext';
import { MONTHS } from './Constants_data';
import dayjs from 'dayjs';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Animated compliance ring ─────────────────────────────────────────────────
function ComplianceRing({ value, color, size = 120, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const anim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 1100, useNativeDriver: false }).start();
  }, [value]);

  const offset = anim.interpolate({ inputRange: [0, 100], outputRange: [circ, 0] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size/2} cy={size/2} r={radius}
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent"
          rotation="-90" origin={`${size/2},${size/2}`} />
        <AnimatedCircle cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth={stroke} fill="transparent"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" rotation="-90" origin={`${size/2},${size/2}`} />
      </Svg>
      <Text style={{ color, fontSize: 22, fontWeight: FONT.extrabold }}>{value}%</Text>
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>compliance</Text>
    </View>
  );
}

// ─── Mini bar chart (weekly trend) ───────────────────────────────────────────
function WeeklyChart({ data, color }) {
  const max    = Math.max(...data.map(d => d.value), 1);
  const barW   = 28;
  const chartH = 60;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: chartH + 24 }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * chartH, 3);
        return (
          <View key={i} style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ width: barW, height: chartH, justifyContent: 'flex-end' }}>
              <View style={{
                width: barW, height: h,
                backgroundColor: i === data.length - 1 ? color : color + '55',
                borderRadius: 4,
              }} />
            </View>
            <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ReportsScreen() {
  const { colors }   = useTheme();
  const { state, getMonthlyStats } = useApp();
  const now          = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year,  setYear]  = useState(now.year());

  const monthlyStats = useMemo(() => getMonthlyStats(month, year), [month, year, state.tasks]);

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
    [monthTasks]
  );

  // Weekly trend data (last 6 weeks)
  const weeklyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const weekStart = dayjs().subtract(5 - i, 'week').startOf('week').format('YYYY-MM-DD');
      const weekEnd   = dayjs().subtract(5 - i, 'week').endOf('week').format('YYYY-MM-DD');
      const wTasks    = state.tasks.filter(t => t.date >= weekStart && t.date <= weekEnd);
      const done      = wTasks.filter(t => t.status === 'completed').length;
      const pct       = wTasks.length > 0 ? Math.round((done / wTasks.length) * 100) : 0;
      return { label: `W${i + 1}`, value: pct };
    });
  }, [state.tasks]);

  // Smart insight
  const insight = useMemo(() => {
    const prevMonthStats = getMonthlyStats(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year);
    const diff = monthlyStats.compliance - (prevMonthStats?.compliance || 0);
    if (diff > 10)  return { icon: '🚀', text: `Compliance up ${diff}% vs last month!`, color: SEMANTIC.success };
    if (diff < -10) return { icon: '⚠️', text: `Compliance dropped ${Math.abs(diff)}% vs last month`, color: SEMANTIC.danger };
    if (monthlyStats.compliance >= 90) return { icon: '🏆', text: 'Excellent compliance this month!', color: SEMANTIC.success };
    if (monthlyStats.compliance === 0) return { icon: '📭', text: 'No tasks recorded yet this month', color: SEMANTIC.warning };
    return { icon: '📊', text: `${monthlyStats.compliance}% compliance this month`, color: SEMANTIC.primary };
  }, [monthlyStats]);

  const compColor = monthlyStats.compliance >= 80 ? SEMANTIC.success
    : monthlyStats.compliance >= 50 ? SEMANTIC.warning : SEMANTIC.danger;

  const exportReport = async () => {
    const lines = [
      `Safety Checklist Report — ${MONTHS[month-1]} ${year}`,
      `${'='.repeat(44)}`,
      `Total Tasks   : ${monthlyStats.total}`,
      `Completed     : ${monthlyStats.completed}`,
      `Compliance    : ${monthlyStats.compliance}%`,
      '',
      'Plant-wise:',
      ...plantBreakdown.map(p => `  ${p.name}: ${p.pct}% (${p.completed}/${p.tasks})`),
    ];
    try {
      await Share.share({ message: lines.join('\n'), title: 'Safety Report' });
    } catch {
      Alert.alert('Error', 'Could not share report.');
    }
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const c = colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <Text style={{ color: c.text, fontSize: 28, fontWeight: FONT.bold }}>Reports 📊</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.bgCard, borderRadius: RADIUS.md, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border }}
            onPress={exportReport}
          >
            <Text style={{ color: SEMANTIC.primary, fontSize: 13, fontWeight: FONT.semibold }}>⬆ Export</Text>
          </TouchableOpacity>
        </Row>

        {/* Month Picker */}
        <Row style={{ justifyContent: 'center', alignItems: 'center', gap: SPACING.xl, backgroundColor: c.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: c.border, marginBottom: SPACING.lg }}>
          <TouchableOpacity onPress={prevMonth}>
            <Text style={{ color: c.text, fontSize: 22 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: FONT.semibold, minWidth: 150, textAlign: 'center' }}>
            {MONTHS[month - 1]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Text style={{ color: c.text, fontSize: 22 }}>›</Text>
          </TouchableOpacity>
        </Row>

        {/* Smart insight banner */}
        <View style={{ backgroundColor: insight.color + '18', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: insight.color + '30', marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <Text style={{ fontSize: 20 }}>{insight.icon}</Text>
          <Text style={{ color: insight.color, fontSize: 13, fontWeight: FONT.medium, flex: 1 }}>{insight.text}</Text>
        </View>

        {/* Hero compliance summary */}
        <Card glow style={{ marginBottom: SPACING.lg, padding: SPACING.xl }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.textSub, fontSize: 12, fontWeight: FONT.medium, letterSpacing: 0.5 }}>
                {MONTHS[month-1].toUpperCase()} {year}
              </Text>
              {/* HIERARCHY: big % first */}
              <Text style={{ color: compColor, fontSize: 48, fontWeight: FONT.extrabold, lineHeight: 56 }}>
                {monthlyStats.compliance}%
              </Text>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: FONT.semibold }}>Compliance Rate</Text>
              <Spacer size={SPACING.md} />
              <ProgressBar progress={monthlyStats.compliance} color={compColor} height={8} />
              <Row style={{ marginTop: SPACING.md, gap: SPACING.xl }}>
                <View>
                  <Text style={{ color: c.text, fontSize: 20, fontWeight: FONT.bold }}>{monthlyStats.total}</Text>
                  <Text style={{ color: c.textSub, fontSize: 11 }}>Total</Text>
                </View>
                <View>
                  <Text style={{ color: SEMANTIC.success, fontSize: 20, fontWeight: FONT.bold }}>{monthlyStats.completed}</Text>
                  <Text style={{ color: c.textSub, fontSize: 11 }}>Done</Text>
                </View>
                <View>
                  <Text style={{ color: SEMANTIC.danger, fontSize: 20, fontWeight: FONT.bold }}>{monthlyStats.total - monthlyStats.completed}</Text>
                  <Text style={{ color: c.textSub, fontSize: 11 }}>Missed</Text>
                </View>
              </Row>
            </View>
            <ComplianceRing value={monthlyStats.compliance} color={compColor} />
          </Row>
        </Card>

        {/* Weekly trend */}
        <SectionHeader title="Weekly Trend" />
        <Card style={{ marginBottom: SPACING.lg, padding: SPACING.lg }}>
          <WeeklyChart data={weeklyData} color={SEMANTIC.primary} />
        </Card>

        {/* Quick stat pills */}
        <Row style={{ gap: SPACING.sm, marginBottom: SPACING.lg }}>
          {[
            { label: 'Pending', value: monthTasks.filter(t => t.status === 'pending').length,   color: SEMANTIC.warning },
            { label: 'Overdue', value: monthTasks.filter(t => t.status === 'overdue').length,   color: SEMANTIC.danger  },
            { label: 'Done',    value: monthTasks.filter(t => t.status === 'completed').length, color: SEMANTIC.success },
          ].map(s => (
            <Card key={s.label} style={{ flex: 1, padding: SPACING.md, alignItems: 'center' }}>
              <Text style={{ color: s.color, fontSize: 24, fontWeight: FONT.bold }}>{s.value}</Text>
              <Text style={{ color: c.textSub, fontSize: 11, marginTop: 2 }}>{s.label}</Text>
            </Card>
          ))}
        </Row>

        {/* Plant-wise compliance */}
        <SectionHeader title="Plant-wise Compliance" />
        {plantBreakdown.map(p => {
          const pc = p.pct >= 80 ? SEMANTIC.success : p.pct >= 50 ? SEMANTIC.warning : SEMANTIC.danger;
          return (
            <Card key={p.id} style={{ marginBottom: SPACING.sm, padding: SPACING.md }}>
              <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Row style={{ gap: SPACING.sm }}>
                  {/* Plant color — indicator only, not decorative rainbow */}
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: p.color }} />
                  <Text style={{ color: c.text, fontSize: 14, fontWeight: FONT.medium }}>{p.name}</Text>
                </Row>
                <Text style={{ color: pc, fontSize: 14, fontWeight: FONT.bold }}>{p.pct}%</Text>
              </Row>
              <ProgressBar progress={p.pct} color={p.color} height={6} />
              <Row style={{ marginTop: SPACING.sm, gap: SPACING.lg }}>
                <Text style={{ color: c.textMuted, fontSize: 11 }}>✅ {p.completed}</Text>
                <Text style={{ color: c.textMuted, fontSize: 11 }}>⏳ {p.pending}</Text>
                <Text style={{ color: c.textMuted, fontSize: 11 }}>🚨 {p.overdue}</Text>
                <Text style={{ color: c.textMuted, fontSize: 11, marginLeft: 'auto' }}>{p.tasks} total</Text>
              </Row>
            </Card>
          );
        })}

        <Spacer size={SPACING.xl} />
      </ScrollView>
    </SafeAreaView>
  );
}
