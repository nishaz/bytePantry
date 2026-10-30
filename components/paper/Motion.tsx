import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** Gentle floating + rocking, like paper on a breeze. */
export function Bob({
  children,
  distance = 6,
  rock = 2,
  duration = 1500,
  delay = 0,
  style,
}: {
  children: ReactNode;
  distance?: number;
  rock?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delay, duration, t]);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: -t.value * distance }, { rotate: `${(t.value - 0.5) * 2 * rock}deg` }],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Quick side-to-side wiggle on a loop, with a rest between wiggles. */
export function Wiggle({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 90 }),
        withTiming(6, { duration: 120 }),
        withTiming(-4, { duration: 110 }),
        withTiming(0, { duration: 100 }),
        withTiming(0, { duration: 1800 }),
      ),
      -1,
    );
  }, [r]);
  const animated = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Staggered "dealt onto the table" entrance for lists of cards. */
export function dealIn(index: number) {
  return FadeInDown.delay(80 + index * 70)
    .springify()
    .damping(14);
}
