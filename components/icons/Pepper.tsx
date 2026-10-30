import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pepper({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M12 6c5 0 7 4 7 8a5 5 0 0 1-10 0c0-1.5.6-2.5 1.5-3.5C9 9 10 7 12 6z" fill="#C1626A" />
    <Path d="M11 6c.5-2 1-3.5 0-5" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" />
    <Path d="M11 3.3c1.3-.7 2.4-.3 3-.3" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
