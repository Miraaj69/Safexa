import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenExpo from 'expo-splash-screen';
import { AppProvider } from './Context_AppContext';
import { ThemeProvider, useTheme } from './Context_ThemeContext';
import AppNavigator from './Navigation_AppNavigator';
import SplashScreen from './Screens_SplashScreen';

// Keep native splash visible until we're ready
SplashScreenExpo.preventAutoHideAsync();

function ThemedApp() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  // Called when our custom splash animation finishes
  const onSplashDone = useCallback(async () => {
    // Hide the native expo splash (already hidden by our custom screen overlay)
    try { await SplashScreenExpo.hideAsync(); } catch {}
    setShowSplash(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#070A12" />
        <AppProvider>
          {/* Main app — always mounted so state loads in background */}
          {!showSplash && <AppNavigator />}

          {/* Custom splash — overlays everything, fades out */}
          {showSplash && <SplashScreen onDone={onSplashDone} />}
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
