import Svg, { Ellipse, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Bowl({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Path d="M3 11h18a9 9 0 0 1-18 0z" fill="#EFE9D8" stroke="#C9BFA0" strokeWidth={1} />
      <Ellipse cx={12} cy={12} rx={7.5} ry={2.5} fill="#86A4C2" opacity={0.35} />
    </Svg>
  );
}
