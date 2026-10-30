import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { FlatImage } from './FlatImage';
import { KitchenScene } from './KitchenScene';
import { getMotionConfig } from '../lib/stepMotion';
import type { Step } from '../types/recipe';

interface StepSceneProps {
  step: Step;
  variant?: 'card' | 'fullscreen';
  isNight?: boolean;
  recipeIngredients?: string[];
}

function FlatSprite({
  label,
  fallback,
  targetSize,
  style,
}: {
  label: string;
  fallback: 'bowl' | 'cutting-board';
  targetSize: number;
  style?: object;
}) {
  return (
    <Animated.View accessibilityLabel={label} style={style}>
      <FlatImage label={label} fallback={fallback} size={targetSize} />
    </Animated.View>
  );
}

export function StepScene({
  step,
  variant = 'card',
  isNight = true,
  recipeIngredients = [],
}: StepSceneProps) {
  if (variant === 'fullscreen') {
    return (
      <KitchenScene step={step} isNight={isNight} recipeIngredients={recipeIngredients} />
    );
  }

  const progress = useRef(new Animated.Value(0)).current;
  const motion = getMotionConfig(step.action);

  const ingredientLabel = step.ingredient.trim() || 'bowl';
  const toolLabel = step.tool.trim() || 'cutting-board';

  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: motion.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: motion.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [motion.duration, progress, step.action, useNativeDriver]);

  const toolTranslateY =
    motion.toolBob !== undefined
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -motion.toolBob],
        })
      : 0;

  const ingredientTranslateY =
    motion.ingredientBob !== undefined
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -motion.ingredientBob],
        })
      : motion.ingredientDrop !== undefined
        ? progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, motion.ingredientDrop],
          })
        : 0;

  const toolRotate =
    motion.toolRotate !== undefined
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [`${motion.toolRotate[0]}deg`, `${motion.toolRotate[1]}deg`],
        })
      : motion.toolTilt !== undefined
        ? progress.interpolate({
            inputRange: [0, 1],
            outputRange: [`${motion.toolTilt[0]}deg`, `${motion.toolTilt[1]}deg`],
          })
        : '0deg';

  const ingredientScale =
    motion.ingredientScale !== undefined
      ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: motion.ingredientScale,
        })
      : 1;

  const ingredientTranslateX =
    motion.ingredientShake !== undefined
      ? progress.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, motion.ingredientShake, 0, -motion.ingredientShake, 0],
        })
      : 0;

  const ingredientSize = 48;
  const toolSize = 40;

  return (
    <View style={styles.scene} accessibilityLabel={`Step animation: ${step.action}`}>
      <View style={styles.counter} />
      <View style={styles.stove} />

      <View style={styles.workArea}>
        <FlatSprite
          label={ingredientLabel}
          fallback="bowl"
          targetSize={ingredientSize}
          style={{
            transform: [
              { translateX: ingredientTranslateX },
              { translateY: ingredientTranslateY },
              { scale: ingredientScale },
            ],
          }}
        />
        <FlatSprite
          label={toolLabel}
          fallback="cutting-board"
          targetSize={toolSize}
          style={{
            marginLeft: 24,
            transform: [{ translateY: toolTranslateY }, { rotate: toolRotate }],
          }}
        />
      </View>

      <Text style={styles.actionLabel}>{step.action}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionLabel: {
    bottom: 8,
    color: '#fef3c7',
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
    right: 10,
    textTransform: 'uppercase',
  },
  counter: {
    backgroundColor: '#d6d3d1',
    borderBottomColor: '#a8a29e',
    borderBottomWidth: 4,
    height: 56,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scene: {
    backgroundColor: '#fef9c3',
    borderColor: '#ca8a04',
    borderRadius: 12,
    borderWidth: 2,
    height: 180,
    marginTop: 8,
    overflow: 'hidden',
  },
  sprite: {
    borderColor: '#1c1917',
    borderRadius: 4,
    borderWidth: 2,
  },
  stove: {
    backgroundColor: '#78716c',
    borderRadius: 8,
    bottom: 24,
    height: 36,
    left: 16,
    position: 'absolute',
    width: 72,
  },
  workArea: {
    alignItems: 'flex-end',
    bottom: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
