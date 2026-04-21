import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './Navigation_AppNavigator';
import { AppProvider } from './Context_AppContext';
import { ThemeProvider } from './Context_ThemeContext';
import { setupNotifications } from './Utils_notifications';
import { generateDailyTasks } from './Utils_taskGenerator';

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
