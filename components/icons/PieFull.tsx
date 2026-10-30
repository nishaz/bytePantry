import Svg, { Circle, Rect } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function PieFull({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Circle cx={12} cy={12} r={9} fill="#D9A66A" />
    <Circle cx={12} cy={12} r={7} fill="#C1626A" />
    <Rect x={4} y={9.2} width={16} height={1.6} fill="#E9C58A" transform="rotate(-30 12 12)" />
    <Rect x={4} y={13.2} width={16} height={1.6} fill="#E9C58A" transform="rotate(-30 12 12)" />
    <Rect x={4} y={9.2} width={16} height={1.6} fill="#E9C58A" transform="rotate(30 12 12)" />
    <Rect x={4} y={13.2} width={16} height={1.6} fill="#E9C58A" transform="rotate(30 12 12)" />
    <Circle cx={12} cy={3} r={1.3} fill="#D9A66A" />
    <Circle cx={18} cy={5} r={1.3} fill="#D9A66A" />
    <Circle cx={21} cy={12} r={1.3} fill="#D9A66A" />
    <Circle cx={18} cy={19} r={1.3} fill="#D9A66A" />
    <Circle cx={12} cy={21} r={1.3} fill="#D9A66A" />
    <Circle cx={6} cy={19} r={1.3} fill="#D9A66A" />
    <Circle cx={3} cy={12} r={1.3} fill="#D9A66A" />
    <Circle cx={6} cy={5} r={1.3} fill="#D9A66A" />
    </Svg>
  );
}
