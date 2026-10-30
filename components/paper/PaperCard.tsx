import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cutCorners, paper, type CutShape } from '../../lib/theme';

interface PaperCardProps {
  children?: ReactNode;
  color?: string;
  shape?: CutShape;
  /** Degrees of tilt; small values (±2) look hand-placed. */
  tilt?: number;
  /** Hard offset shadow distance in px (0 = none). */
  lift?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * A cut-paper card with a hard offset shadow.
 * The shadow is a sibling shape instead of a native shadow so it looks identical on iOS, Android and web.
 */
export function PaperCard({
  children,
  color = paper.card,
  shape = 'a',
  tilt = 0,
  lift = 4,
  style,
  contentStyle,
}: PaperCardProps) {
  const corners = cutCorners[shape];
  return (
    <View style={[styles.wrap, tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null, style]}>
      {lift > 0 ? (
        <View
          
          style={[{ pointerEvents: 'none' }, 
            StyleSheet.absoluteFill,
            corners,
            { backgroundColor: paper.shadow, transform: [{ translateX: lift }, { translateY: lift + 1 }] },
          ]}
        />
      ) : null}
      <View style={[styles.face, corners, { backgroundColor: color }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    overflow: 'hidden',
  },
  wrap: {
    position: 'relative',
  },
});
