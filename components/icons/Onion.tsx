import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Onion({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M12 3c3 2 6 5 6 10a6 6 0 0 1-12 0c0-5 3-8 6-10z" fill="#D8A7CB" />
    <Path d="M12 3c1.6 2 3 5 3 10a3 3 0 0 1-6 0c0-5 1.4-8 3-10z" fill="#C58AB8" opacity={.6} />
    <Path d="M12 3l-1-2M12 3l1-2" stroke="#7FA46B" strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
