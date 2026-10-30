import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Banana({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M6 18A13 13 0 0 1 18 6" fill="none" stroke="#F0CE6E" strokeWidth={5} strokeLinecap="round" />
    <Path d="M17 6.5l2-2" stroke="#B98657" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
