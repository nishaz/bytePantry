import Svg, { Path, Ellipse } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Apple({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M12 8c-4-3-9 0-9 5.5C3 18 7 21 10 21c1 0 1.5-.5 2-.5s1 .5 2 .5c3 0 7-3 7-7.5C21 8 16 5 12 8z" fill="#C1626A" />
    <Path d="M12 8c0-2 .5-3.5 2-5" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" />
    <Ellipse cx={9} cy={11} rx={1.6} ry={2.4} fill="#fff" opacity={.35} />
    </Svg>
  );
}
