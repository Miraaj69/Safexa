import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Animated, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from './Constants_theme';
import {
  Card, SectionHeader, Row, Spacer, ProgressBar, Skeleton,
} from './Components_UIComponents';
import { FAB, FABSheet } from './Components_FABSheet';
import { useApp } from './Context_AppContext';
import dayjs from 'dayjs';

export default function HomeScreen({ navigation }) {
  const { getTodayStats, getPlantStats, state, generateTasksForToday, syncOverdueTasks } = useApp();
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [fabOpen,   setFabOpen]   = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const stats = getTodayStats();

  useEffect(() => {
    (async () => {
      syncOverdueTasks();
      generateTasksForToday();
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1,  duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0,  duration: 500, useNativeDriver: true }),
      ]).start();
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    syncOverdueTasks();
    generateTasksForToday();
    setRefreshing(false);
  };

  const compliance = stats.compliance;
  const complianceColor =
    compliance >= 80 ? COLORS.success :
    compliance >= 50 ? COLORS.warning : COLORS.danger;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.xl }}>
            <View>
              <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
              <Text style={styles.date}>{dayjs().format('dddd, DD MMM YYYY')}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>EHS</Text>
            </View>
          </Row>

          {/* Compliance Hero Card */}
          {loading ? (
            <Skeleton height={180} style={{ marginBottom: SPACING.lg }} />
          ) : (
            <Card glow style={[styles.heroCard, { borderColor: complianceColor + '30' }]}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroLabel}>Today's Compliance</Text>
                  <Text style={[styles.heroValue, { color: complianceColor }]}>
                    {compliance}%
                  </Text>
                  <Text style={styles.heroSub}>
                    {stats.completed}/{stats.total} tasks completed
                  </Text>
                  <Spacer size={SPACING.md} />
                  <ProgressBar progress={compliance} color={complianceColor} height={8} />
                </View>
                <ComplianceRing value={compliance} color={complianceColor} />
              </Row>

              {stats.overdue > 0 && (
                <View style={styles.alertBanner}>
                  <Text style={styles.alertText}>
                    ⚠️  {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} need attention
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Stat Pills */}
          <Row style={{ gap: SPACING.sm, marginBottom: SPACING.xl }}>
            {[
              { label: 'Pending',   value: stats.pending,   color: COLORS.warning },
              { label: 'Done',      value: stats.completed, color: COLORS.success },
              { label: 'Overdue',   value: stats.overdue,   color: COLORS.danger  },
            ].map(s => (
              <TouchableOpacity
                key={s.label}
                style={[styles.pill, { flex: 1, borderColor: s.color + '30', backgroundColor: s.color + '10' }]}
                onPress={() => navigation.navigate('Tasks')}
              >
                <Text style={[styles.pillValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.pillLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </Row>

          {/* Plant Progress */}
          <SectionHeader
            title="Plant Status"
            action="View All"
            onAction={() => navigation.navigate('Tasks')}
          />
          {state.plants.map(plant => {
            const ps = getPlantStats(plant.id);
            return (
              <Card key={plant.id} style={styles.plantCard} onPress={() => navigation.navigate('Tasks')}>
                <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                  <Row style={{ gap: SPACING.sm }}>
                    <View style={[styles.plantDot, { backgroundColor: plant.color }]} />
                    <Text style={styles.plantName}>{plant.name}</Text>
                  </Row>
                  <Text style={[styles.plantPct, {
                    color: ps.compliance >= 80 ? COLORS.success :
                           ps.compliance >= 50 ? COLORS.warning : COLORS.danger
                  }]}>
                    {ps.compliance}%
                  </Text>
                </Row>
                <ProgressBar
                  progress={ps.compliance}
                  color={plant.color}
                  height={5}
                />
                <Text style={styles.plantTasks}>{ps.completed}/{ps.total} tasks</Text>
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

function ComplianceRing({ value, color }) {
  const size   = 90;
  const stroke = 7;
  const pct    = Math.min(value, 100);

  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: stroke, borderColor: COLORS.border,
      alignItems: 'center', justifyContent: 'center',
      marginLeft: SPACING.lg,
      borderTopColor: pct > 25 ? color : COLORS.border,
      borderRightColor: pct > 50 ? color : COLORS.border,
      borderBottomColor: pct > 75 ? color : COLORS.border,
    }}>
      <Text style={{ color, fontSize: 18, fontWeight: FONT.bold }}>{value}%</Text>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: SPACING.lg },
  greeting:   { color: COLORS.text,    fontSize: 22, fontWeight: FONT.bold },
  date:       { color: COLORS.textSub, fontSize: 13, marginTop: 2 },
  avatar:     {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1, borderColor: COLORS.primary + '50',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: COLORS.primary, fontSize: 12, fontWeight: FONT.bold },
  heroCard: { marginBottom: SPACING.lg },
  heroLabel: { color: COLORS.textSub, fontSize: 12, fontWeight: FONT.medium, marginBottom: 4, letterSpacing: 0.5 },
  heroValue: { fontSize: 52, fontWeight: FONT.extrabold, lineHeight: 60 },
  heroSub:   { color: COLORS.textSub, fontSize: 13, marginTop: 4 },
  alertBanner: {
    marginTop:       SPACING.md,
    backgroundColor: COLORS.dangerDim,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    borderWidth:     1,
    borderColor:     COLORS.danger + '30',
  },
  alertText: { color: COLORS.danger, fontSize: 13, fontWeight: FONT.medium },
  pill: {
    padding:      SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth:  1,
    alignItems:   'center',
  },
  pillValue: { fontSize: 22, fontWeight: FONT.bold },
  pillLabel: { color: COLORS.textSub, fontSize: 11, marginTop: 2 },
  plantCard: { marginBottom: SPACING.sm, padding: SPACING.md },
  plantDot:  { width: 10, height: 10, borderRadius: 5 },
  plantName: { color: COLORS.text, fontSize: 14, fontWeight: FONT.medium },
  plantPct:  { fontSize: 14, fontWeight: FONT.bold },
  plantTasks:{ color: COLORS.textMuted, fontSize: 11, marginTop: SPACING.xs },
});
