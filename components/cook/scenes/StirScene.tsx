import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Spoon } from '../../icons/Spoon';
import { SoupBowl } from '../../icons/SoupBowl';
import { IngredientDots } from '../IngredientDots';
import { ANIM, INGREDIENT_WELLS, sceneScale, VIEWBOX } from '../sceneLayout';
import { SceneCanvas } from '../SceneCanvas';

interface StirSceneProps {
  width: number;
  height: number;
  ingredients: string[];
}

export function StirScene({ width, height, ingredients }: StirSceneProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;
  const rotation = useSharedValue(-ANIM.stir.rotateDeg);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(ANIM.stir.rotateDeg, {
          duration: ANIM.stir.durationMs,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(-ANIM.stir.rotateDeg, {
          duration: ANIM.stir.durationMs,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
    );
  }, [rotation]);

  const pivotX = sceneW * (ANIM.stir.pivotX / VIEWBOX);
  const pivotY = sceneH * (ANIM.stir.pivotY / VIEWBOX);

  const spoonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pivotX },
      { translateY: pivotY },
      { rotate: `${rotation.value}deg` },
      { translateX: -pivotX },
      { translateY: -pivotY },
    ],
  }));

  const iconSize = Math.max(9, scale * 2.9);

  return (
    <SceneCanvas width={width} height={height}>
      <View style={{ width: sceneW, height: sceneH }}>
        <SoupBowl width={sceneW} height={sceneH} style={StyleSheet.absoluteFill} />
        <IngredientDots
          ingredients={ingredients}
          iconSize={iconSize}
          max={5}
          well={INGREDIENT_WELLS.bowl}
        />
        <Animated.View
          style={[styles.spoon, { width: sceneW, height: sceneH }, spoonStyle]}
          pointerEvents="none"
        >
          <Spoon width={sceneW} height={sceneH} />
        </Animated.View>
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  spoon: {
    ...StyleSheet.absoluteFill,
    position: 'absolute',
  },
});
