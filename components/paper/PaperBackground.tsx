import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { paper } from '../../lib/theme';

/** Kraft paper fill with a subtle fibre/grain texture. */
export function PaperGrain({ color = paper.kraft }: { color?: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="grain" width="22" height="22" patternUnits="userSpaceOnUse">
          <Circle cx="3" cy="4" r="1" fill="rgba(90,60,30,0.10)" />
          <Circle cx="14" cy="9" r="0.9" fill="rgba(90,60,30,0.08)" />
          <Circle cx="8" cy="16" r="1.1" fill="rgba(255,255,255,0.35)" />
          <Circle cx="19" cy="19" r="0.8" fill="rgba(90,60,30,0.10)" />
          <Circle cx="11" cy="2" r="0.7" fill="rgba(255,255,255,0.3)" />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={color} />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grain)" />
    </Svg>
  );
}

export function PaperBackground({
  children,
  color,
  style,
}: {
  children?: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.root, style]}>
      <PaperGrain color={color} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: paper.kraft,
    flex: 1,
  },
});
