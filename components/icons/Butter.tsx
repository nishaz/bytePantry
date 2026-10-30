import Svg, { Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Butter({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={4} y={6} width={16} height={10} rx={2} fill="#F2CF6E" />
    <Rect x={4} y={6} width={16} height={3} rx={1.5} fill="#FBE08A" />
    <Rect x={3} y={4} width={18} height={3} rx={1.2} fill="#fff" stroke="#E0D6B0" strokeWidth={1} />
    </Svg>
  );
}
