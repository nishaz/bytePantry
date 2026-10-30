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

import { Pan } from '../../icons/Pan';
import { SizzleDot } from '../../icons/SizzleDot';
import { IngredientDots } from '../IngredientDots';
import { ANIM, INGREDIENT_WELLS, sceneScale, VIEWBOX } from '../sceneLayout';
import { SceneCanvas } from '../SceneCanvas';

interface FrySceneProps {
  width: number;
  height: number;
  ingredients: string[];
}

function Sizzle({
  left,
  top,
  size,
  delayMs,
}: {
  left: string;
  top: string;
  size: number;
  delayMs: number;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: ANIM.fry.sizzleMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: ANIM.fry.sizzleMs, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, [delayMs, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.sizzle,
        {
          left: left as DimensionValue,
          top: top as DimensionValue,
          width: size,
          height: size,
        },
        style,
      ]}
    >
      <SizzleDot size={size} />
    </Animated.View>
  );
}

export function FryScene({ width, height, ingredients }: FrySceneProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;
  const dot = Math.max(6, scale * 1.5);
  const iconSize = Math.max(9, scale * 2.5);

  const sizzleSlots = [
    { left: '38%', top: '36%' },
    { left: '46%', top: '40%' },
    { left: '42%', top: '46%' },
  ];

  return (
    <SceneCanvas width={width} height={height}>
      <View style={{ width: sceneW, height: sceneH }}>
        <Pan width={sceneW} height={sceneH} style={StyleSheet.absoluteFill} />
        <IngredientDots
          ingredients={ingredients}
          iconSize={iconSize}
          max={4}
          well={INGREDIENT_WELLS.pan}
        />
        {sizzleSlots.map((slot, index) => (
          <Sizzle
            key={slot.left}
            left={slot.left}
            top={slot.top}
            size={dot}
            delayMs={ANIM.fry.delaysMs[index] ?? 0}
          />
        ))}
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  sizzle: {
    position: 'absolute',
  },
});
