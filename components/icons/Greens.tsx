import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Greens({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M12 21c-5-1-8-5-8-10 4 0 6 2 7 4 .5-3 1-5-1-9 4 1 6 4 6 8 3-1 4-3 4-6 3 3 2 9-2 12-2 1.5-4 1.5-6 1z" fill="#7FA46B" />
    <Path d="M12 21c-5-1-8-5-8-10 4 0 6 2 7 4" fill="#5E8C4A" opacity={.5} />
    </Svg>
  );
}
