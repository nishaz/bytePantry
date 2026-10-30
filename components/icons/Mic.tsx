import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Mic({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Rect x={9} y={3} width={6} height={11} rx={3} fill="#4A4A54" />
      <Path d="M6 11a6 6 0 0 0 12 0" stroke="#4A4A54" strokeWidth={2} fill="none" />
      <Rect x={11} y={17} width={2} height={4} fill="#4A4A54" />
    </Svg>
  );
}
