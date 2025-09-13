
import { SafeAreaProvider, useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { Platform } from 'react-native';
import { setupErrorLogging } from '../utils/errorLogger';
import { AuthProvider } from '../contexts/AuthContext';

const STORAGE_KEY = 'emulate';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [emulate, setEmulate] = useState(false);
  const { emulate: emulateParam } = useGlobalSearchParams();

  useEffect(() => {
    if (emulateParam) {
      setEmulate(true);
    }
  }, [emulateParam]);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="expenses" />
              <Stack.Screen name="income" />
              <Stack.Screen name="loans" />
              <Stack.Screen name="debts" />
            </Stack>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
