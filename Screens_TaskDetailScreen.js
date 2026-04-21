import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from './Context_AppContext';
import { COLORS } from './Constants_theme';
import { getStatusColor, getStatusLabel, getFreqLabel, formatDate } from './Utils_helpers';
import { TASK_STATUS } from './Constants_equipments';

export default function TaskDetailScreen({ navigation, route }) {
  const { task } = route.params;
  const { completeTask, refreshTasks } = useApp();

  const [remarks,  setRemarks]  = useState(task.remarks || '');
  const [photoUri, setPhotoUri] = useState(task.photoUri || null);
  const [loading,  setLoading]  = useState(false);

  const isCompleted = task.status === TASK_STATUS.DONE;
  const statusColor = getStatusColor(task.status);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeTask(task.id, {
        remarks,
        photoUri,
        completedAt: new Date().toISOString(),
      });
      await refreshTasks();
      Alert.alert('✅ Done!', 'Task marked as completed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Could not complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Photo', 'Choose source', [
      { text: 'Camera',  onPress: pickPhoto },
      { text: 'Gallery', onPress: pickFromGallery },
      { text: 'Cancel',  style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text1} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{task.equipmentName}</Text>
          <Text style={styles.headerSub}>{task.plantName} · {task.checklistNo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(task.status)}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Info Table */}
        <View style={styles.card}>
          {[
            ['Equipment',   task.equipmentName],
            ['Checklist No.', task.checklistNo],
            ['Plant',       task.plantName],
            ['Category',    task.category],
            ['Frequency',   getFreqLabel(task.freq)],
            ['Date',        formatDate(task.date)],
            ...(task.completedAt ? [['Completed At', new Date(task.completedAt).toLocaleString()]] : []),
          ].map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Remarks */}
        {!isCompleted && (
          <>
            <Text style={styles.sectionLabel}>Remarks</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Add inspection remarks, observations..."
              placeholderTextColor={COLORS.text3}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Photo */}
            <Text style={styles.sectionLabel}>Photo Proof 📸</Text>
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoBtn} onPress={showPhotoOptions}>
                <Ionicons name="camera-outline" size={28} color={COLORS.text2} />
                <Text style={styles.photoBtnText}>Tap to add photo proof</Text>
                <Text style={styles.photoBtnSub}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}

            {/* Complete Button */}
            <TouchableOpacity
              style={[styles.completeBtn, loading && { opacity: 0.6 }]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.completeBtnText}>✅ Mark as Completed</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {/* If already done — show photo */}
        {isCompleted && (
          <View style={styles.doneState}>
            <Text style={{ fontSize: 40 }}>✅</Text>
            <Text style={styles.doneTitle}>Task Completed</Text>
            {task.remarks ? <Text style={styles.doneRemarks}>"{task.remarks}"</Text> : null}
            {task.photoUri && (
              <Image source={{ uri: task.photoUri }} style={[styles.photo, { width: '100%' }]} resizeMode="cover" />
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.bg0 },
  header:         { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:        { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.bg2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle:    { fontSize: 15, fontWeight: '600', color: COLORS.text1 },
  headerSub:      { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  statusBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:     { fontSize: 12, fontWeight: '600' },
  content:        { padding: 16 },
  card:           { backgroundColor: COLORS.bg2, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel:      { fontSize: 13, color: COLORS.text2 },
  infoValue:      { fontSize: 13, fontWeight: '500', color: COLORS.text1, maxWidth: '55%', textAlign: 'right' },
  sectionLabel:   { fontSize: 13, color: COLORS.text2, marginBottom: 8, fontWeight: '600' },
  textarea:       { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, color: COLORS.text1, fontSize: 14, minHeight: 90, marginBottom: 16 },
  photoBtn:       { backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 20 },
  photoBtnText:   { fontSize: 14, color: COLORS.text2, marginTop: 8 },
  photoBtnSub:    { fontSize: 12, color: COLORS.text3, marginTop: 4 },
  photoPreview:   { position: 'relative', marginBottom: 20 },
  photo:          { width: '100%', height: 200, borderRadius: 12 },
  removePhoto:    { position: 'absolute', top: 8, right: 8 },
  completeBtn:    { backgroundColor: COLORS.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  completeBtnText:{ fontSize: 16, fontWeight: '700', color: 'white' },
  doneState:      { alignItems: 'center', paddingTop: 20, gap: 12 },
  doneTitle:      { fontSize: 18, fontWeight: '600', color: COLORS.green },
  doneRemarks:    { fontSize: 14, color: COLORS.text2, fontStyle: 'italic', textAlign: 'center' },
});
