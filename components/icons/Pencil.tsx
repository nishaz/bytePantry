import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pencil({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Path d="M4 20l4-1 9-9-3-3-9 9z" fill="#E9BE5C" />
      <Path d="M13 7l3 3" stroke="#B9803F" strokeWidth={1.2} />
      <Rect x={3} y={19} width={6} height={2} rx={0.6} fill="#C1626A" />
    </Svg>
  );
}
