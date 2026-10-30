import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Bread({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 13c0-5 4-8 9-8s9 3 9 8v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#D9A66A" />
    <Path d="M3 13c0-5 4-8 9-8s9 3 9 8" fill="none" stroke="#B9803F" strokeWidth={1.2} />
    <Path d="M7 9c1-1.5 2.5-2 5-2s4 .5 5 2" stroke="#F0D9B0" strokeWidth={1.3} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
