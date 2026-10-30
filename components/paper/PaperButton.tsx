import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { cutCorners, fonts, paper, type CutShape } from '../../lib/theme';

interface PaperButtonProps {
  label?: string;
  icon?: ReactNode;
  onPress?: () => void;
  color?: string;
  textColor?: string;
  shape?: CutShape;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES = {
  sm: { minHeight: 40, paddingHorizontal: 14, fontSize: 15, lift: 3 },
  md: { minHeight: 50, paddingHorizontal: 18, fontSize: 18, lift: 4 },
  lg: { minHeight: 58, paddingHorizontal: 22, fontSize: 21, lift: 5 },
} as const;

/** Paper button that squashes into its shadow when pressed. */
export function PaperButton({
  label,
  icon,
  onPress,
  color = paper.red,
  textColor = paper.card,
  shape = 'c',
  size = 'md',
  disabled,
  accessibilityLabel,
  style,
}: PaperButtonProps) {
  const s = SIZES[size];
  const press = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: press.value * (s.lift - 1) },
      { translateY: press.value * s.lift },
      { scale: 1 - press.value * 0.02 },
    ],
  }));
  const corners = cutCorners[shape];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(1, { damping: 18, stiffness: 500 });
      }}
      onPressOut={() => {
        press.value = withSpring(0, { damping: 9, stiffness: 320 });
      }}
      style={[styles.wrap, disabled && styles.disabled, style]}
    >
      <View
        
        style={[{ pointerEvents: 'none' }, 
          StyleSheet.absoluteFill,
          corners,
          { backgroundColor: paper.shadowStrong, transform: [{ translateX: s.lift - 1 }, { translateY: s.lift }] },
        ]}
      />
      <Animated.View
        style={[
          styles.face,
          corners,
          { backgroundColor: color, minHeight: s.minHeight, paddingHorizontal: s.paddingHorizontal },
          faceStyle,
        ]}
      >
        {icon}
        {label ? (
          <Text style={[styles.label, { color: textColor, fontSize: s.fontSize }]} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
  face: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display,
    paddingTop: 3,
  },
  wrap: {
    position: 'relative',
  },
});
