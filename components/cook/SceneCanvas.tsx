import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { sceneScale, VIEWBOX } from './sceneLayout';

interface SceneCanvasProps {
  width: number;
  height: number;
  children: ReactNode;
}

/** Scales a 24×24 cook scene coordinate space to ~78% of the layout box. */
export function SceneCanvas({ width, height, children }: SceneCanvasProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;

  return (
    <View style={[styles.wrap, { width, height }]}>
      <View style={{ width: sceneW, height: sceneH }}>{children}</View>
    </View>
  );
}

export { sceneScale } from './sceneLayout';

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
