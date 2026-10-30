import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pineapple({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M8 20c-1.5-2-2-5-2-8 0-3.5 2.5-6 6-6s6 2.5 6 6c0 3-.5 6-2 8z" fill="#F0CE6E" />
    <Path d="M7 9l1.5 3M11 8l1 3.3M15 9l-1.5 3M9 12l1 3M13 12l-1 3" stroke="#D9A043" strokeWidth={1} strokeLinecap="round" />
    <Path d="M9 6c0-2-1-3.5-2.5-4.5M12 5.5V1M15 6c0-2 1-3.5 2.5-4.5" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
