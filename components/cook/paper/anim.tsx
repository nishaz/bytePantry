import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { paper } from '../../../lib/theme';

/** A 0→1 value that loops forever. */
export function useLoop(duration: number, delay = 0, reverse = false, easing = Easing.linear): SharedValue<number> {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = 0;
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing }), -1, reverse));
  }, [delay, duration, easing, reverse, v]);
  return v;
}

interface PlacedProps {
  x: number;
  y: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Ingredient falls into the scene, bounces, then settles; repeats. */
export function Drop({ x, y, delay = 0, children }: PlacedProps & { delay?: number }) {
  const p = useLoop(2600, delay);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.04, 1], [0, 1, 1]),
    transform: [
      { translateY: interpolate(p.value, [0, 0.42, 0.52, 0.6, 0.68, 1], [-190, 0, -18, 0, -5, 0]) },
      { rotate: `${interpolate(p.value, [0, 0.42, 1], [0, 200, 250])}deg` },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>{children}</Animated.View>;
}

/** Piece that hops off in an arc (used for chopped bits and splashes). */
export function Hop({ x, y, dx, height = 56, delay = 0, duration = 1100, children }: PlacedProps & {
  dx: number;
  height?: number;
  delay?: number;
  duration?: number;
}) {
  const p = useLoop(duration, delay);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.08, 0.85, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: dx * p.value },
      { translateY: -height * Math.sin(Math.PI * p.value) + 10 * p.value },
      { rotate: `${p.value * (dx > 0 ? 320 : -320)}deg` },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>{children}</Animated.View>;
}

/** Little paper scrap that pops up and fades: sizzle, crumbs, splashes. */
export function Pop({ x, y, color, size = 12, delay = 0 }: { x: number; y: number; color: string; size?: number; delay?: number }) {
  const p = useLoop(1000, delay, false, Easing.out(Easing.quad));
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.3, 1], [0, 1, 0]),
    transform: [{ translateY: -40 * p.value }, { scale: interpolate(p.value, [0, 0.3, 1], [0, 1, 0.8]) }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.5,
          borderBottomRightRadius: size * 0.2,
          borderBottomLeftRadius: size * 0.45,
        },
        style,
      ]}
    />
  );
}

/** A curl of paper steam rising. */
export function Steam({ x, y, delay = 0, color = paper.card }: { x: number; y: number; delay?: number; color?: string }) {
  const p = useLoop(2200, delay, false, Easing.out(Easing.quad));
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.3, 1], [0, 0.9, 0]),
    transform: [{ translateY: 10 - 80 * p.value }, { scaleY: interpolate(p.value, [0, 1], [0.6, 1.1]) }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>
      <Svg width={30} height={70} viewBox="0 0 30 70">
        <Path d="M15 68c-12-10 12-18 0-30s12-20 0-34" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

/** Wrap children in a constant spin (deg per loop = 360). */
export function Spin({ duration, children, style, reverse }: { duration: number; children: ReactNode; style?: StyleProp<ViewStyle>; reverse?: boolean }) {
  const p = useLoop(duration);
  const s = useAnimatedStyle(() => ({ transform: [{ rotate: `${(reverse ? -1 : 1) * p.value * 360}deg` }] }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}

/** Fast tiny jitter, like something sizzling or a motor running. */
export function Buzz({ children, style, amount = 2, duration = 120 }: { children: ReactNode; style?: StyleProp<ViewStyle>; amount?: number; duration?: number }) {
  const p = useLoop(duration);
  const s = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.sin(p.value * Math.PI * 2) * amount },
      { translateY: Math.cos(p.value * Math.PI * 4) * amount * 0.6 },
      { rotate: `${Math.sin(p.value * Math.PI * 2) * amount * 0.4}deg` },
    ],
  }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}

/** Slow wobble of a whole piece of equipment. */
export function Wobble({ children, style, deg = 2, duration = 1800 }: { children: ReactNode; style?: StyleProp<ViewStyle>; deg?: number; duration?: number }) {
  const p = useLoop(duration, 0, true, Easing.inOut(Easing.sin));
  const s = useAnimatedStyle(() => ({ transform: [{ rotate: `${(p.value - 0.5) * 2 * deg}deg` }] }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}
