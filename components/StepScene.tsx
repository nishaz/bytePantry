import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { getMotionConfig } from '../lib/stepMotion';
import type { Step } from '../types/recipe';

interface StepSceneProps {
  step: Step;
}

const INGREDIENT_COLORS = ['#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316'];
const TOOL_COLORS = ['#64748b', '#475569', '#334155'];

function hashLabel(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash + label.charCodeAt(i) * (i + 1)) % 997;
  }
  return hash;
}

function colorForLabel(label: string, palette: string[]): string {
  if (!label.trim()) {
    return palette[0];
  }
  return palette[hashLabel(label.toLowerCase()) % palette.length];
}

function PlaceholderSprite({
  label,
  color,
  size,
  style,
}: {
  label: string;
  color: string;
  size: number;
  style?: object;
}) {
  return (
    <Animated.View
      style={[
        styles.sprite,
        {
          backgroundColor: color,
          height: size,
          width: size,
        },
        style,
      ]}
    >
      <Text style={styles.spriteLabel} numberOfLines={1}>
        {label.trim() || '•'}
      </Text>
    </Animated.View>
  );
}

export function StepScene({ step }: StepSceneProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const motion = getMotionConfig(step.action);

  const ingredientLabel = step.ingredient.trim() || 'bowl';
  const toolLabel = step.tool.trim() || 'pot';
  const ingredientColor = colorForLabel(ingredientLabel, INGREDIENT_COLORS);
  const toolColor = colorForLabel(toolLabel, TOOL_COLORS);

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: motion.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: motion.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [motion.duration, progress, step.action]);

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

  return (
    <View style={styles.scene} accessibilityLabel={`Step animation: ${step.action}`}>
      <View style={styles.counter} />
      <View style={styles.stove} />
      <View style={styles.workArea}>
        <PlaceholderSprite
          label={ingredientLabel}
          color={ingredientColor}
          size={48}
          style={{
            transform: [
              { translateX: ingredientTranslateX },
              { translateY: ingredientTranslateY },
              { scale: ingredientScale },
            ],
          }}
        />
        <PlaceholderSprite
          label={toolLabel}
          color={toolColor}
          size={40}
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
    alignItems: 'center',
    borderColor: '#1c1917',
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
  },
  spriteLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
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
