import Svg, { Path, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Corn({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M9 3c5 0 8 4 8 9s-3 9-5 9-5-5-5-10 1-8 2-8z" fill="#F0CE6E" />
    <Circle cx={9} cy={7} r=".8" fill="#D9A043" />
    <Circle cx={12} cy={6.5} r=".8" fill="#D9A043" />
    <Circle cx={9} cy={10} r=".8" fill="#D9A043" />
    <Circle cx={12.5} cy={10} r=".8" fill="#D9A043" />
    <Circle cx={10} cy={13} r=".8" fill="#D9A043" />
    <Circle cx={13} cy={13.5} r=".8" fill="#D9A043" />
    <Circle cx={11} cy={16.5} r=".8" fill="#D9A043" />
    <Path d="M9 3c-2 0-3.5 1.5-4 4M9 3c-1.5 1-2 2.5-1.5 4" fill="#7FA46B" />
    </Svg>
  );
}
