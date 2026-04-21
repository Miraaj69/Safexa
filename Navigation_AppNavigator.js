import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './Constants_theme';

import HomeScreen      from './Screens_HomeScreen';
import TasksScreen     from './Screens_TasksScreen';
import TaskDetailScreen from './Screens_TaskDetailScreen';
import ReportsScreen   from './Screens_ReportsScreen';
import MasterScreen    from './Screens_MasterScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList"   component={TasksScreen} />
      <Stack.Screen name="TaskDetail"  component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.text3,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size, focused }) => {
            const icons = {
              Home:    focused ? 'home'        : 'home-outline',
              Tasks:   focused ? 'checkbox'    : 'checkbox-outline',
              Reports: focused ? 'bar-chart'   : 'bar-chart-outline',
              Master:  focused ? 'settings'    : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home"    component={HomeScreen}   options={{ title: 'Dashboard' }} />
        <Tab.Screen name="Tasks"   component={TasksStack}   options={{ title: 'Tasks' }} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
        <Tab.Screen name="Master"  component={MasterScreen} options={{ title: 'Master' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bg1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
