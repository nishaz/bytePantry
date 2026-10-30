import Svg, { Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Cucumber({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={2.5} y={9} width={19} height={6} rx={3} fill="#7FA46B" transform="rotate(-8 12 12)" />
    <Rect x={5} y={10.3} width={14} height={3.4} rx={1.6} fill="#A8C98F" transform="rotate(-8 12 12)" />
    </Svg>
  );
}
