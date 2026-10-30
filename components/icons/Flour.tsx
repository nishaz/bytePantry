import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Flour({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M6 5h12l2 15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#F5EFE4" stroke="#D8CDB4" strokeWidth={1} />
    <Path d="M6 5l1-2h10l1 2" fill="#C1626A" />
    <Rect x={8} y={9} width={8} height={4} fill="#E9E1CC" />
    </Svg>
  );
}
