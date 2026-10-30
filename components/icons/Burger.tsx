import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Burger({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M4 9a8 5 0 0 1 16 0z" fill="#D9A66A" />
    <Rect x={3.5} y={9.5} width={17} height={1.6} fill="#EFE9D8" />
    <Rect x={3.5} y={11.3} width={17} height={2.4} rx={1} fill="#5E8C4A" />
    <Rect x={3.5} y={13.8} width={17} height={2.6} rx={1} fill="#8A5A3B" />
    <Rect x={3.5} y={16.5} width={17} height={1.6} fill="#C1626A" />
    <Path d="M3.2 18.5h17.6a1.5 1.5 0 0 1-1.5 1.8H4.7a1.5 1.5 0 0 1-1.5-1.8z" fill="#E9BE5C" />
    </Svg>
  );
}
