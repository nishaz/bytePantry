import Svg, { Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function PastaDry({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={4} y={3} width={1.4} height={17} rx=".7" fill="#F0CE6E" />
    <Rect x={7} y={3} width={1.4} height={17} rx=".7" fill="#F0CE6E" />
    <Rect x={10} y={3} width={1.4} height={17} rx=".7" fill="#F0CE6E" />
    <Rect x={13} y={3} width={1.4} height={17} rx=".7" fill="#F0CE6E" />
    <Rect x={16} y={3} width={1.4} height={17} rx=".7" fill="#F0CE6E" />
    <Rect x={19} y={3} width={1.4} height={17} rx=".7" fill="#F0CE6E" />
    <Rect x={3} y={14} width={18} height={3} rx={1} fill="#B98657" />
    </Svg>
  );
}
