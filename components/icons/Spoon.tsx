import Svg, { Rect, Ellipse } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Spoon({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={11.4} y={4} width={1.2} height={9} fill="#D9A66A" />
    <Ellipse cx={12} cy={13.3} rx={1.8} ry={1} fill="#D9A66A" />
    </Svg>
  );
}
