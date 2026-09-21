import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { initDb } from '../lib/db';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch((error) => {
        console.error('Failed to initialize database', error);
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff7ed' },
        headerTintColor: '#431407',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#fffbeb' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Pixel Pantry' }} />
      <Stack.Screen name="add-recipe" options={{ title: 'Add Recipe' }} />
      <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    flex: 1,
    justifyContent: 'center',
  },
});
