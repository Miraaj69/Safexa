import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS, FONT, RADIUS, SPACING } from './Constants_theme';

import HomeScreen        from './Screens_HomeScreen';
import TasksScreen       from './Screens_TasksScreen';
import MasterScreen      from './Screens_MasterScreen';
import ReportsScreen     from './Screens_ReportsScreen';
import TaskDetailScreen  from './Screens_TaskDetailScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TABS = [
  { name: 'Home',    icon: '⚡', label: 'Dashboard' },
  { name: 'Tasks',   icon: '✅', label: 'Tasks'     },
  { name: 'Master',  icon: '🗂️', label: 'Master'    },
  { name: 'Reports', icon: '📊', label: 'Reports'   },
];

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused     = state.index === index;
        const tab         = TABS.find(t => t.name === route.name) || {};

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.textMuted }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
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
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="Tasks"   component={TasksScreen}   />
      <Tab.Screen name="Master"  component={MasterScreen}  />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.bg } }}>
        <Stack.Screen name="Main"       component={HomeTabs}       />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen}
          options={{ presentation: 'modal', cardStyle: { backgroundColor: COLORS.bg } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection:   'row',
    backgroundColor: '#0f1525',
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
    paddingBottom:   20,
    paddingTop:      10,
    paddingHorizontal: SPACING.sm,
  },
  tabItem: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  tabIconWrap: {
    width: 40, height: 32, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: COLORS.primaryDim,
  },
  tabIcon:  { fontSize: 18 },
  tabLabel: { fontSize: 10, fontWeight: FONT.medium },
});
