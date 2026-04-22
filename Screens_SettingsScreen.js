import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Switch, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SEMANTIC, SPACING, RADIUS, FONT } from './Constants_theme';
import { useTheme } from './Context_ThemeContext';
import { Row, Spacer, Divider } from './Components_UIComponents';

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: FONT.semibold, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingHorizontal: 4 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: colors.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, label, sub, right, onPress, last }) {
  const { colors } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, tension: 400 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,     useNativeDriver: true, tension: 300 }).start();

  const content = (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Row style={{ padding: SPACING.lg, justifyContent: 'space-between' }}>
        <Row style={{ gap: SPACING.md, flex: 1 }}>
          <Text style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: FONT.medium }}>{label}</Text>
            {sub && <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{sub}</Text>}
          </View>
        </Row>
        {right}
        {onPress && !right && <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>}
      </Row>
      {!last && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 64 }} />}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Theme Option ─────────────────────────────────────────────────────────────
function ThemeOption({ name, label, icon, desc, selected, onPress }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.75}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        padding: SPACING.lg,
        backgroundColor: selected ? SEMANTIC.primaryDim : 'transparent',
        borderRadius: selected ? RADIUS.md : 0,
      }}
    >
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: FONT.medium }}>{label}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{desc}</Text>
      </View>
      <View style={{
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: selected ? SEMANTIC.primary : colors.border,
        backgroundColor: selected ? SEMANTIC.primary : 'transparent',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { theme, setTheme, colors } = useTheme();
  const c = colors;

  // Notification toggles
  const [dailyReminder,  setDailyReminder]  = useState(true);
  const [overdueAlerts,  setOverdueAlerts]  = useState(true);
  const [weeklySummary,  setWeeklySummary]  = useState(false);

  // Defaults
  const [autoGenerate,   setAutoGenerate]   = useState(true);
  const [defaultPlant,   setDefaultPlant]   = useState('Tank Farm A');
  const [defaultFreq,    setDefaultFreq]    = useState('Monthly');

  // Security
  const [appLock,        setAppLock]        = useState(false);

  const switchProps = (val, fn) => ({
    value: val,
    onValueChange: fn,
    trackColor: { false: c.border, true: SEMANTIC.primary },
    thumbColor: '#fff',
  });

  const confirmClear = () => {
    Alert.alert(
      'Clear All Data ⚠️',
      'This will permanently delete all tasks and reports. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => Alert.alert('Done', 'All data cleared.') },
      ]
    );
  };

  const themes = [
    { name: 'dark',   label: 'Dark',   icon: '🌑', desc: 'Default dark theme' },
    { name: 'light',  label: 'Light',  icon: '☀️', desc: 'Clean light theme'  },
    { name: 'amoled', label: 'AMOLED', icon: '⚫', desc: 'True black, battery saver' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={{ color: c.text, fontSize: 28, fontWeight: FONT.bold, marginBottom: SPACING.xl }}>Settings ⚙️</Text>

        {/* Profile */}
        <Section title="Profile">
          <View style={{ padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: SEMANTIC.primaryDim, borderWidth: 2, borderColor: SEMANTIC.primary + '50', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: SEMANTIC.primary, fontSize: 16, fontWeight: FONT.bold }}>EHS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: FONT.semibold }}>Safety Officer</Text>
              <Text style={{ color: c.textSub, fontSize: 13, marginTop: 2 }}>AVTL Plant · Admin</Text>
            </View>
            <Text style={{ color: c.textMuted, fontSize: 18 }}>›</Text>
          </View>
        </Section>

        {/* Appearance / Theme */}
        <Section title="Appearance">
          {themes.map((t, i) => (
            <View key={t.name}>
              <ThemeOption
                {...t} selected={theme === t.name}
                onPress={() => setTheme(t.name)}
              />
              {i < themes.length - 1 && (
                <View style={{ height: 1, backgroundColor: c.border, marginLeft: SPACING.xl + 52 }} />
              )}
            </View>
          ))}
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow icon="🔔" label="Daily Reminder" sub="8:00 AM daily checklist alert"
            right={<Switch {...switchProps(dailyReminder, setDailyReminder)} />}
          />
          <SettingRow icon="🚨" label="Overdue Alerts" sub="Instant alert for overdue tasks"
            right={<Switch {...switchProps(overdueAlerts, setOverdueAlerts)} />}
          />
          <SettingRow icon="📊" label="Weekly Summary" sub="Every Monday morning report"
            right={<Switch {...switchProps(weeklySummary, setWeeklySummary)} />}
            last
          />
        </Section>

        {/* Defaults */}
        <Section title="Defaults">
          <SettingRow icon="🏭" label="Default Plant" sub={defaultPlant}
            onPress={() => Alert.alert('Default Plant', 'Plant selector coming soon')}
          />
          <SettingRow icon="🔄" label="Default Frequency" sub={defaultFreq}
            onPress={() => Alert.alert('Default Frequency', 'Frequency picker coming soon')}
          />
          <SettingRow icon="⚡" label="Auto Task Generation" sub="Generate tasks daily at midnight"
            right={<Switch {...switchProps(autoGenerate, setAutoGenerate)} />}
            last
          />
        </Section>

        {/* Data Management */}
        <Section title="Data & Backup">
          <SettingRow icon="📄" label="Export as PDF" sub="Download monthly report"
            onPress={() => Alert.alert('Export', 'PDF export coming soon')}
          />
          <SettingRow icon="📊" label="Export as Excel" sub="Download task data as spreadsheet"
            onPress={() => Alert.alert('Export', 'Excel export coming soon')}
          />
          <SettingRow icon="☁️" label="Backup to Cloud" sub="Sync with Firebase"
            onPress={() => Alert.alert('Backup', 'Cloud backup coming soon')}
          />
          <SettingRow icon="🔄" label="Restore Data" sub="Restore from backup"
            onPress={() => Alert.alert('Restore', 'Restore coming soon')}
          />
          <SettingRow icon="🗑️" label="Clear All Data" sub="Permanently delete everything"
            onPress={confirmClear} last
          />
        </Section>

        {/* Security */}
        <Section title="Security">
          <SettingRow icon="🔐" label="App Lock" sub="PIN or fingerprint protection"
            right={<Switch {...switchProps(appLock, setAppLock)} />}
          />
          <SettingRow icon="⏱️" label="Auto-lock" sub="Lock after 5 minutes of inactivity"
            onPress={() => {}} last
          />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow icon="ℹ️" label="App Version" sub="v1.0.0 — Safexa" />
          <SettingRow icon="👨‍💻" label="Developer" sub="Built with React Native + Expo" last />
        </Section>

        <Text style={{ color: c.textMuted, fontSize: 12, textAlign: 'center', marginTop: SPACING.md }}>
          Safexa © 2026 · Industrial Safety Tracker
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
