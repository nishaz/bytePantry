import { StyleSheet, View } from 'react-native';

import { FlatImage } from './FlatImage';
import { resolveFlatAssetKey } from '../lib/flatAssets';
import type { FridgeItem } from '../types/fridge';

interface FridgeItemIconProps {
  item: FridgeItem;
  size?: number;
  showDot?: boolean;
}

export function FridgeItemIcon({ item, size = 40 }: FridgeItemIconProps) {
  const assetKey = resolveFlatAssetKey(item.spriteName || item.name);

  return (
    <View style={styles.wrap}>
      <FlatImage assetKey={assetKey} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
