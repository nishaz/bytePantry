import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Knife({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M15.2 2L17.8 2L16.8 10.5L16.2 10.5Z" fill="#D8DEE4" />
    <Rect x={15.9} y={10.5} width={1.4} height={1} fill="#8A9298" />
    <Rect x={16} y={11.5} width={1.2} height={3.5} rx=".6" fill="#8A5A3B" />
    </Svg>
  );
}
