import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function SauceBottle({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M10 2h4v3l2 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7l2-2z" fill="#C1626A" />
    <Rect x={9.5} y={12} width={5} height={7} fill="#A94A52" />
    <Rect x={9.5} y={1} width={5} height={1.6} rx=".5" fill="#4A3F35" />
    </Svg>
  );
}
