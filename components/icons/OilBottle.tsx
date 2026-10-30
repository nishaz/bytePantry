import Svg, { Path, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function OilBottle({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M9 3h6v4l2 3v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10l2-3z" fill="#F0CE6E" opacity={.9} />
    <Rect x={8.5} y={2} width={7} height={2} rx=".6" fill="#B98657" />
    <Rect x={8} y={12} width={8} height={7} fill="#E9BE5C" opacity={.6} />
    </Svg>
  );
}
