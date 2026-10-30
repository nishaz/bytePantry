import Svg, { Path } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function SteamPuff({ size = 24, width, height, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
      <Path
        d="M8 18c0-3 1.5-5 3-5s3 2 3 5"
        stroke="#EFE9D8"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      />
      <Path
        d="M12 16c0-2.5 1-4 2-4s2 1.5 2 4"
        stroke="#EFE9D8"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
    </Svg>
  );
}
