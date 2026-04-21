import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

// Divider
export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: COLORS.border, marginVertical: 8 }, style]} />;
}

// Section Header
export function SectionHead({ children, color, style }) {
  return (
    <Text style={[styles.sectionHead, color && { color }, style]}>{children}</Text>
  );
}

// Empty State
export function EmptyState({ icon = '📭', title = 'Nothing here', subtitle }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={{ fontSize: 44 }}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// Primary Button
export function PrimaryButton({ label, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, (disabled || loading) && { opacity: 0.6 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color="white" />
        : <Text style={styles.primaryBtnText}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// Secondary Button
export function SecondaryButton({ label, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.secondaryBtn, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Frequency Badge
export function FreqBadge({ freq }) {
  const map = {
    W: { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', label: 'Weekly' },
    M: { bg: 'rgba(79,124,255,0.15)', text: '#7ea6ff', label: 'Monthly' },
    Q: { bg: 'rgba(124,95,255,0.15)', text: '#a58fff', label: 'Quarterly' },
    Y: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Yearly' },
  };
  const c = map[freq] || map.M;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

// Progress Bar
export function ProgressBar({ pct, color, height = 6 }) {
  return (
    <View style={[styles.barBg, { height }]}>
      <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color || COLORS.accent, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead:      { fontSize: 12, fontWeight: '600', color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  emptyWrap:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle:       { fontSize: 17, fontWeight: '600', color: COLORS.text1 },
  emptySub:         { fontSize: 13, color: COLORS.text2, textAlign: 'center', lineHeight: 20 },
  primaryBtn:       { backgroundColor: COLORS.accent, borderRadius: 14, padding: 15, alignItems: 'center' },
  primaryBtnText:   { fontSize: 15, fontWeight: '700', color: 'white' },
  secondaryBtn:     { backgroundColor: COLORS.bg2, borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text1 },
  badge:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:        { fontSize: 10, fontWeight: '600' },
  barBg:            { backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden' },
  barFill:          { borderRadius: 3 },
});
