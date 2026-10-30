import Svg, { Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Generic({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Rect x={4} y={6} width={16} height={14} rx={3} fill="#D8CDB4" />
      <Circle cx={12} cy={13} r={3} fill="#8A6440" />
    </Svg>
  );
}
