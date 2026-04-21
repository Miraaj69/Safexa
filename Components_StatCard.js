import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function StatCard({ label, value, valueColor, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:  { flex: 1, backgroundColor: COLORS.bg2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: 11, color: COLORS.text2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  value: { fontSize: 28, fontWeight: '700', color: COLORS.text1, letterSpacing: -0.5 },
  sub:   { fontSize: 11, color: COLORS.text2, marginTop: 4 },
});
