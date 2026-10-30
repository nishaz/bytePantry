import Svg, { Ellipse, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Lemon({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Ellipse cx={12} cy={12} rx={8} ry={6.5} fill="#F0CE6E" />
    <Path d="M4 12c0-1 1-1.2 1.6-.6M20 12c0-1-1-1.2-1.6-.6" stroke="#D9A043" strokeWidth={1.3} strokeLinecap="round" />
    <Path d="M7 9c3 1.5 7 1.5 10 0" stroke="#F6E3A1" strokeWidth={1} fill="none" />
    </Svg>
  );
}
