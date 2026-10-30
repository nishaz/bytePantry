import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Garlic({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M12 4c3.5 1 5.5 4.5 5.5 8.5 0 4-2.5 6.5-5.5 6.5s-5.5-2.5-5.5-6.5C6.5 8.5 8.5 5 12 4z" fill="#F5EFE4" stroke="#D8CDB4" strokeWidth={1} />
    <Path d="M12 5v14" stroke="#D8CDB4" strokeWidth={1} />
    <Path d="M9 7.5c-1 1.5-1.5 3.3-1.5 5M15 7.5c1 1.5 1.5 3.3 1.5 5" stroke="#D8CDB4" strokeWidth={1} />
    <Path d="M12 4V1.5" stroke="#B98657" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
