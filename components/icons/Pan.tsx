import Svg, { Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pan({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Circle cx={11} cy={12} r={8} fill="#3A3A42" />
    <Circle cx={11} cy={12} r={6} fill="#D9A66A" />
    <Rect x={18} y={11} width={6} height={2.4} rx={1.2} fill="#3A3A42" />
    </Svg>
  );
}
