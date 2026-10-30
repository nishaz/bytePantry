import type { StyleProp, ViewStyle } from 'react-native';

export interface FlatIconProps {
  size?: number;
  width?: number;
  height?: number;
  /** Optional tint — only applied when icon supports it */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function iconSizeProps({
  size = 24,
  width,
  height,
}: Pick<FlatIconProps, 'size' | 'width' | 'height'>) {
  const w = width ?? size;
  const h = height ?? size;
  return { width: w, height: h };
}
