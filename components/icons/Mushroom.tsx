import Svg, { Path, Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Mushroom({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M4 11a8 6 0 0 1 16 0z" fill="#C1626A" />
    <Circle cx={8} cy={7.5} r={1} fill="#E9D3D4" />
    <Circle cx={14} cy={6.5} r={1.2} fill="#E9D3D4" />
    <Circle cx={17} cy={9} r=".8" fill="#E9D3D4" />
    <Rect x={9} y={11} width={6} height={8} rx={2.5} fill="#F5EFE4" stroke="#D8CDB4" strokeWidth={1} />
    </Svg>
  );
}
