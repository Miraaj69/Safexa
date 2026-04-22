import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from './Context_ThemeContext';
import { SEMANTIC, FONT, RADIUS, SPACING } from './Constants_theme';

import HomeScreen       from './Screens_HomeScreen';
import TasksScreen      from './Screens_TasksScreen';
import MasterScreen     from './Screens_MasterScreen';
import ReportsScreen    from './Screens_ReportsScreen';
import SettingsScreen   from './Screens_SettingsScreen';
import TaskDetailScreen from './Screens_TaskDetailScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TABS = [
  { name: 'Home',     icon: '⚡', label: 'Dashboard' },
  { name: 'Tasks',    icon: '✅', label: 'Tasks'     },
  { name: 'Master',   icon: '🗂️', label: 'Master'    },
  { name: 'Reports',  icon: '📊', label: 'Reports'   },
  { name: 'Settings', icon: '⚙️', label: 'Settings'  },
];

function TabItem({ tab, focused, onPress }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, tension: 400 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 400 }).start();

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View style={[
        styles.tabIconWrap,
        focused && { backgroundColor: SEMANTIC.primaryDim },
        { transform: [{ scale }] },
      ]}>
        <Text style={styles.tabIcon}>{tab.icon}</Text>
      </Animated.View>
      <Text style={[
        styles.tabLabel,
        { color: focused ? SEMANTIC.primary : colors.textMuted },
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.border }]}>
      {state.routes.map((route, index) => {
        const tab     = TABS.find(t => t.name === route.name) || {};
        const focused = state.index === index;
        return (
          <TabItem
            key={route.key}
            tab={tab}
            focused={focused}
            onPress={() => navigation.navigate(route.name)}
          />
        );
      })}
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Tasks"    component={TasksScreen}    />
      <Tab.Screen name="Master"   component={MasterScreen}   />
      <Tab.Screen name="Reports"  component={ReportsScreen}  />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Main"       component={HomeTabs} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen}
          options={{ presentation: 'modal', cardStyle: { backgroundColor: colors.bg } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection:    'row',
    borderTopWidth:   1,
    paddingBottom:    20,
    paddingTop:       10,
    paddingHorizontal: SPACING.sm,
  },
  tabItem: {
    flex: 1, alignItems: 'center', gap: 3,
  },
  tabIconWrap: {
    width: 40, height: 30, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIcon:  { fontSize: 16 },
  tabLabel: { fontSize: 9, fontWeight: FONT.medium },
});
