import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from './Constants_theme';
import { StatusBadge, Row } from './Components_UIComponents';
import { PLANTS, CHECKLISTS } from './Constants_data';

const SCREEN_W  = Dimensions.get('window').width;
const SWIPE_T   = SCREEN_W * 0.25;

export function TaskCard({ task, onComplete, onDelete, onPress }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;

  const plant    = PLANTS.find(p => p.id === task.plantId);
  const checklist = CHECKLISTS.find(c => c.id === task.checklistId);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder:   () => true,
    onMoveShouldSetPanResponder:    (_, g) => Math.abs(g.dx) > 5,
    onPanResponderMove:             (_, g) => translateX.setValue(g.dx),
    onPanResponderRelease:          (_, g) => {
      if (g.dx > SWIPE_T && task.status !== 'completed') {
        // Swipe right → complete
        Animated.timing(translateX, { toValue: SCREEN_W, duration: 250, useNativeDriver: true }).start(() => {
          onComplete?.(task.id);
          translateX.setValue(0);
        });
      } else if (g.dx < -SWIPE_T) {
        // Swipe left → delete
        Animated.timing(translateX, { toValue: -SCREEN_W, duration: 250, useNativeDriver: true }).start(() => {
          onDelete?.(task.id);
          translateX.setValue(0);
        });
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 200 }).start();
      }
    },
  });

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

  const statusColor = {
    pending:   COLORS.warning,
    completed: COLORS.success,
    overdue:   COLORS.danger,
  }[task.status];

  // Background hints for swipe
  const rightBg = translateX.interpolate({
    inputRange: [0, SWIPE_T],
    outputRange: ['transparent', COLORS.successDim],
    extrapolate: 'clamp',
  });
  const leftBg = translateX.interpolate({
    inputRange: [-SWIPE_T, 0],
    outputRange: [COLORS.dangerDim, 'transparent'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      {/* Swipe hint backgrounds */}
      <Animated.View style={[styles.swipeHint, styles.swipeRight, { backgroundColor: rightBg }]}>
        <Text style={styles.swipeText}>✓ Done</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeHint, styles.swipeLeft, { backgroundColor: leftBg }]}>
        <Text style={styles.swipeTextRight}>Delete ✕</Text>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }, { scale }] }}
      >
        <TouchableOpacity
          onPress={() => onPress?.(task)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <View style={[styles.card, { borderLeftColor: statusColor, borderLeftWidth: 3 }]}>
            <Row style={{ justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <View style={[styles.dot, { backgroundColor: plant?.color || COLORS.primary }]} />
              <Text style={styles.plantName}>{plant?.name || '—'}</Text>
              <View style={{ flex: 1 }} />
              <StatusBadge status={task.status} />
            </Row>

            <Text style={styles.checklistName} numberOfLines={2}>
              {checklist?.name || 'Unknown Checklist'}
            </Text>

            <Row style={{ marginTop: SPACING.sm, justifyContent: 'space-between' }}>
              <Text style={styles.checklistNo}>{checklist?.no}</Text>
              <Text style={styles.date}>{task.date}</Text>
            </Row>

            {task.remark ? (
              <Text style={styles.remark} numberOfLines={1}>
                💬 {task.remark}
              </Text>
            ) : null}

            {task.status === 'pending' && (
              <Text style={styles.swipeHintText}>← Swipe to complete / delete →</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position:     'relative',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow:     'hidden',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         SPACING.lg,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, marginRight: 8,
  },
  plantName: {
    color:      COLORS.textSub,
    fontSize:   12,
    fontWeight: FONT.medium,
  },
  checklistName: {
    color:      COLORS.text,
    fontSize:   15,
    fontWeight: FONT.semibold,
    lineHeight: 22,
  },
  checklistNo: {
    color:    COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  date: {
    color:    COLORS.textMuted,
    fontSize: 12,
  },
  remark: {
    color:      COLORS.textSub,
    fontSize:   12,
    marginTop:  SPACING.sm,
    fontStyle:  'italic',
  },
  swipeHintText: {
    color:      COLORS.textMuted,
    fontSize:   10,
    textAlign:  'center',
    marginTop:  SPACING.sm,
    letterSpacing: 0.3,
  },
  swipeHint: {
    position:       'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    borderRadius:   RADIUS.lg,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  swipeRight: { alignItems: 'flex-start' },
  swipeLeft:  { alignItems: 'flex-end'   },
  swipeText:      { color: COLORS.success, fontSize: 14, fontWeight: FONT.bold },
  swipeTextRight: { color: COLORS.danger,  fontSize: 14, fontWeight: FONT.bold },
});
