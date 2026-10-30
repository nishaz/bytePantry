import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Pie({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M4 19L12 4L20 19Z" fill="#D9A66A" />
    <Rect x={4} y={17.5} width={16} height={2.5} rx={1} fill="#B9803F" />
    <Path d="M9 17l1.5-6M12 17l0-7M15 17l-1.5-6" stroke="#F0D9B0" strokeWidth={1.1} strokeLinecap="round" />
    </Svg>
  );
}
