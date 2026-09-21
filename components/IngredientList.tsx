import { StyleSheet, Text, View } from 'react-native';

interface IngredientListProps {
  ingredients: string[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <Text style={styles.empty}>No ingredients listed.</Text>;
  }

  return (
    <View style={styles.container}>
      {ingredients.map((ingredient, index) => (
        <View key={`${ingredient}-${index}`} style={styles.row}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>{ingredient}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bullet: {
    color: '#ea580c',
    fontSize: 16,
    marginRight: 8,
  },
  container: {
    marginTop: 8,
  },
  empty: {
    color: '#78716c',
    fontStyle: 'italic',
    marginTop: 8,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 6,
  },
  text: {
    color: '#292524',
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
});
