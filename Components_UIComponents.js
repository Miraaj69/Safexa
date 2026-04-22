import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW, SEMANTIC } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';

// ─── Pressable Card ──────────────────────────────────────────────────────────
export function Card({ children, style, onPress, glow }) {
  const { colors, cardStyle } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

  const content = (
    <Animated.View style={[
      cardStyle,
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
        onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 400 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 400 }).start();

  const bgMap = {
    primary: SEMANTIC.primary,
    success: SEMANTIC.success,
    danger:  SEMANTIC.danger,
    ghost:   'transparent',
    outline: 'transparent',
  };

  const sizeMap = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, fontSize: 13, borderRadius: RADIUS.md },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, borderRadius: RADIUS.lg },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 15, borderRadius: RADIUS.xl },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={disabled || loading} activeOpacity={1}
        style={[{
          backgroundColor: bgMap[variant],
          paddingVertical:   s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius:      s.borderRadius,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          borderWidth:  variant === 'outline' ? 1 : 0,
          borderColor:  variant === 'outline' ? colors.border : 'transparent',
          opacity:      disabled ? 0.5 : 1,
        }, style]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text style={{
                color:      variant === 'ghost' ? colors.textSub : '#fff',
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

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:   { label: 'Pending',   color: SEMANTIC.warning, bg: SEMANTIC.warningDim },
    completed: { label: 'Completed', color: SEMANTIC.success, bg: SEMANTIC.successDim },
    overdue:   { label: 'Overdue',   color: SEMANTIC.danger,  bg: SEMANTIC.dangerDim  },
  };
  const { label, color, bg } = map[status] || map.pending;
  return (
    <View style={{ backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADIUS.full }}>
      <Text style={{ color, fontSize: 11, fontWeight: FONT.semibold, letterSpacing: 0.4 }}>{label}</Text>
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color = SEMANTIC.primary, style }) {
  const dimMap = {
    [SEMANTIC.primary]: SEMANTIC.primaryDim,
    [SEMANTIC.success]: SEMANTIC.successDim,
    [SEMANTIC.warning]: SEMANTIC.warningDim,
    [SEMANTIC.danger]:  SEMANTIC.dangerDim,
  };
  return (
    <View style={[{
      backgroundColor:   dimMap[color] || 'rgba(255,255,255,0.08)',
      paddingVertical:   4,
      paddingHorizontal: 10,
      borderRadius:      RADIUS.full,
    }, style]}>
      <Text style={{ color, fontSize: 11, fontWeight: FONT.semibold, letterSpacing: 0.4 }}>{label}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: FONT.semibold, letterSpacing: 0.2 }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: SEMANTIC.primary, fontSize: 13, fontWeight: FONT.medium }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ emoji = '🎯', title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 56 }}>
      <Text style={{ fontSize: 52, marginBottom: SPACING.lg }}>{emoji}</Text>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: FONT.semibold, marginBottom: SPACING.sm }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.textSub, fontSize: 14, textAlign: 'center' }}>{subtitle}</Text>}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ width, height = 16, style }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[{
      width: width || '100%', height, borderRadius: height / 2,
      backgroundColor: colors.border, opacity,
    }, style]} />
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
export function ProgressBar({ progress = 0, color = SEMANTIC.primary, height = 6, style }) {
  const { colors } = useTheme();
  return (
    <View style={[{ height, backgroundColor: colors.border, borderRadius: height }, style]}>
      <View style={{ height, width: `${Math.min(progress, 100)}%`, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}
