import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

import { flatRegistry, type FlatAssetKey } from '../lib/flatRegistry';
import { resolveFlatAssetKey } from '../lib/flatAssets';

interface FlatImageProps {
  assetKey?: FlatAssetKey;
  label?: string;
  fallback?: FlatAssetKey;
  /** @deprecated Pass assetKey or label instead */
  source?: FlatAssetKey;
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export function FlatImage({
  assetKey,
  label,
  fallback = 'bowl',
  source,
  size,
  width,
  height,
  style,
}: FlatImageProps) {
  const key =
    assetKey ?? source ?? (label !== undefined ? resolveFlatAssetKey(label, fallback) : fallback);
  const entry = flatRegistry[key];
  const w = width ?? size ?? 48;
  const h = height ?? size ?? 48;

  if (!entry) {
    return null;
  }

  const { Icon } = entry;
  return <Icon width={w} height={h} style={style} />;
}

const styles = StyleSheet.create({});
