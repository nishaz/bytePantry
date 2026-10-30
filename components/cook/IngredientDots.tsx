import { type DimensionValue, StyleSheet, View } from 'react-native';

import { getIngredientIcon } from '../../lib/icons';

const SPREAD = [
  { left: '12%', top: '8%' },
  { left: '42%', top: '4%' },
  { left: '68%', top: '10%' },
  { left: '28%', top: '38%' },
  { left: '58%', top: '42%' },
  { left: '40%', top: '58%' },
];

interface IngredientDotsProps {
  ingredients: string[];
  iconSize: number;
  max?: number;
  well?: {
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}

export function IngredientDots({ ingredients, iconSize, max = 4, well }: IngredientDotsProps) {
  const visible = ingredients.slice(0, max);

  return (
    <View
      style={[
        styles.well,
        well
          ? {
              left: well.left as DimensionValue,
              right: well.right as DimensionValue,
              top: well.top as DimensionValue,
              bottom: well.bottom as DimensionValue,
            }
          : styles.defaultWell,
      ]}
      pointerEvents="none"
    >
      {visible.map((label, index) => {
        const Icon = getIngredientIcon(label);
        const slot = SPREAD[index % SPREAD.length];
        return (
          <View
            key={`${label}-${index}`}
            style={[
              styles.dot,
              {
                left: slot.left as DimensionValue,
                top: slot.top as DimensionValue,
                width: iconSize,
                height: iconSize,
              },
            ]}
          >
            <Icon size={iconSize} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultWell: {
    ...StyleSheet.absoluteFill,
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
  },
  well: {
    position: 'absolute',
  },
});
