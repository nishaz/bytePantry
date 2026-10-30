import Svg, { Rect, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function BakedPasta({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={3} y={12} width={18} height={7} rx={1.5} fill="#D8826B" />
    <Rect x={3} y={12} width={18} height={2} fill="#E9BE5C" />
    <Circle cx={7} cy={12} r={1.3} fill="#F2CF6E" />
    <Circle cx={12} cy={11.3} r={1.3} fill="#F2CF6E" />
    <Circle cx={17} cy={12} r={1.3} fill="#F2CF6E" />
    <Rect x={2.3} y={18.4} width={19.4} height={1.6} rx=".8" fill="#B9803F" />
    </Svg>
  );
}
