export type StorageLocation = 'fridge' | 'cupboard';

export const INGREDIENT_CATEGORIES = ['Produce', 'Dairy', 'Protein', 'Grains', 'Sauces', 'Baking'] as const;
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export interface FridgeItem {
  id: string;
  spriteName: string;
  name: string;
  category: string;
  amount: string;
  /** Computed from `expiresOn` each time items are loaded. */
  daysUntilExpiry: number;
  expiresOn: string;
  location: StorageLocation;
  posX: number;
  posY: number;
}

export interface FridgeItemRow {
  id: string;
  spriteName: string;
  name: string;
  category: string;
  amount: string;
  daysUntilExpiry: number;
  expiresOn: string | null;
  location: string | null;
  posX: number;
  posY: number;
}

export type ExpiryStatus = 'fresh' | 'soon' | 'old';
