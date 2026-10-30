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

import { CuttingBoardBase } from '../../icons/CuttingBoardBase';
import { Knife } from '../../icons/Knife';
import { IngredientDots } from '../IngredientDots';
import { ANIM, INGREDIENT_WELLS, sceneScale, vb, VIEWBOX } from '../sceneLayout';
import { SceneCanvas } from '../SceneCanvas';

interface ChopSceneProps {
  width: number;
  height: number;
  ingredients: string[];
}

export function ChopScene({ width, height, ingredients }: ChopSceneProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;
  const lift = useSharedValue(0);

  useEffect(() => {
    const delta = vb(scale, ANIM.chop.liftUnits);
    lift.value = withRepeat(
      withSequence(
        withTiming(delta, { duration: ANIM.chop.durationMs, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: ANIM.chop.durationMs, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [lift, scale]);

  const knifeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));

  const iconSize = Math.max(10, scale * 3.4);

  return (
    <SceneCanvas width={width} height={height}>
      <View style={{ width: sceneW, height: sceneH }}>
        <CuttingBoardBase width={sceneW} height={sceneH} style={StyleSheet.absoluteFill} />
        <IngredientDots
          ingredients={ingredients}
          iconSize={iconSize}
          max={6}
          well={INGREDIENT_WELLS.board}
        />
        <Animated.View
          style={[
            styles.knife,
            { width: sceneW * 0.34, height: sceneH * 0.52 },
            knifeStyle,
          ]}
          pointerEvents="none"
        >
          <Knife width={sceneW * 0.34} height={sceneH * 0.52} />
        </Animated.View>
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  knife: {
    position: 'absolute',
    right: '4%',
    top: '0%',
  },
});
