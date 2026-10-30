import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cutCorners, fonts, paper } from '../../lib/theme';
import { BookIcon, FridgeIcon, HomeIcon, PlusIcon } from './UiIcons';

/** The bits of expo-router's tab bar props we use (kept local to avoid deep imports). */
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

const TABS: Record<string, { label: string; Icon: typeof HomeIcon }> = {
  index: { label: 'Kitchen', Icon: HomeIcon },
  fridge: { label: 'Pantry', Icon: FridgeIcon },
  recipes: { label: 'Recipes', Icon: BookIcon },
};

export function PaperTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  function go(routeKey: string, name: string, focused: boolean) {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(name);
  }

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View>
      <View style={[StyleSheet.absoluteFill, styles.shadow, cutCorners.d]} />
      <View style={[styles.bar, cutCorners.d]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          if (route.name === 'add') {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel="Add a recipe"
                onPress={() => go(route.key, route.name, focused)}
                style={({ pressed }) => [styles.addWrap, pressed && styles.addPressed]}
              >
                <View style={[styles.addShadow, cutCorners.c]} />
                <View style={[styles.add, cutCorners.c]}>
                  <PlusIcon size={28} />
                </View>
              </Pressable>
            );
          }
          const tab = TABS[route.name];
          if (!tab) return null;
          const color = focused ? paper.yellow : '#CDBBA6';
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              onPress={() => go(route.key, route.name, focused)}
              style={styles.tab}
            >
              <tab.Icon size={24} color={color} />
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  add: {
    alignItems: 'center',
    backgroundColor: paper.red,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  addPressed: {
    transform: [{ rotate: '-4deg' }, { translateY: 3 }],
  },
  addShadow: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    height: 58,
    left: 3,
    position: 'absolute',
    top: 4,
    width: 58,
  },
  addWrap: {
    marginTop: -30,
    transform: [{ rotate: '-4deg' }],
  },
  bar: {
    alignItems: 'center',
    backgroundColor: paper.ink,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 64,
    paddingHorizontal: 6,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  outer: {
    backgroundColor: 'transparent',
    left: 0,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  shadow: {
    backgroundColor: paper.shadow,
    transform: [{ translateX: 4 }, { translateY: 5 }],
  },
  tab: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 64,
  },
});
