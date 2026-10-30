import Svg, { Path, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Cheese({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 16l16-9 2 9z" fill="#E9BE5C" />
    <Circle cx={9} cy={14.5} r={1} fill="#D9A043" />
    <Circle cx={14} cy={12.5} r={1.1} fill="#D9A043" />
    <Circle cx={12} cy={16} r=".9" fill="#D9A043" />
    </Svg>
  );
}
