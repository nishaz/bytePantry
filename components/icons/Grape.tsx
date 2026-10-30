import Svg, { Circle, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Grape({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Circle cx={9} cy={8} r={2.6} fill="#8B6FB0" />
    <Circle cx={13.5} cy={7} r={2.6} fill="#8B6FB0" />
    <Circle cx={7} cy={12} r={2.6} fill="#9A7EC0" />
    <Circle cx={11.5} cy={12} r={2.6} fill="#8B6FB0" />
    <Circle cx={16} cy={11.5} r={2.6} fill="#9A7EC0" />
    <Circle cx={9.5} cy={16.5} r={2.6} fill="#8B6FB0" />
    <Circle cx={14} cy={16} r={2.6} fill="#9A7EC0" />
    <Path d="M11 4c0-1.5 1-2.5 2-3" stroke="#7FA46B" strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
