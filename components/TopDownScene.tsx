import type { ReactNode } from 'react';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { CookStepVisual } from './cook/CookStepVisual';
import {
  getSceneSurface,
  type SceneEquipment,
  type SceneSurface,
} from '../lib/stepSceneLayout';
import type { Action } from '../types/recipe';

interface TopDownSceneProps {
  equipment: SceneEquipment;
  ingredients: string[];
  action: Action;
  fullHeight?: boolean;
}

function CookEquipment({
  equipment,
  ingredients,
  action,
}: {
  equipment: SceneEquipment;
  ingredients: string[];
  action: Action;
}) {
  const [layout, setLayout] = useState({ width: 320, height: 360 });

  function onLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayout({ width, height });
    }
  }

  return (
    <View style={styles.equipmentWrap} onLayout={onLayout}>
      <CookStepVisual
        width={layout.width}
        height={layout.height}
        action={action}
        equipment={equipment}
        ingredients={ingredients}
      />
    </View>
  );
}

function StoveSurface({ children }: { children: ReactNode }) {
  return (
    <View style={styles.stoveArea}>
      <View style={styles.stoveTop}>
        <View style={styles.burnerRing}>
          <View style={styles.burnerCore} />
        </View>
        <View style={styles.burnerRing}>
          <View style={styles.burnerCore} />
        </View>
      </View>
      <View style={styles.stoveStage}>{children}</View>
    </View>
  );
}

function UnderCounterSurface({ children }: { children: ReactNode }) {
  return (
    <View style={styles.underCounterArea}>
      <View style={styles.counterBar}>
        <View style={styles.counterTop} />
        <View style={styles.counterFront} />
      </View>
      <View style={styles.floorArea}>{children}</View>
    </View>
  );
}

function SurfaceFrame({
  surface,
  children,
}: {
  surface: SceneSurface;
  children: ReactNode;
}) {
  if (surface === 'stove') {
    return <StoveSurface>{children}</StoveSurface>;
  }
  if (surface === 'under-counter') {
    return <UnderCounterSurface>{children}</UnderCounterSurface>;
  }
  return <View style={styles.counterSurface}>{children}</View>;
}

export function TopDownScene(props: TopDownSceneProps) {
  const { equipment, fullHeight = false } = props;
  const surface = getSceneSurface(equipment);
  /** BakeStoveScene draws its own stove; only pan-on-burner uses the chrome strip. */
  const frameSurface: SceneSurface =
    surface === 'stove' && equipment === 'stovetop' ? 'counter' : surface;

  return (
    <View style={[styles.counter, fullHeight && styles.counterFull]}>
      {frameSurface === 'counter'
        ? [0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.grain, { top: `${18 + i * 16}%` }]} />
          ))
        : null}

      <View style={styles.stage}>
        <SurfaceFrame surface={frameSurface}>
          <CookEquipment
            equipment={equipment}
            ingredients={props.ingredients}
            action={props.action}
          />
        </SurfaceFrame>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  burnerCore: {
    backgroundColor: '#2A2A32',
    borderRadius: 999,
    height: 18,
    width: 18,
  },
  burnerRing: {
    alignItems: 'center',
    borderColor: '#2A2A32',
    borderRadius: 999,
    borderWidth: 3,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  counter: {
    backgroundColor: '#8A6440',
    flex: 1,
    overflow: 'hidden',
  },
  counterBar: {
    width: '100%',
  },
  counterFront: {
    backgroundColor: '#6E4F32',
    height: 14,
    width: '100%',
  },
  counterFull: {
    backgroundColor: '#8A6440',
  },
  counterSurface: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  counterTop: {
    backgroundColor: '#D9A66A',
    height: 28,
    width: '100%',
  },
  equipmentWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  floorArea: {
    alignItems: 'center',
    backgroundColor: '#38443A',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  grain: {
    backgroundColor: '#6E4F32',
    height: 1,
    left: 0,
    opacity: 0.35,
    position: 'absolute',
    right: 0,
  },
  stage: {
    flex: 1,
    width: '100%',
  },
  stoveArea: {
    flex: 1,
    width: '100%',
  },
  stoveStage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  stoveTop: {
    backgroundColor: '#4A4A54',
    flexDirection: 'row',
    gap: 48,
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  underCounterArea: {
    flex: 1,
    width: '100%',
  },
});
