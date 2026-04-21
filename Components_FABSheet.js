import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Modal, TouchableWithoutFeedback, ScrollView,
  TextInput, Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from './Constants_theme';
import { Button, Row, Spacer, Divider } from './UIComponents';
import { PLANTS, CHECKLISTS, FREQUENCIES } from './Constants_data';
import { useApp } from './Context_AppContext';
import dayjs from 'dayjs';

// ─── FAB ─────────────────────────────────────────────────────────────────────
export function FAB({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, tension: 400 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300 }).start();

  return (
    <Animated.View style={[styles.fab, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.fabInner}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── FAB Bottom Sheet ─────────────────────────────────────────────────────────
export function FABSheet({ visible, onClose }) {
  const translateY = useRef(new Animated.Value(500)).current;
  const [sheet, setSheet] = useState(null); // 'task' | 'plant' | 'checklist'

  React.useEffect(() => {
    if (visible) {
      setSheet(null);
      Animated.spring(translateY, {
        toValue: 0, useNativeDriver: true, tension: 80, friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500, duration: 200, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const close = () => { onClose(); setSheet(null); };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
              <View style={styles.handle} />

              {!sheet && <MainMenu onSelect={setSheet} onClose={close} />}
              {sheet === 'task'      && <AddTaskForm      onClose={close} />}
              {sheet === 'plant'     && <AddPlantForm     onClose={close} />}
              {sheet === 'checklist' && <AddChecklistForm onClose={close} />}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function MainMenu({ onSelect, onClose }) {
  const items = [
    { key: 'task',      emoji: '✅', label: 'Add Task',        sub: 'Create a manual task' },
    { key: 'plant',     emoji: '🏭', label: 'Add Plant',       sub: 'Register a new plant'  },
    { key: 'checklist', emoji: '📋', label: 'Add Checklist',   sub: 'Add new checklist item' },
  ];
  return (
    <View>
      <Text style={styles.sheetTitle}>Quick Add</Text>
      <Spacer size={SPACING.md} />
      {items.map(item => (
        <TouchableOpacity
          key={item.key}
          style={styles.menuItem}
          onPress={() => onSelect(item.key)}
        >
          <Text style={styles.menuEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <Text style={{ color: COLORS.textMuted }}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AddTaskForm({ onClose }) {
  const { addTask, state } = useApp();
  const [plantId,     setPlantId]     = useState(state.plants[0]?.id || '');
  const [checklistId, setChecklistId] = useState(state.checklists[0]?.id || '');
  const [remark,      setRemark]      = useState('');

  const submit = () => {
    if (!plantId || !checklistId) return;
    addTask({ plantId, checklistId, remark, date: dayjs().format('YYYY-MM-DD') });
    onClose();
  };

  return (
    <ScrollView>
      <Text style={styles.sheetTitle}>Add Task</Text>
      <Spacer size={SPACING.md} />
      <Text style={styles.label}>Plant</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
        <Row>
          {state.plants.map(p => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPlantId(p.id)}
              style={[styles.chip, plantId === p.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, plantId === p.id && { color: '#fff' }]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </Row>
      </ScrollView>

      <Text style={styles.label}>Checklist</Text>
      <ScrollView style={{ maxHeight: 160, marginBottom: SPACING.md }}>
        {state.checklists.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setChecklistId(c.id)}
            style={[styles.listItem, checklistId === c.id && styles.listItemActive]}
          >
            <Text style={styles.listItemNo}>{c.no}</Text>
            <Text style={[styles.listItemName, checklistId === c.id && { color: COLORS.primary }]}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Remark (optional)</Text>
      <TextInput
        style={styles.input}
        value={remark}
        onChangeText={setRemark}
        placeholder="Add a remark..."
        placeholderTextColor={COLORS.textMuted}
        multiline
      />
      <Spacer size={SPACING.lg} />
      <Button label="Add Task" onPress={submit} />
      <Spacer size={SPACING.xl} />
    </ScrollView>
  );
}

function AddPlantForm({ onClose }) {
  const { addPlant } = useApp();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    addPlant({ name: name.trim(), code: code.trim().toUpperCase(), color: COLORS.primary });
    onClose();
  };

  return (
    <View>
      <Text style={styles.sheetTitle}>Add Plant</Text>
      <Spacer size={SPACING.md} />
      <Text style={styles.label}>Plant Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Tank Farm C"
        placeholderTextColor={COLORS.textMuted}
      />
      <Spacer size={SPACING.md} />
      <Text style={styles.label}>Code (short)</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="e.g. TFC"
        placeholderTextColor={COLORS.textMuted}
        maxLength={5}
        autoCapitalize="characters"
      />
      <Spacer size={SPACING.lg} />
      <Button label="Add Plant" onPress={submit} />
      <Spacer size={SPACING.xl} />
    </View>
  );
}

function AddChecklistForm({ onClose }) {
  const { addChecklist } = useApp();
  const [name, setName]   = useState('');
  const [freq, setFreq]   = useState('monthly');

  const submit = () => {
    if (!name.trim()) return;
    addChecklist({ name: name.trim(), defaultFreq: freq });
    onClose();
  };

  return (
    <View>
      <Text style={styles.sheetTitle}>Add Checklist</Text>
      <Spacer size={SPACING.md} />
      <Text style={styles.label}>Checklist Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Valve Inspection"
        placeholderTextColor={COLORS.textMuted}
      />
      <Spacer size={SPACING.md} />
      <Text style={styles.label}>Default Frequency</Text>
      <Row style={{ flexWrap: 'wrap', gap: SPACING.sm }}>
        {Object.values(FREQUENCIES).map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFreq(f.id)}
            style={[styles.chip, freq === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, freq === f.id && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <Spacer size={SPACING.lg} />
      <Button label="Add Checklist" onPress={submit} />
      <Spacer size={SPACING.xl} />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position:      'absolute',
    bottom:        24,
    right:         24,
    width:         60,
    height:        60,
    borderRadius:  30,
    backgroundColor: COLORS.primary,
    shadowColor:   COLORS.primary,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius:  12,
    elevation:     10,
  },
  fabInner: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  fabIcon: {
    color: '#fff', fontSize: 28, fontWeight: FONT.light, lineHeight: 32,
  },
  overlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: '#131928',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:         SPACING.xl,
    maxHeight:       '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  sheetTitle: {
    color:      COLORS.text,
    fontSize:   20,
    fontWeight: FONT.bold,
  },
  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap:             SPACING.md,
  },
  menuEmoji: { fontSize: 24 },
  menuLabel: { color: COLORS.text, fontSize: 15, fontWeight: FONT.medium },
  menuSub:   { color: COLORS.textSub, fontSize: 12, marginTop: 2 },
  label: {
    color:        COLORS.textSub,
    fontSize:     12,
    fontWeight:   FONT.medium,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    color:           COLORS.text,
    fontSize:        15,
  },
  chip: {
    paddingVertical:   6,
    paddingHorizontal: 14,
    borderRadius:      RADIUS.full,
    borderWidth:       1,
    borderColor:       COLORS.border,
    marginRight:       SPACING.sm,
    marginBottom:      SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary,
  },
  chipText: { color: COLORS.textSub, fontSize: 13, fontWeight: FONT.medium },
  listItem: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemActive: { backgroundColor: COLORS.primaryDim, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm },
  listItemNo:   { color: COLORS.textMuted, fontSize: 11, fontFamily: 'monospace', width: 60 },
  listItemName: { color: COLORS.text, fontSize: 13, flex: 1 },
});
