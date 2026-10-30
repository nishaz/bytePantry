import Svg, { Path, Circle } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function Rice({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
    <Path d="M6 10h12l-1.5 9a2 2 0 0 1-2 1.7H9.5a2 2 0 0 1-2-1.7z" fill="#EFE9D8" stroke="#C9BFA0" strokeWidth={1} />
    <Path d="M7 10l1-4h8l1 4" fill="#6C8EAD" />
    <Circle cx={10} cy={14} r=".6" fill="#C9BFA0" />
    <Circle cx={13} cy={15} r=".6" fill="#C9BFA0" />
    <Circle cx={11} cy={17} r=".6" fill="#C9BFA0" />
    </Svg>
  );
}
