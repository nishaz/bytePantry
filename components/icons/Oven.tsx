import Svg, { Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Oven({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Rect x={3} y={2} width={18} height={20} rx={2} fill="#4A4A54" />
      <Rect x={5} y={4} width={14} height={6} rx={1} fill="#6E4F32" />
      <Rect x={5} y={12} width={14} height={8} rx={1.5} fill="#1A2744" stroke="#8A6440" strokeWidth={1} />
      <Rect x={6.5} y={13.5} width={11} height={5} rx={1} fill="#2B2B33" />
    </Svg>
  );
}
