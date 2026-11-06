import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { paper as p } from '../../lib/theme';

export type DishKind =
  | 'pasta'
  | 'soup'
  | 'salad'
  | 'omelette'
  | 'rice'
  | 'sandwich'
  | 'pie'
  | 'smoothie'
  | 'bowl'
  | 'curry'
  | 'stirfry'
  | 'pizza'
  | 'burger'
  | 'taco'
  | 'sushi'
  | 'ramen'
  | 'pancakes'
  | 'cookies'
  | 'cake'
  | 'oats'
  | 'roast'
  | 'steak'
  | 'dumplings'
  | 'loaf'
  | 'crepe'
  | 'rolls'
  | 'pudding'
  | 'muffin'
  | 'skewers'
  | 'wrap';

/** Order matters: the most specific dish wins ("pumpkin bread baked oats" is oats, not bread). */
export const RULES: [RegExp, DishKind][] = [
  // Jars and cups first: "chia pudding", "overnight oats", "yogurt parfait".
  [/chia|pudding|parfait|overnight oats|mousse|panna cotta|trifle|yogurt pot|posset/, 'pudding'],
  // A bread or loaf wins over "baked oats": "Pumpkin Bread Baked Oats" is baked in a loaf pan.
  [/\b(bread|loaf|focaccia|brioche)\b/, 'loaf'],
  [/baked oats|oatmeal|porridge|granola|\boats?\b/, 'oats'],
  [/cr[eê]pe|galette|blintz/, 'crepe'],
  [/pancake|waffle|hotcake|flapjack/, 'pancakes'],
  [/ramen|pho\b|udon|noodle soup|laksa/, 'ramen'],
  [/sushi|maki|onigiri|hand ?roll|temaki/, 'sushi'],
  [/dumpling|gyoza|wonton|dim sum|\bbao\b|momo|pierogi/, 'dumplings'],
  [/\brolls?\b|roll[- ]?ups?|rollatini|involtini|cannelloni|enchilada|spring roll|pinwheel/, 'rolls'],
  [/skewer|kebab|kabob|satay|souvlaki|yakitori/, 'skewers'],
  [/\bwraps?\b|burrito|shawarma|gyros?\b/, 'wrap'],
  [/pizza|flatbread|calzone/, 'pizza'],
  [/burger|slider/, 'burger'],
  [/taco|quesadilla|fajita|nacho/, 'taco'],
  [/stir[ -]?fry|lo mein|chow mein|pad thai|teriyaki|kung pao|fried noodle/, 'stirfry'],
  [/curry|masala|korma|vindaloo|tikka|dal\b|dahl/, 'curry'],
  [/fried rice|risotto|paella|biryani|congee/, 'rice'],
  [/omelet|frittata|scrambl|egg|shakshuka/, 'omelette'],
  [/steak|ribeye|sirloin|chop\b|pork chop|lamb chop/, 'steak'],
  [/roast|rotisserie|whole chicken|drumstick|wings|turkey/, 'roast'],
  [/pasta|spaghetti|noodle|penne|\bmac\b|lasagn|linguine|carbonara|gnocchi/, 'pasta'],
  [/soup|stew|broth|chowder|chili|bisque/, 'soup'],
  [/salad|slaw|bowl of greens/, 'salad'],
  [/rice|poke/, 'rice'],
  [/sandwich|toast|bagel|panini/, 'sandwich'],
  [/muffin|cupcake|scone/, 'muffin'],
  [/cookie|biscuit|brownie|blondie/, 'cookies'],
  [/cake|cheesecake/, 'cake'],
  [/\bbun\b|banana bread/, 'loaf'],
  [/pie|tart|crumble|cobbler|quiche|bake/, 'pie'],
  [/smoothie|shake|juice|latte|drink|lemonade|tea\b|coffee/, 'smoothie'],
];

export function dishKindFor(title: string): DishKind {
  const t = title.toLowerCase();
  for (const [re, kind] of RULES) {
    if (re.test(t)) return kind;
  }
  return 'bowl';
}

/** Accent colour that suits each dish, used for recipe card backgrounds. */
export function dishColor(kind: DishKind): string {
  switch (kind) {
    case 'pasta':
    case 'pie':
    case 'pancakes':
    case 'curry':
    case 'loaf':
    case 'crepe':
    case 'muffin':
      return p.yellow;
    case 'rolls':
    case 'skewers':
      return p.orange;
    case 'pudding':
      return p.purple;
    case 'wrap':
      return p.green;
    case 'soup':
    case 'smoothie':
    case 'pizza':
    case 'ramen':
      return p.red;
    case 'salad':
    case 'rice':
    case 'sushi':
    case 'taco':
      return p.green;
    case 'omelette':
    case 'roast':
    case 'cookies':
      return p.orange;
    case 'sandwich':
    case 'burger':
    case 'oats':
    case 'dumplings':
      return p.blue;
    default:
      return p.purple;
  }
}

function Bowl({ fill }: { fill: string }) {
  return (
    <>
      <Path d="M8 34h64c0 18-14 30-32 30S8 52 8 34z" fill={p.card} />
      <Path d="M14 48c8 4 44 4 52 0" stroke={fill} strokeWidth={3} fill="none" opacity={0.6} />
    </>
  );
}

function Body({ kind }: { kind: DishKind }) {
  switch (kind) {
    case 'pasta':
      return (
        <>
          <Path d="M12 34c4-14 52-16 56 0z" fill={p.yellow} />
          <Path d="M18 30c8-6 14 2 22-2s14 2 22-2M20 24c6-4 12 2 18-1s12 1 18-1" stroke={p.cream} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx="34" cy="26" r="5" fill={p.red} />
          <Circle cx="48" cy="28" r="4" fill={p.red} />
          <Path d="M40 20c2-3 6-3 6 0-3 2-5 2-6 0z" fill={p.green} />
          <Bowl fill={p.red} />
        </>
      );
    case 'soup':
      return (
        <>
          <Ellipse cx="40" cy="34" rx="30" ry="7" fill={p.red} />
          <Circle cx="30" cy="33" r="2.5" fill={p.cream} />
          <Circle cx="46" cy="35" r="2" fill={p.green} />
          <Path d="M30 22c-4-4 4-8 0-12M44 22c-4-4 4-8 0-12" stroke={p.card} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Bowl fill={p.orange} />
        </>
      );
    case 'salad':
      return (
        <>
          <Path d="M12 34c2-10 10-16 18-12 4-8 16-8 20 0 8-4 18 2 18 12z" fill={p.green} />
          <Circle cx="28" cy="28" r="5" fill={p.red} />
          <Circle cx="50" cy="27" r="4" fill={p.yellow} />
          <Path d="M36 22c4-4 8-2 8 2-4 2-6 1-8-2z" fill={p.greenDeep} />
          <Bowl fill={p.green} />
        </>
      );
    case 'omelette':
      return (
        <>
          <Ellipse cx="38" cy="42" rx="32" ry="20" fill={p.ink} />
          <Rect x="64" y="38" width="16" height="7" rx="3.5" fill={p.ink} transform="rotate(-15 64 40)" />
          <Ellipse cx="38" cy="40" rx="27" ry="15" fill={p.panIn} />
          <Path d="M17 40c2-10 14-13 23-11 12 2 18 6 18 11s-9 11-21 10c-11 0-22-3-20-10z" fill={p.cream} />
          <Circle cx="37" cy="39" r="7" fill={p.yellow} />
          <Path d="M24 34c3-2 5 0 4 2-1.5 2-4.5.5-4-2zM48 44c3-1.5 4.5 1 3 2.5-1.5 1.5-4 0-3-2.5z" fill={p.green} />
        </>
      );
    case 'rice':
      return (
        <>
          <Path d="M12 34c2-14 54-14 56 0z" fill={p.card} />
          <Circle cx="30" cy="27" r="1.5" fill={p.kraftDeep} />
          <Circle cx="44" cy="25" r="1.5" fill={p.kraftDeep} />
          <Path d="M46 30c4-6 12-6 14 0z" fill={p.orange} />
          <Path d="M22 30c2-5 8-5 10 0z" fill={p.green} />
          <Bowl fill={p.blue} />
        </>
      );
    case 'sandwich':
      return (
        <>
          <Path d="M12 50h56l-4 8H16z" fill={p.orange} />
          <Path d="M10 46c10-4 50-4 60 0l-2 4H12z" fill={p.green} />
          <Rect x="14" y="40" width="52" height="6" rx="2" fill={p.red} />
          <Rect x="12" y="35" width="56" height="6" rx="2" fill={p.yellow} />
          <Path d="M12 36c0-14 56-14 56 0z" fill={p.orange} />
          <Circle cx="30" cy="27" r="1.4" fill={p.cream} />
          <Circle cx="42" cy="25" r="1.4" fill={p.cream} />
          <Circle cx="52" cy="29" r="1.4" fill={p.cream} />
        </>
      );
    case 'pie':
      return (
        <>
          <Path d="M8 46h64l-6 12H14z" fill={p.brown} />
          <Path d="M10 46c4-18 56-18 60 0z" fill={p.orange} />
          <Path d="M20 40l10-8M34 40l10-10M48 40l10-8" stroke={p.yellow} strokeWidth={4} strokeLinecap="round" />
          <Path d="M8 46c6 3 10-3 16 0s10-3 16 0 10-3 16 0 10-3 16 0" stroke={p.cream} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      );
    case 'smoothie':
      return (
        <>
          <Path d="M24 18h32l-5 44H29z" fill={p.card} stroke={p.ink} strokeWidth={2} />
          <Path d="M26 30h28l-3 30H29z" fill={p.red} />
          <Path d="M44 18l6-14" stroke={p.yellow} strokeWidth={4} strokeLinecap="round" />
          <Circle cx="56" cy="20" r="6" fill={p.yellow} />
        </>
      );
    case 'curry':
      return (
        <>
          <Path d="M12 34c4-12 52-12 56 0z" fill={p.orange} />
          <Path d="M14 32c8-6 18-4 26-1 10-4 18-5 26 1" stroke={p.yellow} strokeWidth={3} fill="none" />
          <Circle cx="28" cy="28" r="3.5" fill={p.cream} />
          <Circle cx="46" cy="26" r="3" fill={p.redDeep} />
          <Path d="M36 22c3-4 8-3 8 0-3 2-6 2-8 0zM52 24c2-3 6-2 6 0-2 2-4 2-6 0z" fill={p.green} />
          <Bowl fill={p.yellow} />
        </>
      );
    case 'stirfry':
      return (
        <>
          <Path d="M6 36h68c-2 14-16 22-34 22S8 50 6 36z" fill={p.ink} />
          <Rect x="66" y="26" width="12" height="5" rx="2.5" fill={p.brown} transform="rotate(-20 66 28)" />
          <Path d="M12 36c4-10 52-12 56 0z" fill={p.panIn} />
          <Path d="M16 34c6-6 12 0 18-4s12 2 18-3 10 2 14 6" stroke={p.yellow} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Rect x="24" y="26" width="9" height="5" rx="1.5" fill={p.red} transform="rotate(-15 28 28)" />
          <Circle cx="42" cy="27" r="4" fill={p.green} />
          <Rect x="50" y="28" width="9" height="4" rx="1.5" fill={p.orange} transform="rotate(20 54 30)" />
        </>
      );
    case 'pizza':
      return (
        <>
          <Ellipse cx="40" cy="44" rx="34" ry="16" fill={p.brown} />
          <Ellipse cx="40" cy="43" rx="29" ry="12.5" fill={p.red} />
          <Path d="M18 42c6-6 14 2 22-4s16 2 22 2" stroke={p.cream} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
          <Circle cx="28" cy="46" r="4" fill={p.redDeep} />
          <Circle cx="50" cy="48" r="4" fill={p.redDeep} />
          <Circle cx="44" cy="38" r="3.5" fill={p.redDeep} />
          <Path d="M32 38c2-3 6-2 6 0-2 2-4 2-6 0zM56 42c2-3 6-2 6 0-2 2-4 2-6 0z" fill={p.green} />
        </>
      );
    case 'burger':
      return (
        <>
          <Path d="M16 52h48c0 6-4 8-8 8H24c-4 0-8-2-8-8z" fill={p.orange} />
          <Rect x="14" y="44" width="52" height="8" rx="4" fill={p.brown} />
          <Path d="M12 42h56l-4 4-6-3-6 3-6-3-6 3-6-3-6 3-6-3-6 3z" fill={p.yellow} />
          <Path d="M12 40c8 4 48 4 56 0l-2 3H14z" fill={p.green} />
          <Rect x="16" y="36" width="48" height="5" rx="2" fill={p.red} />
          <Path d="M14 36c0-16 52-16 52 0z" fill={p.orange} />
          <Ellipse cx="30" cy="26" rx="2" ry="1.2" fill={p.cream} />
          <Ellipse cx="42" cy="23" rx="2" ry="1.2" fill={p.cream} />
          <Ellipse cx="52" cy="28" rx="2" ry="1.2" fill={p.cream} />
        </>
      );
    case 'taco':
      return (
        <>
          <Path d="M10 56C10 30 70 30 70 56z" fill={p.yellow} />
          <Path d="M16 50c4-12 10-14 14-10 4-8 12-8 16-2 4-6 12-4 16 4" stroke={p.green} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Circle cx="30" cy="42" r="4" fill={p.red} />
          <Circle cx="48" cy="40" r="4" fill={p.red} />
          <Path d="M22 46h36" stroke={p.brown} strokeWidth={5} strokeLinecap="round" />
          <Path d="M14 56C14 38 66 38 66 56" stroke={p.amberText} strokeWidth={2} fill="none" opacity={0.5} />
        </>
      );
    case 'sushi':
      return (
        <>
          <Rect x="6" y="46" width="68" height="10" rx="3" fill={p.brown} />
          {[16, 40, 64].map((x) => (
            <G key={x}>
              <Ellipse cx={x} cy="40" rx="11" ry="10" fill={p.panIn} />
              <Ellipse cx={x} cy="38" rx="11" ry="7" fill={p.card} />
              <Circle cx={x} cy="38" r="4" fill={x === 40 ? p.green : p.orange} />
            </G>
          ))}
          <Path d="M20 14l44 14M22 10l44 14" stroke={p.ink} strokeWidth={2.5} strokeLinecap="round" />
        </>
      );
    case 'ramen':
      return (
        <>
          <Ellipse cx="40" cy="34" rx="30" ry="7" fill={p.yellow} />
          <Path d="M16 34c4-4 8 2 12-2s8 2 12-2 8 2 12-2 8 2 12 2" stroke={p.cream} strokeWidth={3} fill="none" />
          <Ellipse cx="30" cy="31" rx="6" ry="4" fill={p.card} />
          <Circle cx="30" cy="31" r="2.5" fill={p.orange} />
          <Rect x="40" y="28" width="12" height="5" rx="2" fill={p.redDeep} />
          <Path d="M54 30l6-4" stroke={p.green} strokeWidth={3} strokeLinecap="round" />
          <Path d="M48 4l-6 30M56 6l-10 28" stroke={p.brown} strokeWidth={2.5} strokeLinecap="round" />
          <Bowl fill={p.red} />
        </>
      );
    case 'pancakes':
      return (
        <>
          <Ellipse cx="40" cy="56" rx="34" ry="7" fill={p.card} />
          {[50, 42, 34, 26].map((y) => (
            <G key={y}>
              <Ellipse cx="40" cy={y + 2} rx="26" ry="6" fill={p.brown} />
              <Ellipse cx="40" cy={y} rx="26" ry="6" fill={p.yellow} />
            </G>
          ))}
          <Path d="M24 26c4 2 10 4 16 1 6 3 12 1 16-1 0 6-2 14-4 18-2-6-4-10-6-12-4 2-6 0-8 4-2-6-6-6-14-10z" fill={p.orange} opacity={0.9} />
          <Rect x="34" y="16" width="12" height="7" rx="1.5" fill={p.cream} />
        </>
      );
    case 'cookies':
      return (
        <>
          <Ellipse cx="40" cy="54" rx="34" ry="8" fill={p.card} />
          {[[24, 42], [52, 44], [38, 30]].map(([x, y]) => (
            <G key={x}>
              <Circle cx={x} cy={y} r="14" fill={p.brown} />
              <Circle cx={x} cy={y} r="11.5" fill="#D9A673" />
              <Circle cx={x - 4} cy={y - 3} r="2" fill={p.panIn} />
              <Circle cx={x + 4} cy={y + 1} r="2" fill={p.panIn} />
              <Circle cx={x - 1} cy={y + 5} r="1.6" fill={p.panIn} />
            </G>
          ))}
        </>
      );
    case 'cake':
      return (
        <>
          <Ellipse cx="40" cy="58" rx="34" ry="6" fill={p.steel} />
          <Rect x="14" y="30" width="52" height="26" rx="4" fill={p.brown} />
          <Rect x="14" y="40" width="52" height="5" fill={p.cream} />
          <Path d="M12 30c0-6 56-6 56 0v4c-4 4-8-2-12 2s-8-2-12 2-8-2-12 2-8-2-12 2-6-2-8-2z" fill={p.cream} />
          <Rect x="38" y="12" width="4" height="12" rx="1" fill={p.blue} />
          <Path d="M40 4c3 3 3 6 0 8-3-2-3-5 0-8z" fill={p.yellow} />
          <Circle cx="26" cy="27" r="3" fill={p.red} />
          <Circle cx="54" cy="27" r="3" fill={p.red} />
        </>
      );
    case 'oats':
      return (
        <>
          <Path d="M12 34c4-12 52-12 56 0z" fill="#E9D3A4" />
          {[[22, 30], [30, 27], [50, 28], [58, 31]].map(([x, y]) => (
            <Ellipse key={x} cx={x} cy={y} rx="3" ry="1.6" fill={p.card} />
          ))}
          <Circle cx="34" cy="26" r="4" fill={p.purple} />
          <Circle cx="42" cy="28" r="4" fill={p.red} />
          <Path d="M44 24c4-4 10-4 14 0-4 2-10 2-14 0z" fill={p.yellow} />
          <Path d="M24 26c4-6 10-6 10 0z" fill={p.orange} />
          <Bowl fill={p.blue} />
        </>
      );
    case 'roast':
      return (
        <>
          <Ellipse cx="40" cy="52" rx="36" ry="10" fill={p.card} />
          <Path d="M14 46c-2-14 10-24 26-24s28 10 26 24c-8 6-44 6-52 0z" fill={p.brown} />
          <Path d="M22 34c4-6 14-8 20-6" stroke={p.yellow} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
          <Path d="M62 36l10-6M64 40l10-2" stroke={p.cream} strokeWidth={5} strokeLinecap="round" />
          <Circle cx="16" cy="52" r="4" fill={p.orange} />
          <Circle cx="64" cy="52" r="4" fill={p.green} />
        </>
      );
    case 'steak':
      return (
        <>
          <Ellipse cx="40" cy="48" rx="36" ry="14" fill={p.card} />
          <Path d="M16 44c0-12 14-16 26-14 14 2 22 8 20 16-2 8-16 10-28 8s-18-4-18-10z" fill={p.redDeep} />
          <Path d="M20 44c0-8 10-11 20-10 12 1 18 6 17 11" stroke={p.cream} strokeWidth={2} fill="none" opacity={0.5} />
          <Path d="M24 38l8 12M34 36l8 12M44 36l8 12" stroke={p.ink} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
          <Path d="M62 46c4-4 8-2 8 2-4 2-6 1-8-2z" fill={p.green} />
        </>
      );
    case 'dumplings':
      return (
        <>
          <Ellipse cx="40" cy="52" rx="34" ry="10" fill={p.brown} />
          <Ellipse cx="40" cy="50" rx="30" ry="8" fill="#D9B27C" />
          {[[24, 42], [40, 38], [56, 42]].map(([x, y]) => (
            <G key={x}>
              <Path d={`M${x - 11} ${y + 6}c0-10 22-10 22 0z`} fill={p.cream} stroke={p.ink} strokeWidth={1.4} />
              <Path d={`M${x - 6} ${y}l2 -3 2 3 2 -3 2 3 2 -3`} stroke={p.kraftDeep} strokeWidth={1.4} fill="none" />
            </G>
          ))}
          <Path d="M30 22c-3-4 3-7 0-11M50 22c-3-4 3-7 0-11" stroke={p.card} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      );
    case 'loaf':
      return (
        <>
          <Rect x="8" y="50" width="64" height="8" rx="2" fill={p.brown} />
          <Path d="M14 50V34c0-14 52-14 52 0v16z" fill="#C88A4E" />
          <Path d="M14 34c0-14 52-14 52 0" stroke={p.brown} strokeWidth={3} fill="none" />
          <Path d="M26 28l6-6M38 26l6-6M50 28l6-6" stroke={p.cream} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case 'crepe':
      return (
        <>
          <Ellipse cx="40" cy="54" rx="34" ry="8" fill={p.card} />
          <Path d="M10 50C14 30 40 20 70 30 64 44 44 54 10 50z" fill="#F2D488" />
          <Path d="M10 50C22 40 44 34 70 30" stroke={p.brown} strokeWidth={2} fill="none" opacity={0.5} />
          <Path d="M18 46c10-4 24-8 40-12" stroke="#C99561" strokeWidth={1.4} fill="none" opacity={0.5} />
          <Circle cx="34" cy="30" r="5" fill={p.red} />
          <Circle cx="44" cy="27" r="4.5" fill="#4B5BA8" />
          <Circle cx="52" cy="30" r="4" fill={p.red} />
          <Path d="M28 34c6-2 20-6 30-6" stroke={p.cream} strokeWidth={4} strokeLinecap="round" />
          <Path d="M38 22c3-4 8-3 8 0-3 2-6 2-8 0z" fill={p.green} />
        </>
      );
    case 'rolls':
      return (
        <>
          <Rect x="6" y="28" width="68" height="30" rx="6" fill={p.card} stroke={p.ink} strokeWidth={1.6} />
          <Rect x="10" y="32" width="60" height="22" rx="4" fill={p.red} />
          {[20, 34, 48, 62].map((x) => (
            <G key={x}>
              <Ellipse cx={x} cy="40" rx="8" ry="9" fill={p.purple} />
              <Ellipse cx={x} cy="40" rx="5" ry="6" fill={p.cream} />
              <Path d={`M${x - 3} 40c2-3 4 3 6 0`} stroke={p.purple} strokeWidth={1.4} fill="none" />
            </G>
          ))}
          <Path d="M14 30c4-3 8 1 6 4M44 28c4-3 8 1 6 4" stroke={p.green} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx="30" cy="50" r="2" fill={p.cream} />
          <Circle cx="56" cy="51" r="2" fill={p.cream} />
        </>
      );
    case 'pudding':
      return (
        <>
          <Ellipse cx="40" cy="62" rx="22" ry="4" fill={p.shadow} />
          <Path d="M22 18h36v38a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z" fill={p.card} stroke={p.ink} strokeWidth={1.8} />
          <Path d="M24 44h32v12a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4z" fill="#E9E1D0" />
          {[[30, 50], [38, 54], [46, 49], [50, 56], [34, 57], [42, 46]].map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill={p.ink} />
          ))}
          <Rect x="24" y="34" width="32" height="10" fill={p.purple} opacity={0.75} />
          <Rect x="24" y="26" width="32" height="8" fill={p.cream} />
          <Circle cx="32" cy="22" r="4.5" fill="#4B5BA8" />
          <Circle cx="42" cy="21" r="4.5" fill={p.red} />
          <Path d="M46 20c3-5 9-4 9 0-3 2-6 2-9 0z" fill={p.green} />
          <Rect x="20" y="14" width="40" height="5" rx="2" fill={p.kraftDeep} />
        </>
      );
    case 'muffin':
      return (
        <>
          <Ellipse cx="40" cy="62" rx="26" ry="4" fill={p.shadow} />
          <Path d="M20 36h40l-5 24H25z" fill={p.red} />
          <Path d="M26 36l2 24M34 36l1 24M46 36l-1 24M54 36l-2 24" stroke={p.redDeep} strokeWidth={1.5} />
          <Path d="M16 38c-2-14 10-24 24-24s26 10 24 24c-6 3-42 3-48 0z" fill="#C88A4E" />
          <Circle cx="30" cy="26" r="2.5" fill={p.panIn} />
          <Circle cx="44" cy="22" r="2.5" fill={p.panIn} />
          <Circle cx="50" cy="31" r="2.5" fill={p.panIn} />
          <Circle cx="36" cy="33" r="2.5" fill={p.panIn} />
          <Path d="M26 20c4-4 10-5 14-4" stroke={p.cream} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.6} />
        </>
      );
    case 'skewers':
      return (
        <>
          <Ellipse cx="40" cy="56" rx="36" ry="9" fill={p.card} />
          {[0, 1].map((n) => {
            const y = 30 + n * 14;
            return (
              <G key={n}>
                <Path d={`M4 ${y + 4}L76 ${y - 4}`} stroke={p.brown} strokeWidth={2.5} strokeLinecap="round" />
                <Rect x="14" y={y - 5} width="10" height="10" rx="2" fill={p.brown} transform={`rotate(-6 19 ${y})`} />
                <Rect x="27" y={y - 6} width="9" height="10" rx="2" fill={p.red} transform={`rotate(-6 31 ${y})`} />
                <Rect x="39" y={y - 7} width="10" height="10" rx="2" fill="#B5575B" transform={`rotate(-6 44 ${y - 1})`} />
                <Rect x="52" y={y - 8} width="9" height="10" rx="2" fill={p.green} transform={`rotate(-6 56 ${y - 2})`} />
              </G>
            );
          })}
        </>
      );
    case 'wrap':
      return (
        <>
          <Ellipse cx="40" cy="58" rx="32" ry="7" fill={p.card} />
          <Path d="M14 54L30 18c8-6 20-6 30 0l6 36z" fill="#EAD39C" />
          <Path d="M30 18c8-6 20-6 30 0-8 6-22 6-30 0z" fill={p.green} />
          <Circle cx="38" cy="18" r="3.5" fill={p.red} />
          <Circle cx="50" cy="17" r="3" fill={p.yellow} />
          <Path d="M24 40c10 2 24 2 38 0M20 48c12 2 30 2 44 0" stroke={p.brown} strokeWidth={1.6} fill="none" opacity={0.5} />
          <Rect x="16" y="44" width="52" height="12" rx="3" fill={p.blue} opacity={0.85} transform="rotate(-4 42 50)" />
        </>
      );
    default:
      return (
        <>
          <Path d="M12 34c4-12 52-12 56 0z" fill={p.orange} />
          <Circle cx="32" cy="28" r="4" fill={p.green} />
          <Circle cx="46" cy="27" r="4" fill={p.red} />
          <Bowl fill={p.purple} />
        </>
      );
  }
}

/** Plated-dish illustration chosen from the recipe title. */
export function DishArt({ title, size = 80 }: { title: string; size?: number }) {
  const kind = dishKindFor(title);
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 -2 80 68">
      <G opacity={0.18} transform="translate(3 3)">
        <Ellipse cx="40" cy="52" rx="34" ry="12" fill={p.ink} />
      </G>
      <Body kind={kind} />
    </Svg>
  );
}
