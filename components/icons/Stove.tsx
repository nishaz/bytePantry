import Svg, { Rect, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Stove({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={2} y={3} width={20} height={18} rx={2} fill="#4A4A54" />
    <Circle cx={8} cy={9} r={3} fill="#2B2B33" />
    <Circle cx={16} cy={9} r={3} fill="#2B2B33" />
    <Circle cx={8} cy={16} r={3} fill="#2B2B33" />
    <Circle cx={16} cy={16} r={3} fill="#2B2B33" />
    <Circle cx={8} cy={9} r={1} fill="#E9BE5C" />
    <Circle cx={16} cy={9} r={1} fill="#E9BE5C" />
    <Circle cx={8} cy={16} r={1} fill="#E9BE5C" />
    <Circle cx={16} cy={16} r={1} fill="#E9BE5C" />
    </Svg>
  );
}
