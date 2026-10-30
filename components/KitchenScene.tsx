import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { TopDownScene } from './TopDownScene';
import { listStepIngredients } from '../lib/stepIngredients';
import { getSceneEquipment, getScenePerspective } from '../lib/stepSceneLayout';
import type { Step } from '../types/recipe';

interface KitchenSceneProps {
  step: Step;
  recipeIngredients?: string[];
  isNight?: boolean;
}

function WallBackdrop({ fade }: { fade: Animated.Value }) {
  const dayOpacity = fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const nightOpacity = fade;

  return (
    <View style={styles.wallStrip}>
      <Animated.View style={[styles.wallFill, styles.wallDay, { opacity: dayOpacity }]} />
      <Animated.View style={[styles.wallFill, styles.wallNight, { opacity: nightOpacity }]} />

      <View style={styles.shelf}>
        <View style={styles.shelfBoard} />
        <View style={styles.shelfBook} />
        <View style={styles.shelfJar} />
      </View>

      <View style={styles.windowFrame}>
        <Animated.View style={[styles.sky, styles.skyDay, { opacity: dayOpacity }]}>
          <View style={styles.skyIcon}>
            <View style={styles.flatSun} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.sky, styles.skyNight, { opacity: nightOpacity }]}>
          <View style={styles.skyIcon}>
            <View style={styles.flatMoon} />
          </View>
          <View style={styles.star} />
        </Animated.View>
      </View>
    </View>
  );
}

export function KitchenScene({ step, recipeIngredients = [], isNight = true }: KitchenSceneProps) {
  const skyFade = useRef(new Animated.Value(isNight ? 1 : 0)).current;
  const equipment = getSceneEquipment(step);
  const perspective = getScenePerspective(equipment);
  const ingredients = listStepIngredients(step, recipeIngredients);
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    Animated.timing(skyFade, {
      toValue: isNight ? 1 : 0,
      duration: 450,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver,
    }).start();
  }, [isNight, skyFade, useNativeDriver]);

  return (
    <View style={styles.scene}>
      {perspective === 'front' ? <WallBackdrop fade={skyFade} /> : null}
      <TopDownScene
        equipment={equipment}
        ingredients={ingredients}
        action={step.action}
        fullHeight={perspective === 'topdown'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: '#1c2320',
    flex: 1,
  },
  shelf: {
    left: '8%',
    position: 'absolute',
    top: '28%',
    width: '28%',
  },
  shelfBoard: {
    backgroundColor: '#8A5A3B',
    height: 5,
    width: '100%',
  },
  shelfBook: {
    backgroundColor: '#E9BE5C',
    height: 14,
    left: 4,
    position: 'absolute',
    top: -14,
    width: 7,
  },
  shelfJar: {
    backgroundColor: '#7FA46B',
    height: 12,
    left: 14,
    position: 'absolute',
    top: -12,
    width: 10,
  },
  sky: {
    ...StyleSheet.absoluteFill,
  },
  skyDay: {
    backgroundColor: '#87CEEB',
  },
  skyNight: {
    backgroundColor: '#1A2744',
  },
  star: {
    backgroundColor: '#D8DEE4',
    height: 3,
    left: 10,
    position: 'absolute',
    top: 12,
    width: 3,
  },
  flatMoon: {
    backgroundColor: '#F1D8A0',
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  flatSun: {
    backgroundColor: '#E9BE5C',
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  skyIcon: {
    position: 'absolute',
    right: 6,
    top: 6,
  },
  wallDay: {
    backgroundColor: '#DCE7CE',
  },
  wallFill: {
    ...StyleSheet.absoluteFill,
  },
  wallNight: {
    backgroundColor: '#38443A',
  },
  wallStrip: {
    height: '22%',
    overflow: 'hidden',
  },
  windowFrame: {
    borderColor: '#8A6440',
    borderWidth: 3,
    height: '70%',
    overflow: 'hidden',
    position: 'absolute',
    right: '8%',
    top: '12%',
    width: '22%',
  },
});
