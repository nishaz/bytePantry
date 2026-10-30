import Svg, { Circle, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Tomato({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Circle cx={12} cy={13} r={8} fill="#C86A6E" />
      <Path
        d="M8.5 7.5c1.2-2 2.8-3 3.5-3s2.3 1 3.5 3"
        stroke="#87A974"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
