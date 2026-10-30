import Svg, { Ellipse } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Egg({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Ellipse cx={12} cy={13} rx={7} ry={9} fill="#F5EFE4" stroke="#D8CDB4" strokeWidth={1} />
    </Svg>
  );
}
