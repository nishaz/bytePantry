import Svg, { Path, Ellipse, Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function RiceDish({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 11h18a9 9 0 0 1-18 0z" fill="#EFE9D8" stroke="#C9BFA0" strokeWidth={1} />
    <Ellipse cx={12} cy={12} rx={7.5} ry={2.6} fill="#fff" />
    <Circle cx={9} cy={11} r=".6" fill="#D8CDB4" />
    <Circle cx={12} cy={12.3} r=".6" fill="#D8CDB4" />
    <Circle cx={15} cy={11} r=".6" fill="#D8CDB4" />
    <Rect x={15.5} y={3} width={1.1} height={8} rx=".5" fill="#D9A66A" transform="rotate(10 16 7)" />
    <Rect x={17.5} y={3} width={1.1} height={8} rx=".5" fill="#D9A66A" transform="rotate(10 18 7)" />
    </Svg>
  );
}
