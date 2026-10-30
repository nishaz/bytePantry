import Svg, { Path, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Potato({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M4 13c-1-4 2-8 7-8s9 2 9 7-4 7-9 7-6-2-7-6z" fill="#C98E53" />
    <Circle cx={9} cy={10} r=".8" fill="#A06B38" />
    <Circle cx={14} cy={13} r=".8" fill="#A06B38" />
    <Circle cx={11} cy={15} r=".7" fill="#A06B38" />
    </Svg>
  );
}
