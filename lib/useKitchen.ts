import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { listRecipes } from './db';
import { listFridgeItems } from './fridgeDb';
import { getProfile, type Profile } from './profile';
import type { FridgeItem } from '../types/fridge';
import type { Recipe } from '../types/recipe';

/** Recipes, fridge and player profile, refreshed whenever the screen gains focus. */
export function useKitchen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [profile, setProfile] = useState<Profile>({ xp: 0, streak: 0, lastCookDay: null, recipesCooked: 0 });
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const [r, f, p] = await Promise.all([listRecipes(), listFridgeItems(), getProfile()]);
    setRecipes(r);
    setFridge(f);
    setProfile(p);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { recipes, fridge, profile, loaded, reload, setFridge };
}
