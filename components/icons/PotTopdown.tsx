import Svg, { Rect, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function PotTopdown({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={0} y={9.5} width={3.5} height={3} rx={1.3} fill="#4A4A54" />
    <Rect x={19} y={9.5} width={3.5} height={3} rx={1.3} fill="#4A4A54" />
    <Circle cx={11} cy={11} r={9} fill="#86A4C2" />
    <Circle cx={11} cy={11} r={7.5} fill="#6C8EAD" />
    <Circle cx={11} cy={11} r={6.5} fill="#C98E53" />
    </Svg>
  );
}
