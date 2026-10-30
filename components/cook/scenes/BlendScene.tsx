import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Blade } from '../../icons/Blade';
import { Blender } from '../../icons/Blender';
import { IngredientDots } from '../IngredientDots';
import { ANIM, INGREDIENT_WELLS, sceneScale, VIEWBOX } from '../sceneLayout';
import { SceneCanvas } from '../SceneCanvas';

interface BlendSceneProps {
  width: number;
  height: number;
  ingredients: string[];
}

export function BlendScene({ width, height, ingredients }: BlendSceneProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, { duration: ANIM.blend.spinMs, easing: Easing.linear }),
      -1,
    );
  }, [spin]);

  const bladeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const iconSize = Math.max(8, scale * 2.3);
  const bladeW = sceneW * 0.32;
  const bladeH = sceneH * 0.18;

  return (
    <SceneCanvas width={width} height={height}>
      <View style={{ width: sceneW, height: sceneH }}>
        <Blender width={sceneW} height={sceneH} style={StyleSheet.absoluteFill} />
        <IngredientDots
          ingredients={ingredients}
          iconSize={iconSize}
          max={4}
          well={INGREDIENT_WELLS.blenderJar}
        />
        <Animated.View
          style={[styles.blade, { width: bladeW, height: bladeH }, bladeStyle]}
          pointerEvents="none"
        >
          <Blade width={bladeW} height={bladeH} />
        </Animated.View>
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  blade: {
    bottom: '24%',
    left: '34%',
    position: 'absolute',
  },
});
