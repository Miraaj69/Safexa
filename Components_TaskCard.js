import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { getStatusColor, getFreqLabel } from '../utils/helpers';

const FREQ_COLORS = {
  W: { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
  M: { bg: 'rgba(79,124,255,0.15)', text: '#7ea6ff' },
  Q: { bg: 'rgba(124,95,255,0.15)', text: '#a58fff' },
  Y: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
};

const BORDER_COLORS = {
  overdue: COLORS.red,
  pending: COLORS.amber,
  done:    COLORS.green,
};

export default function TaskCard({ task, onPress }) {
  const statusColor = getStatusColor(task.status);
  const borderColor = BORDER_COLORS[task.status] || COLORS.border;
  const fc = FREQ_COLORS[task.freq] || FREQ_COLORS.M;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }, task.status === 'done' && styles.doneCard]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBox, { backgroundColor: statusColor + '22' }]}>
        <Text style={{ fontSize: 20 }}>{task.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{task.equipmentName}</Text>
        <Text style={styles.meta}>{task.plantName} · {task.checklistNo}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.freqBadge, { backgroundColor: fc.bg }]}>
          <Text style={[styles.freqText, { color: fc.text }]}>{getFreqLabel(task.freq)}</Text>
        </View>
        <View style={[styles.dotStatus, { backgroundColor: statusColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bg2, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  doneCard:  { opacity: 0.65 },
  iconBox:   { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body:      { flex: 1, minWidth: 0 },
  name:      { fontSize: 13, fontWeight: '600', color: COLORS.text1 },
  meta:      { fontSize: 11, color: COLORS.text2, marginTop: 3 },
  right:     { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  freqBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  freqText:  { fontSize: 10, fontWeight: '600' },
  dotStatus: { width: 8, height: 8, borderRadius: 4, alignSelf: 'center' },
});
