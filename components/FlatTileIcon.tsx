import { StyleSheet, View } from 'react-native';

import { FlatImage } from './FlatImage';
import { colors } from '../lib/theme';

type TileIconKind = 'mic' | 'link' | 'type';

export function FlatTileIcon({ kind }: { kind: TileIconKind }) {
  if (kind === 'type') {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.tileIconGold }]}>
        <FlatImage assetKey="bowl" size={28} />
      </View>
    );
  }

  const assetKey = kind === 'mic' ? 'mic' : 'link';

  return (
    <View style={styles.wrapPlain}>
      <FlatImage assetKey={assetKey} size={36} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  wrapPlain: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
