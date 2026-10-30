import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Sandwich({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M3 17l9-11 9 11z" fill="#D9A66A" />
    <Rect x={4.5} y={17} width={15} height={2.4} fill="#7FA46B" />
    <Rect x={5.5} y={19.4} width={13} height={2} rx={1} fill="#C1626A" />
    </Svg>
  );
}
