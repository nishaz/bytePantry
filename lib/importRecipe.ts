import { Platform } from 'react-native';

import {
  detectSource,
  instagramCaption,
  metaContent,
  normaliseUrl,
  parseFreeTextRecipe,
  parseJsonLdRecipe,
  youtubeDescription,
  type LinkSource,
} from './recipeParse';
import { parseServings } from './scaleIngredients';

export interface ImportedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  servings: number | null;
  source: LinkSource;
  sourceUrl: string;
  /** True when we found ingredients and steps; false means the user should fill gaps in. */
  complete: boolean;
}

export class ImportError extends Error {}

// A normal phone browser user agent: some sites serve an empty page to unknown clients.
const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

async function get(url: string, accept = 'text/html'): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { Accept: accept, 'User-Agent': UA, 'Accept-Language': 'en' },
      signal: controller.signal,
    });
    if (!res.ok) throw new ImportError(`That page answered with an error (${res.status}).`);
    return res;
  } catch (e) {
    if (e instanceof ImportError) throw e;
    if (Platform.OS === 'web') {
      throw new ImportError(
        "Browsers block reading other sites, so link import only works in the phone app. Paste the recipe text below instead.",
      );
    }
    throw new ImportError("Couldn't reach that link. Check your connection and that the link opens in a browser.");
  } finally {
    clearTimeout(timer);
  }
}

function finish(
  parsed: { title: string; ingredients: string[]; steps: string[] },
  servings: number | null,
  source: LinkSource,
  sourceUrl: string,
): ImportedRecipe {
  if (parsed.ingredients.length === 0 && parsed.steps.length === 0) {
    throw new ImportError(
      source === 'website'
        ? "This page doesn't have a recipe we can read. Try the recipe's own page, or paste the text below."
        : "The post's caption doesn't include the recipe. Many creators put it in a comment or on their website, so paste it below instead.",
    );
  }
  return {
    ...parsed,
    servings,
    source,
    sourceUrl,
    complete: parsed.ingredients.length > 0 && parsed.steps.length > 0,
  };
}

async function fromTikTok(url: string): Promise<ImportedRecipe> {
  // TikTok's public oEmbed endpoint returns the caption as `title`.
  const res = await get(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, 'application/json');
  const data = (await res.json()) as { title?: string; author_name?: string };
  const caption = data.title ?? '';
  const parsed = parseFreeTextRecipe(caption, data.author_name ? `Recipe from @${data.author_name}` : 'TikTok recipe');
  return finish(parsed, parseServings(caption), 'tiktok', url);
}

async function fromYouTube(url: string): Promise<ImportedRecipe> {
  const html = await (await get(url)).text();
  const description = youtubeDescription(html) ?? metaContent(html, 'og:description') ?? '';
  const title = (metaContent(html, 'og:title') ?? 'YouTube recipe').replace(/\s*-\s*YouTube$/i, '');
  const parsed = parseFreeTextRecipe(description, title);
  // Video titles are usually better names than the first line of a description.
  return finish({ ...parsed, title }, parseServings(description), 'youtube', url);
}

async function fromInstagram(url: string): Promise<ImportedRecipe> {
  const html = await (await get(url)).text();
  const caption = instagramCaption(html);
  if (!caption) {
    throw new ImportError(
      "Instagram didn't share this post's caption (it may be private or need a login). Paste the caption below instead.",
    );
  }
  const parsed = parseFreeTextRecipe(caption, 'Instagram recipe');
  return finish(parsed, parseServings(caption), 'instagram', url);
}

async function fromWebsite(url: string): Promise<ImportedRecipe> {
  const html = await (await get(url)).text();
  const structured = parseJsonLdRecipe(html);
  if (structured) {
    const yieldMatch = html.match(/"recipeYield"\s*:\s*(\[[^\]]*\]|"[^"]*"|\d+)/);
    let servings: number | null = null;
    if (yieldMatch) {
      try {
        servings = parseServings(JSON.parse(yieldMatch[1]));
      } catch {
        servings = parseServings(yieldMatch[1]);
      }
    }
    return finish(structured, servings, 'website', url);
  }
  // No structured data: fall back to the page description.
  const description = metaContent(html, 'og:description') ?? metaContent(html, 'description') ?? '';
  const title = metaContent(html, 'og:title') ?? 'Imported recipe';
  return finish(parseFreeTextRecipe(description, title), parseServings(description), 'website', url);
}

/** Read a recipe from a TikTok, Instagram, YouTube or recipe-website link. */
export async function importRecipeFromLink(input: string): Promise<ImportedRecipe> {
  const url = normaliseUrl(input);
  if (!url) throw new ImportError("That doesn't look like a link. Copy the share link and paste it here.");
  switch (detectSource(url)) {
    case 'tiktok':
      return fromTikTok(url);
    case 'youtube':
      return fromYouTube(url);
    case 'instagram':
      return fromInstagram(url);
    default:
      return fromWebsite(url);
  }
}
