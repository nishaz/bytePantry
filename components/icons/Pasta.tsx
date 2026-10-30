import Svg, { Rect, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pasta({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={4} y={4} width={16} height={16} rx={1.5} fill="#F0CE6E" />
    <Rect x={6} y={6} width={12} height={9} fill="#fff" opacity={.85} />
    <Path d="M8 15c0-5 0-7 1.5-9M12 15c0-5 0-7 1.5-9M16 15c0-5 0-7 1-9" stroke="#E9BE5C" strokeWidth={1.3} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
