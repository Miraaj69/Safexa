import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Modal, TouchableWithoutFeedback, ScrollView,
  TextInput, Switch,
} from 'react-native';
import { SEMANTIC, SPACING, RADIUS, FONT } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { Button, Row, Spacer, Divider } from './Components_UIComponents';
import { FREQUENCIES } from './Constants_data';
import { useApp } from './Context_AppContext';
import dayjs from 'dayjs';

// ─── FAB ─────────────────────────────────────────────────────────────────────
export function FAB({ onPress }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 0.88, useNativeDriver: true, tension: 400 }).start(),
      Animated.timing(opacity, { toValue: 0.85, duration: 80, useNativeDriver: true }).start(),
    ]);
  };
  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 300 }).start(),
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }).start(),
    ]);
  };

  return (
    <Animated.View style={[styles.fabWrap, { transform: [{ scale }], opacity }]}>
      {/* Glow layer — only on FAB (premium, intentional) */}
      <View style={styles.fabGlow} />
      <TouchableOpacity
        onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        activeOpacity={1} style={styles.fab}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── FAB Sheet ────────────────────────────────────────────────────────────────
export function FABSheet({ visible, onClose }) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(500)).current;
  const [sheet, setSheet] = useState(null);

  React.useEffect(() => {
    if (visible) {
      setSheet(null);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    } else {
      Animated.timing(translateY, { toValue: 500, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible]);

  const close = () => { onClose(); setSheet(null); };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              styles.sheet,
              { backgroundColor: colors.sheet, transform: [{ translateY }] },
            ]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              {!sheet           && <MainMenu onSelect={setSheet} onClose={close} />}
              {sheet === 'task' && <AddTaskForm onClose={close} />}
              {sheet === 'plant'&& <AddPlantForm onClose={close} />}
              {sheet === 'checklist' && <AddChecklistForm onClose={close} />}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function MainMenu({ onSelect, onClose }) {
  const { colors } = useTheme();
  const items = [
    { key: 'task',       emoji: '✅', label: 'Add Task',      sub: 'Create a manual task'   },
    { key: 'plant',      emoji: '🏭', label: 'Add Plant',     sub: 'Register a new plant'   },
    { key: 'checklist',  emoji: '📋', label: 'Add Checklist', sub: 'New checklist item'     },
  ];
  return (
    <View>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>Quick Add</Text>
      <Spacer size={SPACING.md} />
      {items.map(item => (
        <TouchableOpacity
          key={item.key} style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => onSelect(item.key)}
        >
          <Text style={styles.menuEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.menuSub, { color: colors.textSub }]}>{item.sub}</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AddTaskForm({ onClose }) {
  const { addTask, state }    = useApp();
  const { colors }            = useTheme();
  const [plantId,     setP]   = useState(state.plants[0]?.id || '');
  const [checklistId, setC]   = useState(state.checklists[0]?.id || '');
  const [remark,      setR]   = useState('');
  const [priority,    setPri] = useState('normal');

  const submit = () => {
    if (!plantId || !checklistId) return;
    addTask({ plantId, checklistId, remark, priority, date: dayjs().format('YYYY-MM-DD') });
    onClose();
  };

  const chipStyle = (active) => ({
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: active ? SEMANTIC.primary : colors.border,
    backgroundColor: active ? SEMANTIC.primaryDim : colors.bgCard,
    marginRight: SPACING.sm, marginBottom: SPACING.sm,
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Task</Text>
      <Spacer size={SPACING.md} />

      <Text style={[styles.label, { color: colors.textSub }]}>Plant</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
        <Row>
          {state.plants.map(p => (
            <TouchableOpacity key={p.id} onPress={() => setP(p.id)} style={chipStyle(plantId === p.id)}>
              <Text style={{ color: plantId === p.id ? SEMANTIC.primary : colors.textSub, fontSize: 12, fontWeight: FONT.medium }}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </Row>
      </ScrollView>

      <Text style={[styles.label, { color: colors.textSub }]}>Checklist</Text>
      <ScrollView style={{ maxHeight: 140, marginBottom: SPACING.md }} showsVerticalScrollIndicator={false}>
        {state.checklists.map(c => (
          <TouchableOpacity
            key={c.id} onPress={() => setC(c.id)}
            style={[styles.listItem, { borderBottomColor: colors.border }, checklistId === c.id && { backgroundColor: SEMANTIC.primaryDim, borderRadius: RADIUS.sm }]}
          >
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: 'monospace', width: 60 }}>{c.no}</Text>
            <Text style={{ color: checklistId === c.id ? SEMANTIC.primary : colors.text, fontSize: 13, flex: 1 }}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: colors.textSub }]}>Priority</Text>
      <Row style={{ gap: SPACING.sm, marginBottom: SPACING.md }}>
        {['low','normal','high'].map(p => (
          <TouchableOpacity key={p} style={chipStyle(priority === p)} onPress={() => setPri(p)}>
            <Text style={{ color: priority === p ? SEMANTIC.primary : colors.textSub, fontSize: 12, fontWeight: FONT.medium, textTransform: 'capitalize' }}>{p}</Text>
          </TouchableOpacity>
        ))}
      </Row>

      <Text style={[styles.label, { color: colors.textSub }]}>Remark (optional)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }]}
        value={remark} onChangeText={setR}
        placeholder="Add a remark..." placeholderTextColor={colors.textMuted} multiline
      />
      <Spacer size={SPACING.lg} />
      <Button label="Add Task" onPress={submit} />
      <Spacer size={SPACING.xxl} />
    </ScrollView>
  );
}

function AddPlantForm({ onClose }) {
  const { addPlant } = useApp();
  const { colors }   = useTheme();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    addPlant({ name: name.trim(), code: code.trim().toUpperCase(), color: SEMANTIC.primary });
    onClose();
  };

  return (
    <View>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Plant</Text>
      <Spacer size={SPACING.md} />
      <Text style={[styles.label, { color: colors.textSub }]}>Plant Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }]}
        value={name} onChangeText={setName} placeholder="e.g. Tank Farm C" placeholderTextColor={colors.textMuted}
      />
      <Spacer size={SPACING.md} />
      <Text style={[styles.label, { color: colors.textSub }]}>Short Code</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }]}
        value={code} onChangeText={setCode} placeholder="e.g. TFC" placeholderTextColor={colors.textMuted}
        maxLength={5} autoCapitalize="characters"
      />
      <Spacer size={SPACING.lg} />
      <Button label="Add Plant" onPress={submit} />
      <Spacer size={SPACING.xxl} />
    </View>
  );
}

function AddChecklistForm({ onClose }) {
  const { addChecklist } = useApp();
  const { colors }       = useTheme();
  const [name, setName]  = useState('');
  const [freq, setFreq]  = useState('monthly');
  const [cat,  setCat]   = useState('Fire');

  const submit = () => {
    if (!name.trim()) return;
    addChecklist({ name: name.trim(), defaultFreq: freq, category: cat });
    onClose();
  };

  const chip = (active) => ({
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: active ? SEMANTIC.primary : colors.border,
    backgroundColor: active ? SEMANTIC.primaryDim : colors.bgCard,
    marginRight: SPACING.sm, marginBottom: SPACING.sm,
  });

  return (
    <View>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Checklist</Text>
      <Spacer size={SPACING.md} />
      <Text style={[styles.label, { color: colors.textSub }]}>Checklist Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.text }]}
        value={name} onChangeText={setName} placeholder="e.g. Valve Inspection" placeholderTextColor={colors.textMuted}
      />
      <Spacer size={SPACING.md} />
      <Text style={[styles.label, { color: colors.textSub }]}>Category</Text>
      <Row style={{ flexWrap: 'wrap' }}>
        {['Fire','Safety','Emergency','Medical','Environment','Electrical'].map(c => (
          <TouchableOpacity key={c} style={chip(cat === c)} onPress={() => setCat(c)}>
            <Text style={{ color: cat === c ? SEMANTIC.primary : colors.textSub, fontSize: 12, fontWeight: FONT.medium }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <Spacer size={SPACING.md} />
      <Text style={[styles.label, { color: colors.textSub }]}>Default Frequency</Text>
      <Row style={{ flexWrap: 'wrap' }}>
        {Object.values(FREQUENCIES).map(f => (
          <TouchableOpacity key={f.id} style={chip(freq === f.id)} onPress={() => setFreq(f.id)}>
            <Text style={{ color: freq === f.id ? SEMANTIC.primary : colors.textSub, fontSize: 12, fontWeight: FONT.medium }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <Spacer size={SPACING.lg} />
      <Button label="Add Checklist" onPress={submit} />
      <Spacer size={SPACING.xxl} />
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute', bottom: 24, right: 24,
    width: 60, height: 60,
  },
  fab: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: SEMANTIC.primary,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  fabGlow: {
    position: 'absolute', inset: -8,
    borderRadius: 38,
    backgroundColor: SEMANTIC.primary,
    opacity: 0.25,
    zIndex: 1,
  },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: FONT.light, lineHeight: 32 },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, maxHeight: '88%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  sheetTitle:  { fontSize: 20, fontWeight: FONT.bold },
  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, gap: SPACING.md },
  menuEmoji:   { fontSize: 24 },
  menuLabel:   { fontSize: 15, fontWeight: FONT.medium },
  menuSub:     { fontSize: 12, marginTop: 2 },
  label:       { fontSize: 11, fontWeight: FONT.semibold, marginBottom: SPACING.sm, letterSpacing: 0.5, textTransform: 'uppercase' },
  input:       { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 15 },
  listItem:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, paddingHorizontal: SPACING.sm },
});
