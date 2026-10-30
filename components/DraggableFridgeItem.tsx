import { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { FridgeItemIcon } from './FridgeItemIcon';
import type { FridgeItem } from '../types/fridge';

interface DraggableFridgeItemProps {
  item: FridgeItem;
  areaWidth: number;
  areaHeight: number;
  onPress: () => void;
  onMove: (posX: number, posY: number) => void;
  onMoveEnd: (posX: number, posY: number) => void;
}

export function DraggableFridgeItem({
  item,
  areaWidth,
  areaHeight,
  onPress,
  onMove,
  onMoveEnd,
}: DraggableFridgeItemProps) {
  const start = useRef({ x: item.posX, y: item.posY });
  const latest = useRef({ x: item.posX, y: item.posY });
  const moved = useRef(false);
  const areaWidthRef = useRef(areaWidth);
  const areaHeightRef = useRef(areaHeight);
  areaWidthRef.current = areaWidth;
  areaHeightRef.current = areaHeight;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        moved.current = false;
        start.current = { x: item.posX, y: item.posY };
        latest.current = { x: item.posX, y: item.posY };
      },
      onPanResponderMove: (_, gesture) => {
        if (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4) {
          moved.current = true;
        }
        const width = areaWidthRef.current || 1;
        const height = areaHeightRef.current || 1;
        const nextX = start.current.x + (gesture.dx / width) * 100;
        const nextY = start.current.y + (gesture.dy / height) * 100;
        latest.current = {
          x: Math.max(2, Math.min(88, nextX)),
          y: Math.max(2, Math.min(88, nextY)),
        };
        onMove(latest.current.x, latest.current.y);
      },
      onPanResponderRelease: () => {
        if (!moved.current) {
          onPress();
          return;
        }
        onMoveEnd(latest.current.x, latest.current.y);
      },
    }),
  ).current;

  if (areaWidth === 0 || areaHeight === 0) {
    return null;
  }

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.item,
        {
          left: (item.posX / 100) * areaWidth,
          top: (item.posY / 100) * areaHeight,
        },
      ]}
    >
      <FridgeItemIcon item={item} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
