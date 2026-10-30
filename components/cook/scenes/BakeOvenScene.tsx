import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { getIngredientIcon } from '../../../lib/icons';
import { Oven } from '../../icons/Oven';
import { INGREDIENT_WELLS, sceneScale, VIEWBOX } from '../sceneLayout';
import { SceneCanvas } from '../SceneCanvas';

interface BakeOvenSceneProps {
  width: number;
  height: number;
  ingredients: string[];
}

export function BakeOvenScene({ width, height, ingredients }: BakeOvenSceneProps) {
  const scale = sceneScale(width, height);
  const sceneW = VIEWBOX * scale;
  const sceneH = VIEWBOX * scale;
  const visible = ingredients.slice(0, 4);
  const iconSize = Math.max(7, scale * 2);

  return (
    <SceneCanvas width={width} height={height}>
      <View style={{ width: sceneW, height: sceneH }}>
        <Oven width={sceneW} height={sceneH} style={StyleSheet.absoluteFill} />
        <View style={styles.window} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 24 24">
            <Rect x={6.5} y={13.5} width={11} height={4.8} rx={1} fill="#D9A66A" />
          </Svg>
          <View
            style={[
              styles.trayIcons,
              {
                left: INGREDIENT_WELLS.ovenTray.left,
                right: INGREDIENT_WELLS.ovenTray.right,
                top: INGREDIENT_WELLS.ovenTray.top,
              },
            ]}
          >
            {visible.map((label, index) => {
              const Icon = getIngredientIcon(label);
              return (
                <View
                  key={`${label}-${index}`}
                  style={{ marginLeft: index === 0 ? 0 : 2, width: iconSize, height: iconSize }}
                >
                  <Icon size={iconSize} />
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  trayIcons: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
  },
  window: {
    bottom: '16%',
    left: '18%',
    position: 'absolute',
    right: '18%',
    top: '46%',
  },
});
