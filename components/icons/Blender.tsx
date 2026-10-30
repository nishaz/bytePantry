import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

/** Jar + base (blade is a separate animated layer). */
export function Blender({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Rect x={6} y={18} width={12} height={3} rx={1} fill="#3A3A42" />
      <Path d="M8 8h8l1 10a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" fill="#D8DEE4" stroke="#B98657" strokeWidth={1} />
      <Rect x={8.5} y={11} width={7} height={6} rx={1} fill="#C1626A" opacity={0.75} />
      <Rect x={7.5} y={6} width={9} height={2.5} rx={1} fill="#6C8EAD" />
    </Svg>
  );
}
