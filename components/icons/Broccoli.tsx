import Svg, { Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Broccoli({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Circle cx={9} cy={8} r={4} fill="#5E8C4A" />
    <Circle cx={14} cy={7} r={4} fill="#7FA46B" />
    <Circle cx={12} cy={11} r={4} fill="#6B9A57" />
    <Rect x={10.5} y={12} width={3} height={8} rx={1.2} fill="#D9E6C9" />
    </Svg>
  );
}
