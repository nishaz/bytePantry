import Svg, { Rect, Ellipse } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pot({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={1} y={11} width={3.5} height={2} rx={1} fill="#4A4A54" />
    <Rect x={19.5} y={11} width={3.5} height={2} rx={1} fill="#4A4A54" />
    <Rect x={4} y={9} width={16} height={9} rx={2} fill="#6C8EAD" />
    <Rect x={4} y={9} width={16} height={2} fill="#86A4C2" />
    <Ellipse cx={12} cy={9} rx={8} ry={1.6} fill="#8CA9C6" />
    </Svg>
  );
}
