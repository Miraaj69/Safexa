import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT } from './Constants_theme';
import { Card, Button, Row, Spacer, StatusBadge, Badge } from './Components_UIComponents';
import { useApp } from './Context_AppContext';
import { PLANTS, CHECKLISTS, FREQUENCIES } from './Constants_data';
import dayjs from 'dayjs';

export default function TaskDetailScreen({ route, navigation }) {
  const { task } = route.params;
  const { completeTask, deleteTask, state } = useApp();
  const [remark,  setRemark]  = useState(task.remark || '');
  const [loading, setLoading] = useState(false);

  const plant     = state.plants.find(p => p.id === task.plantId) || PLANTS.find(p => p.id === task.plantId);
  const checklist = state.checklists.find(c => c.id === task.checklistId) || CHECKLISTS.find(c => c.id === task.checklistId);
  const freq      = FREQUENCIES[checklist?.defaultFreq?.toUpperCase()] || {};

  const handleComplete = async () => {
    setLoading(true);
    completeTask(task.id, remark);
    setLoading(false);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteTask(task.id); navigation.goBack(); },
      },
    ]);
  };

  const infoRows = [
    { label: 'Checklist No', value: checklist?.no },
    { label: 'Plant',        value: plant?.name    },
    { label: 'Date',         value: dayjs(task.date).format('DD MMM YYYY') },
    { label: 'Frequency',    value: freq.label || checklist?.defaultFreq },
    { label: 'Status',       value: null, badge: true },
    { label: 'Created',      value: dayjs(task.createdAt).format('DD MMM, HH:mm') },
    ...(task.completedAt ? [{
      label: 'Completed',
      value: dayjs(task.completedAt).format('DD MMM, HH:mm'),
    }] : []),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Row style={{ marginBottom: SPACING.xl }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>{checklist?.name}</Text>
        </Row>

        {/* Status Banner */}
        <View style={[styles.statusBanner, {
          backgroundColor:
            task.status === 'completed' ? COLORS.successDim :
            task.status === 'overdue'   ? COLORS.dangerDim  : COLORS.warningDim,
          borderColor:
            task.status === 'completed' ? COLORS.success :
            task.status === 'overdue'   ? COLORS.danger  : COLORS.warning,
        }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={styles.statusEmoji}>
              {task.status === 'completed' ? '✅' : task.status === 'overdue' ? '🚨' : '⏳'}
            </Text>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: FONT.semibold }}>
                {task.status === 'completed' ? 'Task Completed' :
                 task.status === 'overdue'   ? 'Task Overdue'   : 'Task Pending'}
              </Text>
              <Text style={{ color: COLORS.textSub, fontSize: 12, marginTop: 2 }}>
                {task.date}
              </Text>
            </View>
            <StatusBadge status={task.status} />
          </Row>
        </View>

        {/* Info Table */}
        <Card style={styles.infoCard}>
          {infoRows.map((row, i) => (
            <View key={row.label}>
              <Row style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                {row.badge
                  ? <StatusBadge status={task.status} />
                  : <Text style={styles.infoValue}>{row.value || '—'}</Text>
                }
              </Row>
              {i < infoRows.length - 1 && (
                <View style={styles.infoDivider} />
              )}
            </View>
          ))}
        </Card>

        {/* Plant Indicator */}
        {plant && (
          <Row style={[styles.plantRow, { borderColor: plant.color + '30' }]}>
            <View style={[styles.plantDot, { backgroundColor: plant.color }]} />
            <Text style={styles.plantName}>{plant.name}</Text>
            <Badge label={plant.code || ''} color={plant.color} />
          </Row>
        )}

        {/* Remark */}
        {task.status !== 'completed' && (
          <>
            <Text style={styles.label}>Remark</Text>
            <TextInput
              style={styles.remarkInput}
              value={remark}
              onChangeText={setRemark}
              placeholder="Add inspection remarks..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </>
        )}

        {task.status === 'completed' && task.remark ? (
          <Card style={{ marginBottom: SPACING.lg }}>
            <Text style={styles.label}>Remark</Text>
            <Text style={styles.remarkText}>{task.remark}</Text>
          </Card>
        ) : null}

        {/* Actions */}
        {task.status !== 'completed' && (
          <>
            <Button
              label="Mark as Complete ✓"
              onPress={handleComplete}
              loading={loading}
              variant="success"
              size="lg"
              style={{ marginBottom: SPACING.md }}
            />
            <Button
              label="Delete Task"
              onPress={handleDelete}
              variant="outline"
              size="lg"
              style={{ borderColor: COLORS.danger + '50' }}
            />
          </>
        )}

        <Spacer size={60} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  backText:  { color: COLORS.text, fontSize: 20 },
  title:     { color: COLORS.text, fontSize: 20, fontWeight: FONT.bold, flex: 1, lineHeight: 28 },
  statusBanner: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.lg, marginBottom: SPACING.lg,
  },
  statusEmoji: { fontSize: 24 },
  infoCard:    { marginBottom: SPACING.lg, padding: 0, overflow: 'hidden' },
  infoRow:     { justifyContent: 'space-between', padding: SPACING.md },
  infoLabel:   { color: COLORS.textSub, fontSize: 13 },
  infoValue:   { color: COLORS.text, fontSize: 13, fontWeight: FONT.medium },
  infoDivider: { height: 1, backgroundColor: COLORS.border },
  plantRow:    {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.lg,
  },
  plantDot:  { width: 10, height: 10, borderRadius: 5 },
  plantName: { color: COLORS.text, fontSize: 14, fontWeight: FONT.medium, flex: 1 },
  label: {
    color: COLORS.textSub, fontSize: 11, fontWeight: FONT.semibold,
    letterSpacing: 0.5, textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  remarkInput: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    color: COLORS.text, fontSize: 14, minHeight: 100,
    marginBottom: SPACING.lg,
  },
  remarkText: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
});
