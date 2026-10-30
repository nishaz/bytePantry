import Svg, { Rect, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function CuttingBoardBase({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Rect x={2} y={7} width={20} height={12} rx={3} fill="#D9A66A" />
    <Rect x={2.5} y={7.5} width={19} height={11} rx={2.6} fill="none" stroke="#B9803F" strokeWidth={1} />
    <Path d="M5 10h4M5 13h6M5 16h3" stroke="#C98E53" strokeWidth={1} strokeLinecap="round" />
    </Svg>
  );
}
