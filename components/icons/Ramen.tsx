import Svg, { Path, Ellipse, Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Ramen({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 11h18a9 9 0 0 1-18 0z" fill="#fff" stroke="#C9BFA0" strokeWidth={1} />
    <Ellipse cx={12} cy={12.5} rx={7} ry={2.6} fill="#C98E53" />
    <Path d="M8 13l1.5-1.3 1.5 1.3 1.5-1.3 1.5 1.3 1.5-1.3" stroke="#F0D9B0" strokeWidth={1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={9} cy={10.6} r={1.1} fill="#C1626A" />
    <Rect x={14} y={2} width={1.3} height={13} rx=".6" fill="#B98657" transform="rotate(35 14.65 8.5)" />
    <Rect x={16.2} y={2} width={1.3} height={13} rx=".6" fill="#B98657" transform="rotate(35 16.85 8.5)" />
    </Svg>
  );
}
