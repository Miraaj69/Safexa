import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Switch, Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT } from './Constants_theme';
import { Card, Row, Spacer, Badge, Button, Divider, SectionHeader } from './Components_UIComponents';
import { FAB, FABSheet } from './Components_FABSheet';
import { useApp } from './Context_AppContext';
import { FREQUENCIES } from './Constants_data';

const TABS = ['Checklists', 'Plants', 'Schedule'];

export default function MasterScreen({ navigation }) {
  const { state, updateScheduleConfig, updateChecklist } = useApp();
  const [tab,     setTab]     = useState('Checklists');
  const [fabOpen, setFabOpen] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null); // { sc, plant, checklist }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Master Data</Text>
      </View>

      {/* Tabs */}
      <Row style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && { color: COLORS.primary }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {tab === 'Checklists' && (
          <>
            <Text style={styles.count}>{state.checklists.length} checklists</Text>
            {state.checklists.map(cl => (
              <Card key={cl.id} style={styles.itemCard}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={styles.itemNo}>{cl.no}</Text>
                  <Badge
                    label={cl.defaultFreq}
                    color={freqColor(cl.defaultFreq)}
                  />
                </Row>
                <Text style={styles.itemName}>{cl.name}</Text>
              </Card>
            ))}
          </>
        )}

        {tab === 'Plants' && (
          <>
            <Text style={styles.count}>{state.plants.length} plants</Text>
            {state.plants.map(plant => {
              const tasks = state.tasks.filter(t => t.plantId === plant.id);
              const done  = tasks.filter(t => t.status === 'completed').length;
              return (
                <Card key={plant.id} style={styles.itemCard}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row style={{ gap: SPACING.sm }}>
                      <View style={[styles.colorDot, { backgroundColor: plant.color }]} />
                      <View>
                        <Text style={styles.itemName}>{plant.name}</Text>
                        <Text style={styles.itemSub}>{plant.code}</Text>
                      </View>
                    </Row>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: COLORS.text, fontWeight: FONT.bold }}>{done}/{tasks.length}</Text>
                      <Text style={styles.itemSub}>tasks today</Text>
                    </View>
                  </Row>
                </Card>
              );
            })}
          </>
        )}

        {tab === 'Schedule' && (
          <>
            <Text style={styles.scheduleInfo}>
              Override default frequency per plant. Tap a row to edit.
            </Text>
            {state.plants.map(plant => (
              <View key={plant.id} style={styles.plantSection}>
                <SectionHeader title={plant.name} />
                {state.checklists.map(cl => {
                  const sc = state.scheduleConfigs.find(
                    s => s.plantId === plant.id && s.checklistId === cl.id
                  );
                  const effectiveFreq = sc?.frequencyOverride || cl.defaultFreq;
                  const isOverridden  = !!sc?.frequencyOverride;

                  return (
                    <TouchableOpacity
                      key={cl.id}
                      style={styles.scheduleRow}
                      onPress={() => setScheduleModal({ sc, plant, checklist: cl })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scheduleName} numberOfLines={1}>{cl.name}</Text>
                        <Text style={styles.scheduleNo}>{cl.no}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Badge
                          label={effectiveFreq}
                          color={isOverridden ? COLORS.warning : COLORS.primary}
                        />
                        {isOverridden && (
                          <Text style={styles.overrideTag}>overridden</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <Spacer size={SPACING.lg} />
              </View>
            ))}
          </>
        )}

        <Spacer size={100} />
      </ScrollView>

      {scheduleModal && (
        <ScheduleModal
          {...scheduleModal}
          onClose={() => setScheduleModal(null)}
          onSave={(updates) => {
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
  const [freq,   setFreq]   = useState(sc.frequencyOverride || checklist.defaultFreq);
  const [isAuto, setIsAuto] = useState(sc.isAuto !== false);
  const isOverriding = freq !== checklist.defaultFreq;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modal.overlay}>
          <TouchableWithoutFeedback>
            <View style={modal.sheet}>
              <View style={modal.handle} />
              <Text style={modal.title}>Schedule Override</Text>
              <Text style={modal.sub}>{checklist.name}</Text>
              <Text style={modal.plantTag}>{plant.name}</Text>

              <Divider style={{ marginVertical: SPACING.md }} />

              <Text style={modal.label}>Default Frequency</Text>
              <View style={modal.defaultBadge}>
                <Text style={modal.defaultText}>{checklist.defaultFreq}</Text>
              </View>

              <Spacer size={SPACING.md} />
              <Text style={modal.label}>Override Frequency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                {Object.values(FREQUENCIES).map(f => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFreq(f.id)}
                    style={[modal.freqChip, freq === f.id && modal.freqChipActive]}
                  >
                    <Text style={[modal.freqText, freq === f.id && { color: '#fff' }]}>
                      {f.label}
                    </Text>
                    {f.id === checklist.defaultFreq && (
                      <Text style={{ color: COLORS.textMuted, fontSize: 9, marginLeft: 4 }}>default</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {isOverriding && (
                <View style={modal.overrideInfo}>
                  <Text style={{ color: COLORS.warning, fontSize: 12 }}>
                    ⚡ You're overriding the default ({checklist.defaultFreq}) with {freq}
                  </Text>
                </View>
              )}

              <Spacer size={SPACING.md} />
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <Text style={modal.label}>Auto Schedule</Text>
                  <Text style={modal.autoSub}>Generate tasks automatically</Text>
                </View>
                <Switch
                  value={isAuto}
                  onValueChange={setIsAuto}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#fff"
                />
              </Row>

              <Spacer size={SPACING.xl} />
              <Row style={{ gap: SPACING.md }}>
                <Button
                  label="Cancel"
                  onPress={onClose}
                  variant="outline"
                  style={{ flex: 1 }}
                />
                <Button
                  label="Save"
                  onPress={() => onSave({
                    frequencyOverride: freq !== checklist.defaultFreq ? freq : null,
                    isAuto,
                  })}
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

function freqColor(freq) {
  const map = {
    daily:     COLORS.primary,
    weekly:    COLORS.success,
    monthly:   COLORS.warning,
    quarterly: '#A855F7',
    yearly:    COLORS.danger,
  };
  return map[freq] || COLORS.primary;
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  header:  { padding: SPACING.lg, paddingBottom: SPACING.sm },
  title:   { color: COLORS.text, fontSize: 28, fontWeight: FONT.bold },
  tabs:    {
    gap: 0, marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.lg, padding: 4,
  },
  tab:     { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: RADIUS.md },
  tabActive: { backgroundColor: '#1a2340' },
  tabText: { color: COLORS.textSub, fontSize: 13, fontWeight: FONT.medium },
  content: { paddingHorizontal: SPACING.lg },
  count:   { color: COLORS.textMuted, fontSize: 12, marginBottom: SPACING.md },
  itemCard:{ marginBottom: SPACING.sm, padding: SPACING.md },
  itemNo:  { color: COLORS.textMuted, fontSize: 11, fontFamily: 'monospace' },
  itemName:{ color: COLORS.text, fontSize: 14, fontWeight: FONT.medium, marginTop: 4 },
  itemSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  colorDot:{ width: 12, height: 12, borderRadius: 6 },
  plantSection: { marginBottom: SPACING.sm },
  scheduleInfo: {
    color: COLORS.textSub, fontSize: 13,
    marginBottom: SPACING.md, lineHeight: 20,
  },
  scheduleRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scheduleName: { color: COLORS.text, fontSize: 13, fontWeight: FONT.medium },
  scheduleNo:   { color: COLORS.textMuted, fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  overrideTag:  { color: COLORS.warning, fontSize: 10 },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  sheet: {
    backgroundColor: '#131928',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  title:   { color: COLORS.text, fontSize: 20, fontWeight: FONT.bold },
  sub:     { color: COLORS.textSub, fontSize: 14, marginTop: 4 },
  plantTag:{ color: COLORS.primary, fontSize: 12, marginTop: 6 },
  label:   {
    color: COLORS.textSub, fontSize: 11, fontWeight: FONT.semibold,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.sm,
  },
  defaultBadge: {
    backgroundColor: COLORS.primaryDim, borderRadius: RADIUS.sm,
    paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start',
  },
  defaultText: { color: COLORS.primary, fontSize: 13, fontWeight: FONT.medium },
  freqChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  freqChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  freqText: { color: COLORS.textSub, fontSize: 13, fontWeight: FONT.medium },
  overrideInfo: {
    marginTop: SPACING.md, backgroundColor: COLORS.warningDim,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.warning + '30',
  },
  autoSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
});
