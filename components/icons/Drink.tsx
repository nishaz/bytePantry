import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Drink({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M7 4h10l-1 16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="#fff" stroke="#C9BFA0" strokeWidth={1} />
    <Path d="M6.8 9h10.4l-.8 10.6a1.8 1.8 0 0 1-1.8 1.6h-5.2a1.8 1.8 0 0 1-1.8-1.6z" fill="#E39B4B" opacity={.85} />
    <Rect x={11} y={1} width={1.6} height={6} rx=".8" fill="#C1626A" />
    </Svg>
  );
}
