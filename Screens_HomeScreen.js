import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Animated, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { SEMANTIC, SPACING, RADIUS, FONT, SHADOW } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { Card, SectionHeader, Row, Spacer, ProgressBar, Skeleton } from './Components_UIComponents';
import { FAB, FABSheet } from './Components_FABSheet';
import { useApp } from './Context_AppContext';
import dayjs from 'dayjs';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ComplianceRing({ value, color, size = 96, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const anim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 1000, useNativeDriver: false }).start();
  }, [value]);

  const dashOffset = anim.interpolate({ inputRange: [0, 100], outputRange: [circ, 0] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size/2} cy={size/2} r={radius}
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent"
          rotation="-90" origin={`${size/2},${size/2}`} />
        <AnimatedCircle cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth={stroke} fill="transparent"
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          strokeLinecap="round" rotation="-90" origin={`${size/2},${size/2}`} />
      </Svg>
      <Text style={{ color, fontSize: 20, fontWeight: FONT.extrabold }}>{value}%</Text>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { getTodayStats, getPlantStats, state, generateTasksForToday, syncOverdueTasks } = useApp();
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen,    setFabOpen]    = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const stats = getTodayStats();

  useEffect(() => {
    syncOverdueTasks();
    generateTasksForToday();
    setLoading(false);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    syncOverdueTasks();
    generateTasksForToday();
    setRefreshing(false);
  };

  const compliance = stats.compliance;
  const compColor  =
    compliance >= 80 ? SEMANTIC.success :
    compliance >= 50 ? SEMANTIC.warning : SEMANTIC.danger;

  const s = StyleSheet.create({
    safe:        { flex: 1, backgroundColor: colors.bg },
    greeting:    { color: colors.text,    fontSize: 22, fontWeight: FONT.bold },
    date:        { color: colors.textSub, fontSize: 13, marginTop: 2 },
    avatar:      {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: SEMANTIC.primaryDim,
      borderWidth: 1, borderColor: SEMANTIC.primary + '50',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText:  { color: SEMANTIC.primary, fontSize: 12, fontWeight: FONT.bold },

    // ── Hero card ──
    heroCard:    { marginBottom: SPACING.lg },
    heroLabel:   { color: colors.textSub, fontSize: 12, fontWeight: FONT.medium, letterSpacing: 0.5, marginBottom: 4 },
    // VISUAL HIERARCHY: % is the HERO, fraction is secondary, label is small
    heroValue:   { fontSize: 52, fontWeight: FONT.extrabold, lineHeight: 60, color: compColor },
    heroFraction:{ fontSize: 18, fontWeight: FONT.semibold, color: colors.text, marginTop: 2 },
    heroSub:     { color: colors.textSub, fontSize: 13, marginTop: 2 },

    alertBanner: {
      marginTop: SPACING.md, backgroundColor: SEMANTIC.dangerDim,
      borderRadius: RADIUS.md, padding: SPACING.md,
      borderWidth: 1, borderColor: SEMANTIC.danger + '30',
    },
    alertText:   { color: SEMANTIC.danger, fontSize: 13, fontWeight: FONT.medium },

    // ── Stat pills ──
    pill:        {
      padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1,
      alignItems: 'center', flex: 1,
    },
    pillValue:   { fontSize: 24, fontWeight: FONT.bold },
    pillLabel:   { color: colors.textSub, fontSize: 11, marginTop: 2 },

    // ── Plant cards ──
    plantCard:   { marginBottom: SPACING.sm, padding: SPACING.md },
    plantDot:    { width: 10, height: 10, borderRadius: 5 },
    plantName:   { color: colors.text, fontSize: 14, fontWeight: FONT.medium },
    plantPct:    { fontSize: 14, fontWeight: FONT.bold },
    plantTasks:  { color: colors.textMuted, fontSize: 11, marginTop: SPACING.xs },
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SEMANTIC.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header */}
          <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.xl }}>
            <View>
              <Text style={s.greeting}>Good {getGreeting()} 👋</Text>
              <Text style={s.date}>{dayjs().format('dddd, DD MMM YYYY')}</Text>
            </View>
            <View style={s.avatar}><Text style={s.avatarText}>EHS</Text></View>
          </Row>

          {/* Compliance Hero — STRICT hierarchy */}
          {loading
            ? <Skeleton height={160} style={{ marginBottom: SPACING.lg }} />
            : (
              <Card glow style={s.heroCard}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.heroLabel}>TODAY'S COMPLIANCE</Text>
                    {/* BIG: percentage is hero */}
                    <Text style={s.heroValue}>{compliance}%</Text>
                    {/* MEDIUM: fraction */}
                    <Text style={s.heroFraction}>{stats.completed}/{stats.total} tasks</Text>
                    {/* SMALL: label */}
                    <Text style={s.heroSub}>completed today</Text>
                    <Spacer size={SPACING.md} />
                    <ProgressBar progress={compliance} color={compColor} height={8} />
                  </View>
                  <ComplianceRing value={compliance} color={compColor} />
                </Row>

                {stats.overdue > 0 && (
                  <View style={s.alertBanner}>
                    <Text style={s.alertText}>
                      ⚠️  {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} need attention
                    </Text>
                  </View>
                )}
              </Card>
            )
          }

          {/* Stat Pills — all same accent family, no rainbow */}
          <Row style={{ gap: SPACING.sm, marginBottom: SPACING.xl }}>
            {[
              { label: 'Pending',  value: stats.pending,   color: SEMANTIC.warning, bg: SEMANTIC.warningDim },
              { label: 'Done',     value: stats.completed, color: SEMANTIC.success, bg: SEMANTIC.successDim },
              { label: 'Overdue',  value: stats.overdue,   color: SEMANTIC.danger,  bg: SEMANTIC.dangerDim  },
            ].map(pill => (
              <TouchableOpacity
                key={pill.label}
                style={[s.pill, { borderColor: pill.color + '30', backgroundColor: pill.bg }]}
                onPress={() => navigation.navigate('Tasks')}
                activeOpacity={0.75}
              >
                <Text style={[s.pillValue, { color: pill.color }]}>{pill.value}</Text>
                <Text style={s.pillLabel}>{pill.label}</Text>
              </TouchableOpacity>
            ))}
          </Row>

          {/* Plant Status */}
          <SectionHeader title="Plant Status" action="View All" onAction={() => navigation.navigate('Tasks')} />
          {state.plants.map(plant => {
            const ps = getPlantStats(plant.id);
            const pc = ps.compliance >= 80 ? SEMANTIC.success : ps.compliance >= 50 ? SEMANTIC.warning : SEMANTIC.danger;
            return (
              <Card key={plant.id} style={s.plantCard} onPress={() => navigation.navigate('Tasks')}>
                <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                  <Row style={{ gap: SPACING.sm }}>
                    {/* Plant color dot — only indicator, no rainbow border */}
                    <View style={[s.plantDot, { backgroundColor: plant.color }]} />
                    <Text style={s.plantName}>{plant.name}</Text>
                  </Row>
                  <Text style={[s.plantPct, { color: pc }]}>{ps.compliance}%</Text>
                </Row>
                {/* Bar uses plant color (accent system indicator, not decoration) */}
                <ProgressBar progress={ps.compliance} color={plant.color} height={5} />
                <Text style={s.plantTasks}>{ps.completed}/{ps.total} tasks</Text>
              </Card>
            );
          })}

          <Spacer size={100} />
        </Animated.View>
      </ScrollView>

      <FAB onPress={() => setFabOpen(true)} />
      <FABSheet visible={fabOpen} onClose={() => setFabOpen(false)} />
    </SafeAreaView>
  );
}
