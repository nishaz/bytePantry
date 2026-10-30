import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Link({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Path
        d="M9 12a4 4 0 0 1 0-5.7l1.4-1.4a4 4 0 0 1 5.7 5.7l-1 1"
        stroke="#6C8EAD"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M15 12a4 4 0 0 1 0 5.7l-1.4 1.4a4 4 0 0 1-5.7-5.7l1-1"
        stroke="#6C8EAD"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
