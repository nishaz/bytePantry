import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Blade({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Path d="M12 14l-4 4M12 14l4 4M12 14V8" stroke="#8A6440" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M9 11h6" stroke="#D8DEE4" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
