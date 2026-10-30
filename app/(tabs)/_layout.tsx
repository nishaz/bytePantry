import { Tabs } from 'expo-router';

import { PaperTabBar } from '../../components/paper/PaperTabBar';
import { paper } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tabBar={(props) => <PaperTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: paper.kraft },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Kitchen' }} />
      <Tabs.Screen name="fridge" options={{ title: 'Pantry' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="recipes" options={{ title: 'Recipes' }} />
    </Tabs>
  );
}
