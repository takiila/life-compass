import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AppStateProvider } from '@/src/state/AppStateProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <AppStateProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="backup" options={{ title: 'バックアップ' }} />
        <Stack.Screen name="training/goal" options={{ title: '体重目標' }} />
        <Stack.Screen name="training/recovery" options={{ title: '回復状況' }} />
        <Stack.Screen name="training/form-guide" options={{ title: 'フォームガイド' }} />
        <Stack.Screen name="training/form-history" options={{ title: 'フォーム確認履歴' }} />
        <Stack.Screen name="training/exercises/index" options={{ title: 'Exercise Library' }} />
        <Stack.Screen name="training/exercises/[id]" options={{ title: '種目ガイド' }} />
        <Stack.Screen name="training/library" options={{ title: '知識書庫' }} />
        <Stack.Screen name="native-integrations" options={{ title: '端末統合' }} />
        <Stack.Screen name="form-camera" options={{ title: 'フォーム自己確認' }} />
        <Stack.Screen name="journey/[feature]" options={{ title: 'Life Journey' }} />
        <Stack.Screen name="journey/tutorial" options={{ title: 'Journeyの案内' }} />
        <Stack.Screen name="blue-team" options={{ title: 'ブルーチーム' }} />
        <Stack.Screen name="weekly-review" options={{ title: '週次レビュー' }} />
        <Stack.Screen name="dev/theme-lab" options={{ title: 'Theme Lab' }} />
      </Stack>
    </AppStateProvider>
  );
}
