import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { SEMANTIC, SPACING, RADIUS, FONT } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { Card, Button, Row, Spacer, StatusBadge, Badge } from './Components_UIComponents';
import { useApp } from './Context_AppContext';
import { FREQUENCIES } from './Constants_data';
import dayjs from 'dayjs';

export default function TaskDetailScreen({ route, navigation }) {
  const { task }  = route.params;
  const { colors } = useTheme();
  const { completeTask, deleteTask, state } = useApp();

  const [remark,   setRemark]   = useState(task.remark || '');
  const [photoUri, setPhotoUri] = useState(task.photoUri || null);
  const [loading,  setLoading]  = useState(false);

  const plant     = state.plants.find(p => p.id === task.plantId);
  const checklist = state.checklists.find(c => c.id === task.checklistId);
  const freq      = FREQUENCIES[checklist?.defaultFreq?.toUpperCase()];

  const handleComplete = async () => {
    setLoading(true);
    completeTask(task.id, remark, photoUri);
    setLoading(false);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(task.id); navigation.goBack(); } },
    ]);
  };

  const pickPhoto = () => {
    Alert.alert('Add Photo Proof', 'Select source', [
      {
        text: 'Camera', onPress: async () => {
          const r = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [4,3] });
          if (!r.canceled) setPhotoUri(r.assets[0].uri);
        },
      },
      {
        text: 'Gallery', onPress: async () => {
          const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
          if (!r.canceled) setPhotoUri(r.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const statusColorMap = {
    completed: SEMANTIC.success,
    overdue:   SEMANTIC.danger,
    pending:   SEMANTIC.warning,
  };
  const statusBg = {
    completed: SEMANTIC.successDim,
    overdue:   SEMANTIC.dangerDim,
    pending:   SEMANTIC.warningDim,
  };

  const infoRows = [
    { label: 'Checklist No',   value: checklist?.no },
    { label: 'Plant',          value: plant?.name   },
    { label: 'Date',           value: dayjs(task.date).format('DD MMM YYYY') },
    { label: 'Frequency',      value: freq?.label || checklist?.defaultFreq },
    { label: 'Created',        value: dayjs(task.createdAt).format('DD MMM, HH:mm') },
    ...(task.completedAt ? [{ label: 'Completed', value: dayjs(task.completedAt).format('DD MMM, HH:mm') }] : []),
  ];

  const c = colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg }} showsVerticalScrollIndicator={false}>

        {/* Back + Title */}
        <Row style={{ marginBottom: SPACING.xl }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: c.bgCard, borderColor: c.border }]}
          >
            <Text style={{ color: c.text, fontSize: 20 }}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>{checklist?.name || 'Task Detail'}</Text>
        </Row>

        {/* Status Banner */}
        <View style={[styles.statusBanner, {
          backgroundColor: statusBg[task.status],
          borderColor:     statusColorMap[task.status] + '40',
        }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: SPACING.sm, flex: 1 }}>
              <Text style={{ fontSize: 24 }}>
                {task.status === 'completed' ? '✅' : task.status === 'overdue' ? '🚨' : '⏳'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 15, fontWeight: FONT.semibold }}>
                  {task.status === 'completed' ? 'Task Completed' : task.status === 'overdue' ? 'Task Overdue' : 'Task Pending'}
                </Text>
                <Text style={{ color: c.textSub, fontSize: 12, marginTop: 2 }}>{task.date}</Text>
              </View>
            </Row>
            <StatusBadge status={task.status} />
          </Row>
        </View>

        {/* Info Table */}
        <Card style={[styles.infoCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          {infoRows.map((row, i) => (
            <View key={row.label}>
              <Row style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: c.textSub }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: c.text }]}>{row.value || '—'}</Text>
              </Row>
              {i < infoRows.length - 1 && <View style={[styles.infoDivider, { backgroundColor: c.border }]} />}
            </View>
          ))}
        </Card>

        {/* Plant Indicator — plant color dot only, no random glow */}
        {plant && (
          <Row style={[styles.plantRow, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.plantDot, { backgroundColor: plant.color }]} />
            <Text style={[styles.plantName, { color: c.text }]}>{plant.name}</Text>
            {plant.code && <Badge label={plant.code} color={SEMANTIC.primary} />}
          </Row>
        )}

        {/* Actions for pending/overdue tasks */}
        {task.status !== 'completed' && (
          <>
            <Text style={[styles.label, { color: c.textSub }]}>Remarks</Text>
            <TextInput
              style={[styles.remarkInput, { backgroundColor: c.bgCard, borderColor: c.border, color: c.text }]}
              value={remark} onChangeText={setRemark}
              placeholder="Add inspection remarks, observations..."
              placeholderTextColor={c.textMuted}
              multiline numberOfLines={4} textAlignVertical="top"
            />

            <Text style={[styles.label, { color: c.textSub }]}>Photo Proof 📸</Text>
            {photoUri ? (
              <View style={styles.photoWrap}>
                <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                  <View style={styles.removeBtn}>
                    <Text style={{ color: '#fff', fontSize: 12 }}>✕ Remove</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.photoBtn, { backgroundColor: c.bgCard, borderColor: c.border }]}
                onPress={pickPhoto}
              >
                <Text style={{ fontSize: 28 }}>📸</Text>
                <Text style={{ color: c.textSub, fontSize: 14, marginTop: 6 }}>Tap to add photo proof</Text>
                <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 3 }}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}

            <Spacer size={SPACING.md} />
            <Button label="Mark as Complete ✓" onPress={handleComplete} loading={loading} variant="success" size="lg"
              style={{ marginBottom: SPACING.md }} />
            <Button label="Delete Task" onPress={handleDelete} variant="outline" size="lg"
              style={{ borderColor: SEMANTIC.danger + '50' }} />
          </>
        )}

        {/* Completed state — show remarks + photo */}
        {task.status === 'completed' && (
          <>
            {task.remark ? (
              <Card style={{ marginBottom: SPACING.lg }}>
                <Text style={[styles.label, { color: c.textSub }]}>Remarks</Text>
                <Text style={{ color: c.text, fontSize: 14, lineHeight: 22 }}>{task.remark}</Text>
              </Card>
            ) : null}
            {task.photoUri ? (
              <Image source={{ uri: task.photoUri }} style={[styles.photo, { width: '100%' }]} resizeMode="cover" />
            ) : null}
          </>
        )}

        <Spacer size={60} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn:      { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  title:        { fontSize: 20, fontWeight: FONT.bold, flex: 1, lineHeight: 28 },
  statusBanner: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  infoCard:     { marginBottom: SPACING.lg, padding: 0, overflow: 'hidden', borderRadius: RADIUS.lg, borderWidth: 1 },
  infoRow:      { justifyContent: 'space-between', padding: SPACING.md },
  infoLabel:    { fontSize: 13 },
  infoValue:    { fontSize: 13, fontWeight: FONT.medium, maxWidth: '55%', textAlign: 'right' },
  infoDivider:  { height: 1 },
  plantRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg },
  plantDot:     { width: 10, height: 10, borderRadius: 5 },
  plantName:    { fontSize: 14, fontWeight: FONT.medium, flex: 1 },
  label:        { fontSize: 11, fontWeight: FONT.semibold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  remarkInput:  { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: 14, minHeight: 100, marginBottom: SPACING.lg },
  photoBtn:     { borderWidth: 1, borderStyle: 'dashed', borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  photoWrap:    { marginBottom: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  photo:        { height: 200, borderRadius: RADIUS.lg },
  removePhoto:  { position: 'absolute', bottom: 8, right: 8 },
  removeBtn:    { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: RADIUS.sm, paddingVertical: 4, paddingHorizontal: 10 },
});
