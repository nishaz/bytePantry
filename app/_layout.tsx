import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts as useNunito,
} from '@expo-google-fonts/nunito';
import { useFonts as useLocalFonts } from 'expo-font';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDb } from '../lib/db';
import { paper } from '../lib/theme';

export default function RootLayout() {
  const [nunitoLoaded] = useNunito({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const [displayLoaded] = useLocalFonts({
    Gluten_800ExtraBold: require('../assets/fonts/Gluten-ExtraBold.ttf'),
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch((error) => {
        console.error('Failed to initialize database', error);
        setReady(true);
      });
  }, []);

  if (!nunitoLoaded || !displayLoaded || !ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={paper.red} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: paper.kraft } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: paper.kraft,
    flex: 1,
    justifyContent: 'center',
  },
});
