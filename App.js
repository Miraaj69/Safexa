import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { setupNotifications } from './utils/notifications';
import { generateDailyTasks } from './utils/taskGenerator';

export default function App() {
  useEffect(() => {
    setupNotifications();
    generateDailyTasks();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <StatusBar style="light" backgroundColor="#0d0f14" />
            <AppNavigator />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
