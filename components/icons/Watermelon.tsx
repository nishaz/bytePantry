import Svg, { Circle, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Watermelon({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Circle cx={12} cy={13} r={8} fill="#C1626A" />
      <Path d="M4 13a8 8 0 0 1 16 0" fill="#7FA46B" />
      <Circle cx={10} cy={14} r={0.6} fill="#2B2B33" />
      <Circle cx={14} cy={15} r={0.6} fill="#2B2B33" />
      <Circle cx={12} cy={17} r={0.6} fill="#2B2B33" />
    </Svg>
  );
}
