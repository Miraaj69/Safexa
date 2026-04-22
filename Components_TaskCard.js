import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { SEMANTIC, SPACING, RADIUS, FONT } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { StatusBadge, Row } from './Components_UIComponents';

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_T  = SCREEN_W * 0.25;

// Frequency badge — consistent color system
function FreqBadge({ freq }) {
  const map = {
    daily:     { color: SEMANTIC.primary, bg: SEMANTIC.primaryDim, label: 'Daily'     },
    weekly:    { color: SEMANTIC.success, bg: SEMANTIC.successDim, label: 'Weekly'    },
    monthly:   { color: SEMANTIC.warning, bg: SEMANTIC.warningDim, label: 'Monthly'   },
    quarterly: { color: '#A855F7',        bg: 'rgba(168,85,247,0.15)', label: 'Quarterly' },
    yearly:    { color: SEMANTIC.danger,  bg: SEMANTIC.dangerDim,  label: 'Yearly'    },
    // short codes from equipment data
    W: { color: SEMANTIC.success, bg: SEMANTIC.successDim, label: 'Weekly'    },
    M: { color: SEMANTIC.warning, bg: SEMANTIC.warningDim, label: 'Monthly'   },
    Q: { color: '#A855F7',        bg: 'rgba(168,85,247,0.15)', label: 'Quarterly' },
    Y: { color: SEMANTIC.danger,  bg: SEMANTIC.dangerDim,  label: 'Yearly'    },
  };
  const c = map[freq] || map.M;
  return (
    <View style={{ backgroundColor: c.bg, paddingVertical: 3, paddingHorizontal: 8, borderRadius: RADIUS.full }}>
      <Text style={{ color: c.color, fontSize: 10, fontWeight: FONT.semibold }}>{c.label}</Text>
    </View>
  );
}

export function TaskCard({ task, onComplete, onDelete, onPress }) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;

  // Status → left border color (strict: only 3 semantic colors)
  const statusColor = {
    pending:   SEMANTIC.warning,
    completed: SEMANTIC.success,
    overdue:   SEMANTIC.danger,
  }[task.status] || SEMANTIC.warning;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder:   () => true,
    onMoveShouldSetPanResponder:    (_, g) => Math.abs(g.dx) > 8,
    onPanResponderMove:             (_, g) => translateX.setValue(g.dx),
    onPanResponderRelease:          (_, g) => {
      if (g.dx > SWIPE_T && task.status !== 'completed') {
        Animated.timing(translateX, { toValue: SCREEN_W, duration: 220, useNativeDriver: true }).start(() => {
          onComplete?.(task.id);
          translateX.setValue(0);
        });
      } else if (g.dx < -SWIPE_T) {
        Animated.timing(translateX, { toValue: -SCREEN_W, duration: 220, useNativeDriver: true }).start(() => {
          onDelete?.(task.id);
          translateX.setValue(0);
        });
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 200 }).start();
      }
    },
  });

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  const rightBg = translateX.interpolate({
    inputRange: [0, SWIPE_T], outputRange: ['transparent', SEMANTIC.successDim], extrapolate: 'clamp',
  });
  const leftBg = translateX.interpolate({
    inputRange: [-SWIPE_T, 0], outputRange: [SEMANTIC.dangerDim, 'transparent'], extrapolate: 'clamp',
  });

  return (
    <View style={[styles.wrapper, { borderRadius: RADIUS.lg }]}>
      {/* Swipe hint backgrounds */}
      <Animated.View style={[styles.swipeHint, styles.swipeRight, { backgroundColor: rightBg }]}>
        <Text style={{ color: SEMANTIC.success, fontSize: 14, fontWeight: FONT.bold }}>✓ Done</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeHint, styles.swipeLeft, { backgroundColor: leftBg }]}>
        <Text style={{ color: SEMANTIC.danger, fontSize: 14, fontWeight: FONT.bold }}>Delete ✕</Text>
      </Animated.View>

      <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }, { scale }] }}>
        <TouchableOpacity onPress={() => onPress?.(task)} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
          <View style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              borderLeftColor: statusColor,
            },
          ]}>
            {/* Top row: plant dot + name + status badge */}
            <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Row style={{ gap: SPACING.sm, flex: 1 }}>
                <View style={[styles.plantDot, { backgroundColor: SEMANTIC.primary }]} />
                <Text style={[styles.plantName, { color: colors.textSub }]} numberOfLines={1}>
                  {task.plantId}
                </Text>
              </Row>
              <StatusBadge status={task.status} />
            </Row>

            {/* Checklist name — main content, bold */}
            <Text style={[styles.checklistName, { color: colors.text }]} numberOfLines={2}>
              {task.checklistId}
            </Text>

            {/* Bottom row: checklist no + freq badge + date */}
            <Row style={{ marginTop: SPACING.sm, justifyContent: 'space-between' }}>
              <Row style={{ gap: SPACING.sm }}>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{task.date}</Text>
                {task.freq && <FreqBadge freq={task.freq} />}
              </Row>
            </Row>

            {task.remark ? (
              <Text style={[styles.remark, { color: colors.textSub }]} numberOfLines={1}>💬 {task.remark}</Text>
            ) : null}

            {task.status === 'pending' && (
              <Text style={[styles.swipeHintText, { color: colors.textMuted }]}>← swipe to complete / delete →</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Compact version used inside TaskDetail
export function TaskCardCompact({ task, onPress }) {
  const { colors } = useTheme();
  const statusColor = {
    pending: SEMANTIC.warning, completed: SEMANTIC.success, overdue: SEMANTIC.danger,
  }[task.status] || SEMANTIC.warning;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderLeftColor: statusColor }]}
      onPress={() => onPress?.(task)} activeOpacity={0.75}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={[styles.checklistName, { color: colors.text, flex: 1 }]} numberOfLines={1}>{task.checklistId}</Text>
        <StatusBadge status={task.status} />
      </Row>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', marginBottom: SPACING.md, overflow: 'hidden' },
  card: {
    borderRadius: RADIUS.lg, borderWidth: 1, borderLeftWidth: 3,
    padding: SPACING.lg,
  },
  plantDot:      { width: 8, height: 8, borderRadius: 4 },
  plantName:     { fontSize: 12, fontWeight: FONT.medium },
  checklistName: { fontSize: 15, fontWeight: FONT.semibold, lineHeight: 22 },
  meta:          { fontSize: 12 },
  remark:        { fontSize: 12, marginTop: SPACING.sm, fontStyle: 'italic' },
  swipeHintText: { fontSize: 10, textAlign: 'center', marginTop: SPACING.sm, letterSpacing: 0.3 },
  swipeHint:     { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: RADIUS.lg, justifyContent: 'center', paddingHorizontal: SPACING.xl },
  swipeRight:    { alignItems: 'flex-start' },
  swipeLeft:     { alignItems: 'flex-end' },
});
