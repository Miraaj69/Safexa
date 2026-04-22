import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Switch, Modal,
  TouchableWithoutFeedback, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SEMANTIC, SPACING, RADIUS, FONT } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { Card, Row, Spacer, Badge, Button, Divider, SectionHeader } from './Components_UIComponents';
import { FAB, FABSheet } from './Components_FABSheet';
import { useApp } from './Context_AppContext';
import { FREQUENCIES } from './Constants_data';

const TABS = ['Checklists', 'Plants', 'Schedule'];

function freqColor(freq) {
  const map = {
    daily: SEMANTIC.primary, weekly: SEMANTIC.success,
    monthly: SEMANTIC.warning, quarterly: '#A855F7', yearly: SEMANTIC.danger,
  };
  return map[freq] || SEMANTIC.primary;
}

// Ripple-effect pressable row
function PressableRow({ children, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const bg    = useRef(new Animated.Value(0)).current;

  const onIn  = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, tension: 400 }),
      Animated.timing(bg,    { toValue: 1, duration: 80, useNativeDriver: false }),
    ]).start();
  };
  const onOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300 }),
      Animated.timing(bg,    { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const { colors } = useTheme();
  const bgColor = bg.interpolate({ inputRange: [0, 1], outputRange: ['transparent', colors.bgCardHover] });

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
      <Animated.View style={[style, { backgroundColor: bgColor, transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MasterScreen() {
  const { colors } = useTheme();
  const { state, updateScheduleConfig } = useApp();
  const [tab,           setTab]           = useState('Checklists');
  const [fabOpen,       setFabOpen]       = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null);

  const c = colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ padding: SPACING.lg, paddingBottom: SPACING.sm }}>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: FONT.bold }}>Master Data</Text>
      </View>

      {/* Tabs — consistent pill style */}
      <Row style={{
        marginHorizontal: SPACING.lg, backgroundColor: c.bgCard,
        borderRadius: RADIUS.lg, borderWidth: 1, borderColor: c.border,
        marginBottom: SPACING.lg, padding: 4, gap: 0,
      }}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t} onPress={() => setTab(t)}
            style={{
              flex: 1, paddingVertical: 9, alignItems: 'center',
              borderRadius: RADIUS.md,
              backgroundColor: tab === t ? c.bgCardHover : 'transparent',
            }}
          >
            <Text style={{ color: tab === t ? SEMANTIC.primary : c.textSub, fontSize: 13, fontWeight: FONT.medium }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </Row>

      <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── Checklists tab ── */}
        {tab === 'Checklists' && (
          <>
            <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: SPACING.md }}>{state.checklists.length} checklists</Text>
            {state.checklists.map(cl => (
              <Card key={cl.id} style={{ marginBottom: SPACING.sm, padding: SPACING.md }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: c.textMuted, fontSize: 11, fontFamily: 'monospace' }}>{cl.no}</Text>
                  <Badge label={cl.defaultFreq} color={freqColor(cl.defaultFreq)} />
                </Row>
                <Text style={{ color: c.text, fontSize: 14, fontWeight: FONT.medium, marginTop: 4 }}>{cl.name}</Text>
                {cl.category && (
                  <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 3 }}>{cl.category}</Text>
                )}
              </Card>
            ))}
          </>
        )}

        {/* ── Plants tab ── */}
        {tab === 'Plants' && (
          <>
            <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: SPACING.md }}>{state.plants.length} plants</Text>
            {state.plants.map(plant => {
              const tasks = state.tasks.filter(t => t.plantId === plant.id);
              const done  = tasks.filter(t => t.status === 'completed').length;
              return (
                <Card key={plant.id} style={{ marginBottom: SPACING.sm, padding: SPACING.md }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row style={{ gap: SPACING.sm }}>
                      {/* Single color dot per plant — no rainbow borders */}
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: plant.color }} />
                      <View>
                        <Text style={{ color: c.text, fontSize: 14, fontWeight: FONT.medium }}>{plant.name}</Text>
                        <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>{plant.code}</Text>
                      </View>
                    </Row>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: c.text, fontWeight: FONT.bold }}>{done}/{tasks.length}</Text>
                      <Text style={{ color: c.textMuted, fontSize: 11 }}>tasks today</Text>
                    </View>
                  </Row>
                </Card>
              );
            })}
          </>
        )}

        {/* ── Schedule tab ── */}
        {tab === 'Schedule' && (
          <>
            <Text style={{ color: c.textSub, fontSize: 13, marginBottom: SPACING.md, lineHeight: 20 }}>
              Tap a row to override frequency for a plant. Edit icon indicates overridden rows.
            </Text>
            {state.plants.map(plant => (
              <View key={plant.id} style={{ marginBottom: SPACING.sm }}>
                <SectionHeader title={plant.name} />
                {state.checklists.map(cl => {
                  const sc          = state.scheduleConfigs.find(s => s.plantId === plant.id && s.checklistId === cl.id);
                  const effFreq     = sc?.frequencyOverride || cl.defaultFreq;
                  const isOverridden = !!sc?.frequencyOverride;

                  return (
                    <PressableRow
                      key={cl.id}
                      onPress={() => setScheduleModal({ sc, plant, checklist: cl })}
                      style={[styles.scheduleRow, { borderBottomColor: c.border }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontSize: 13, fontWeight: FONT.medium }} numberOfLines={1}>{cl.name}</Text>
                        <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>{cl.no}</Text>
                      </View>
                      <Row style={{ gap: SPACING.sm }}>
                        <Badge label={effFreq} color={isOverridden ? SEMANTIC.warning : SEMANTIC.primary} />
                        {/* Edit icon — subtle, clean */}
                        <Text style={{ color: c.textMuted, fontSize: 16 }}>✎</Text>
                      </Row>
                    </PressableRow>
                  );
                })}
                <Spacer size={SPACING.lg} />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Schedule Override Modal */}
      {scheduleModal && (
        <ScheduleModal
          {...scheduleModal}
          onClose={() => setScheduleModal(null)}
          onSave={updates => {
            updateScheduleConfig(scheduleModal.sc.id, updates);
            setScheduleModal(null);
          }}
        />
      )}

      <FAB onPress={() => setFabOpen(true)} />
      <FABSheet visible={fabOpen} onClose={() => setFabOpen(false)} />
    </SafeAreaView>
  );
}

function ScheduleModal({ sc, plant, checklist, onClose, onSave }) {
  const { colors } = useTheme();
  const [freq,   setFreq]   = useState(sc.frequencyOverride || checklist.defaultFreq);
  const [isAuto, setIsAuto] = useState(sc.isAuto !== false);
  const c = colors;

  const chip = (active) => ({
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: active ? SEMANTIC.primary : c.border,
    backgroundColor: active ? SEMANTIC.primaryDim : c.bgCard,
    marginRight: SPACING.sm, marginBottom: SPACING.sm,
    flexDirection: 'row', alignItems: 'center',
  });

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: c.overlay }}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, { backgroundColor: c.sheet }]}>
              <View style={[styles.handle, { backgroundColor: c.border }]} />
              <Text style={{ color: c.text, fontSize: 20, fontWeight: FONT.bold }}>Schedule Override</Text>
              <Text style={{ color: c.textSub, fontSize: 14, marginTop: 4 }}>{checklist.name}</Text>
              <Text style={{ color: SEMANTIC.primary, fontSize: 12, marginTop: 6 }}>{plant.name}</Text>

              <View style={{ height: 1, backgroundColor: c.border, marginVertical: SPACING.md }} />

              <Text style={{ color: c.textSub, fontSize: 11, fontWeight: FONT.semibold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.sm }}>
                Select Frequency
              </Text>
              <Row style={{ flexWrap: 'wrap' }}>
                {Object.values(FREQUENCIES).map(f => (
                  <TouchableOpacity key={f.id} style={chip(freq === f.id)} onPress={() => setFreq(f.id)}>
                    <Text style={{ color: freq === f.id ? SEMANTIC.primary : c.textSub, fontSize: 13, fontWeight: FONT.medium }}>{f.label}</Text>
                    {f.id === checklist.defaultFreq && (
                      <Text style={{ color: c.textMuted, fontSize: 9, marginLeft: 4 }}> default</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </Row>

              {freq !== checklist.defaultFreq && (
                <View style={{ backgroundColor: SEMANTIC.warningDim, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: SEMANTIC.warning + '30' }}>
                  <Text style={{ color: SEMANTIC.warning, fontSize: 12 }}>
                    ⚡ Overriding default "{checklist.defaultFreq}" → "{freq}"
                  </Text>
                </View>
              )}

              <Spacer size={SPACING.md} />
              <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: c.text, fontSize: 14, fontWeight: FONT.medium }}>Auto Schedule</Text>
                  <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>Generate tasks automatically</Text>
                </View>
                <Switch
                  value={isAuto} onValueChange={setIsAuto}
                  trackColor={{ false: c.border, true: SEMANTIC.primary }} thumbColor="#fff"
                />
              </Row>

              <Spacer size={SPACING.xl} />
              <Row style={{ gap: SPACING.md }}>
                <Button label="Cancel" onPress={onClose} variant="outline" style={{ flex: 1 }} />
                <Button
                  label="Save"
                  onPress={() => onSave({ frequencyOverride: freq !== checklist.defaultFreq ? freq : null, isAuto })}
                  style={{ flex: 1 }}
                />
              </Row>
              <Spacer size={SPACING.xl} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scheduleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md, borderBottomWidth: 1,
    paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm,
  },
  modal: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
});
