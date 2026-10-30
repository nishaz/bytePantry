import Svg, { Path, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Strawberry({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M12 8c5 0 7 5 5 10-1.3 3-7.7 3-9 0-2-5 0-10 4-10z" fill="#C1626A" />
    <Path d="M9 5l1.5 3M12 4l0 3.4M15 5l-1.5 3" stroke="#7FA46B" strokeWidth={1.6} strokeLinecap="round" />
    <Circle cx={10} cy={12} r=".5" fill="#F2DCC8" />
    <Circle cx={14} cy={12} r=".5" fill="#F2DCC8" />
    <Circle cx={12} cy={15} r=".5" fill="#F2DCC8" />
    <Circle cx={9} cy={16} r=".5" fill="#F2DCC8" />
    <Circle cx={15} cy={16} r=".5" fill="#F2DCC8" />
    </Svg>
  );
}
