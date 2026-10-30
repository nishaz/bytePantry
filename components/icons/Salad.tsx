import Svg, { Path, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Salad({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 11h18a9 9 0 0 1-18 0z" fill="#EFE9D8" stroke="#C9BFA0" strokeWidth={1} />
    <Circle cx={8} cy={10} r={2} fill="#7FA46B" />
    <Circle cx={13} cy={9} r={2.2} fill="#5E8C4A" />
    <Circle cx={16} cy={10.5} r={1.6} fill="#C1626A" />
    </Svg>
  );
}
