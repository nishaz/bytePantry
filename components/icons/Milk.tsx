import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Milk({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Path d="M7 4h10l1 16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#fff" stroke="#C9BFA0" strokeWidth={1} />
      <Rect x={8} y={10} width={8} height={9} rx={1} fill="#D8DEE4" />
      <Rect x={7.5} y={3} width={9} height={2.2} rx={0.8} fill="#6C8EAD" />
    </Svg>
  );
}
