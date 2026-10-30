import Svg, { Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function SauceJar({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={5} y={8} width={14} height={13} rx={2.5} fill="#fff" stroke="#C9BFA0" strokeWidth={1} />
    <Rect x={6} y={12} width={12} height={9} rx={2} fill="#C1626A" />
    <Rect x={7} y={5} width={10} height={4} rx={1.4} fill="#6C8EAD" />
    </Svg>
  );
}
