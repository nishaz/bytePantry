import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Carrot({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M18 6L20 9L7 21L4 18Z" fill="#E39B4B" />
    <Path d="M14.5 11l-1.6 1.6M12 13.5l-1.6 1.6M9.5 16l-1.6 1.6" stroke="#C98433" strokeWidth={1} strokeLinecap="round" />
    <Path d="M19 7.5L17 3M19 7.5L20.5 2.5M19 7.5L22 4.5" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
