import Svg, { Circle, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Orange({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Circle cx={12} cy={13} r={8} fill="#E39B4B" />
    <Path d="M12 5v2" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" />
    <Path d="M10 5.5c1-1 3-1 4 0" stroke="#7FA46B" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
