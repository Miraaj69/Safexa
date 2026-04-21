import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from './Constants_theme';

// ─── Pressable Card ──────────────────────────────────────────────────────────
export function Card({ children, style, onPress, glow }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300 }).start();

  const content = (
    <Animated.View style={[
      styles.card,
      glow && SHADOW.glow,
      style,
      { transform: [{ scale }] },
    ]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, style,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 400 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 400 }).start();

  const bgMap = {
    primary:  COLORS.primary,
    success:  COLORS.success,
    danger:   COLORS.danger,
    ghost:    'transparent',
    outline:  'transparent',
  };

  const sizeMap = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, fontSize: 13, borderRadius: RADIUS.md },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, borderRadius: RADIUS.lg },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 16, borderRadius: RADIUS.xl },
  };

  const s = sizeMap[size];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          {
            backgroundColor: bgMap[variant],
            paddingVertical:  s.paddingVertical,
            paddingHorizontal: s.paddingHorizontal,
            borderRadius:     s.borderRadius,
            flexDirection:    'row',
            alignItems:       'center',
            justifyContent:   'center',
            borderWidth:      variant === 'outline' ? 1 : 0,
            borderColor:      variant === 'outline' ? COLORS.border : 'transparent',
            opacity:          disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text style={{
                color:      variant === 'ghost' ? COLORS.textSub : '#fff',
                fontSize:   s.fontSize,
                fontWeight: FONT.semibold,
                letterSpacing: 0.2,
              }}>{label}</Text>
            </>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Badge / Chip ─────────────────────────────────────────────────────────────
export function Badge({ label, color = COLORS.primary, style }) {
  const dimMap = {
    [COLORS.primary]: COLORS.primaryDim,
    [COLORS.success]: COLORS.successDim,
    [COLORS.warning]: COLORS.warningDim,
    [COLORS.danger]:  COLORS.dangerDim,
  };
  return (
    <View style={[{
      backgroundColor: dimMap[color] || 'rgba(255,255,255,0.08)',
      paddingVertical:   4,
      paddingHorizontal: 10,
      borderRadius:      RADIUS.full,
      borderWidth:       1,
      borderColor:       color + '30',
    }, style]}>
      <Text style={{ color, fontSize: 11, fontWeight: FONT.semibold, letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:   { label: 'Pending',   color: COLORS.warning },
    completed: { label: 'Completed', color: COLORS.success },
    overdue:   { label: 'Overdue',   color: COLORS.danger  },
  };
  const { label, color } = map[status] || map.pending;
  return <Badge label={label} color={color} />;
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: COLORS.border }, style]} />;
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ emoji = '🎯', title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ width, height = 16, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{
      width:         width || '100%',
      height,
      borderRadius:  height / 2,
      backgroundColor: COLORS.border,
      opacity,
    }, style]} />
  );
}

// ─── Circular Progress ───────────────────────────────────────────────────────
export function CircularProgress({ size = 120, progress = 0, color = COLORS.primary, children }) {
  const strokeWidth = 8;
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressVal   = circumference * (1 - progress / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: COLORS.border,
        position: 'absolute',
      }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        borderTopColor: 'transparent',
        borderRightColor: progress > 50 ? color : 'transparent',
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
      }} />
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

// ─── Spacer ──────────────────────────────────────────────────────────────────
export function Spacer({ size = SPACING.md }) {
  return <View style={{ height: size }} />;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ progress = 0, color = COLORS.primary, height = 6, style }) {
  return (
    <View style={[{ height, backgroundColor: COLORS.border, borderRadius: height }, style]}>
      <View style={{
        height,
        width:         `${Math.min(progress, 100)}%`,
        backgroundColor: color,
        borderRadius:  height,
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         SPACING.lg,
    ...SHADOW.card,
  },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.md,
  },
  sectionTitle: {
    color:      COLORS.text,
    fontSize:   16,
    fontWeight: FONT.semibold,
    letterSpacing: 0.2,
  },
  sectionAction: {
    color:    COLORS.primary,
    fontSize: 13,
    fontWeight: FONT.medium,
  },
  emptyState: {
    alignItems:  'center',
    paddingVertical: 48,
  },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: {
    color:      COLORS.text,
    fontSize:   18,
    fontWeight: FONT.semibold,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    color:     COLORS.textSub,
    fontSize:  14,
    textAlign: 'center',
  },
});
