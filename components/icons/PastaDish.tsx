import Svg, { Ellipse, Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function PastaDish({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Ellipse cx={12} cy={14} rx={10} ry={4} fill="#fff" stroke="#C9BFA0" strokeWidth={1} />
    <Path d="M6 15l1.5-1.2 1.5 1.2" stroke="#F0CE6E" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 13.5l1.5-1.2 1.5 1.2" stroke="#F0CE6E" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 13.5l1.5-1.2 1.5 1.2" stroke="#F0CE6E" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 15l-1.5-1.2-1.5 1.2" stroke="#F0CE6E" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Ellipse cx={12} cy={13} rx={6} ry={2} fill="#C1626A" opacity={.85} />
    </Svg>
  );
}
