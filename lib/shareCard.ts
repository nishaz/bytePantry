import type { RefObject } from 'react';
import { Platform, Share, type View } from 'react-native';

import type { Nutrition } from './nutrition';

/**
 * Share a recipe card as an image when the optional native modules are installed
 * (`npx expo install react-native-view-shot expo-sharing`), otherwise as text.
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
function optional(name: 'react-native-view-shot' | 'expo-sharing'): any {
  try {
    return name === 'react-native-view-shot' ? require('react-native-view-shot') : require('expo-sharing');
  } catch {
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

export function cardText(title: string, n: Nutrition, cooks: number): string {
  return [
    `🃏 ${title}, my Pixel Pantry recipe card (cooked ×${cooks})`,
    `${n.calories} kcal · ${n.protein}g protein · ${n.carbs}g carbs · ${n.fat}g fat · ${n.fiber}g fibre per serving${n.estimated ? ' (estimated)' : ''}`,
  ].join('\n');
}

export async function shareCard(ref: RefObject<View | null>, title: string, n: Nutrition, cooks: number): Promise<void> {
  const text = cardText(title, n, cooks);
  if (Platform.OS !== 'web') {
    const shot = optional('react-native-view-shot');
    const sharing = optional('expo-sharing');
    if (shot?.captureRef && sharing?.shareAsync && ref.current) {
      try {
        const uri: string = await shot.captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
        if (await sharing.isAvailableAsync()) {
          await sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `${title} card`, UTI: 'public.png' });
          return;
        }
      } catch {
        // fall through to text
      }
    }
  }
  try {
    await Share.share({ message: text, title: `${title} card` });
  } catch {
    // user closed the sheet
  }
}
