import Svg, { Path, Ellipse } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function SoupBowl({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 11h18a9 9 0 0 1-18 0z" fill="#EFE9D8" stroke="#C9BFA0" strokeWidth={1} />
    <Ellipse cx={12} cy={12} rx={7.5} ry={2.5} fill="#E39B4B" />
    <Path d="M9 5c0-1.5 1-2 .5-3M14 5c0-1.5 1-2 .5-3" stroke="#D8CDB4" strokeWidth={1.3} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
