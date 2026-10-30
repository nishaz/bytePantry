import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Yogurt({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M8 4h8l1 5-2 11H9L7 9z" fill="#fff" stroke="#C9BFA0" strokeWidth={1.2} />
    <Rect x={7.3} y={3} width={9.4} height={2.4} rx={1} fill="#6C8EAD" />
    <Path d="M8.3 10h7.4" stroke="#C1626A" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
