import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function PlantCard({ plant, pct, overdue, total, onPress }) {
  const badgeColor = overdue > 0 ? COLORS.red : COLORS.green;
  const badgeBg    = overdue > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)';
  const badgeLabel = overdue > 0 ? `${overdue} overdue` : 'on track ✓';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.colorBar, { backgroundColor: plant.color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: plant.color }]} />
        </View>
        <Text style={styles.sub}>{total} tasks total</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={[styles.pct, { color: plant.color }]}>{pct}%</Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bg2, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  colorBar:  { width: 6, height: 44, borderRadius: 3, flexShrink: 0 },
  plantName: { fontSize: 13, fontWeight: '600', color: COLORS.text1, marginBottom: 6 },
  bar:       { height: 5, backgroundColor: COLORS.bg3, borderRadius: 3, overflow: 'hidden' },
  barFill:   { height: 5, borderRadius: 3 },
  sub:       { fontSize: 11, color: COLORS.text3, marginTop: 4 },
  pct:       { fontSize: 16, fontWeight: '700' },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600' },
});
