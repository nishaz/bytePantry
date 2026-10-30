import { useEffect } from 'react';
import { type DimensionValue, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PotTopdown } from '../../icons/PotTopdown';
import { SteamPuff } from '../../icons/SteamPuff';
import { Stove } from '../../icons/Stove';
import { IngredientDots } from '../IngredientDots';
import { ANIM, INGREDIENT_WELLS, sceneScale, VIEWBOX } from '../sceneLayout';
import { SceneCanvas } from '../SceneCanvas';

interface BakeStoveSceneProps {
  width: number;
  height: number;
  ingredients: string[];
}

function RisingSteam({ left, delayMs, size }: { left: string; delayMs: number; size: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: ANIM.steam.riseMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [delayMs, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -progress.value * size * 0.85 }],
  }));

  return (
    <Animated.View
      style={[
        styles.steam,
        { left: left as DimensionValue, width: size, height: size },
        style,
      ]}
    >
      <SteamPuff size={size} />
    </Animated.View>
  );
}

export function BakeStoveScene({ width, height, ingredients }: BakeStoveSceneProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;
  const iconSize = Math.max(7, scale * 2);
  const steamSize = Math.max(14, scale * 4.8);
  const potW = sceneW * 0.76;
  const potH = sceneH * 0.48;

  return (
    <SceneCanvas width={width} height={height}>
      <View style={{ width: sceneW, height: sceneH }}>
        <Stove width={sceneW} height={sceneH} style={StyleSheet.absoluteFill} />
        <View style={styles.potSlot} pointerEvents="none">
          <PotTopdown width={potW} height={potH} />
          <IngredientDots
            ingredients={ingredients}
            iconSize={iconSize}
            max={4}
            well={INGREDIENT_WELLS.pot}
          />
        </View>
        <RisingSteam left="36%" delayMs={ANIM.steam.delaysMs[0]} size={steamSize} />
        <RisingSteam left="48%" delayMs={ANIM.steam.delaysMs[1]} size={steamSize * 0.92} />
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  potSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    left: '6%',
    position: 'absolute',
    right: '6%',
    top: '14%',
  },
  steam: {
    position: 'absolute',
    top: '6%',
  },
});
