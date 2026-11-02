import type { ReactNode } from 'react';
import { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { paper } from '../../lib/theme';

/**
 * Second batch of paper ingredients: more vegetables, fruit, dairy, proteins and pantry staples.
 * Same rules as IngredientArt: 48×48 grid, colours from the `paper` palette (a few fixed accents).
 */
type P = typeof paper;
type Draw = (p: P) => ReactNode;

const PINK = '#E8A8B8';
const PLUM = '#7A3B5C';

/** Fixed accent colours collapse to ink when drawing the silhouette shadow. */
const t = (p: P, hex: string): string => ((p.card as string) === p.ink ? p.ink : hex);

export const MORE_ART: Record<string, Draw> = {
  /* ---------- vegetables ---------- */
  pumpkin: (p) => (
    <>
      <Ellipse cx="15" cy="28" rx="10" ry="14" fill={p.orange} />
      <Ellipse cx="33" cy="28" rx="10" ry="14" fill={p.orange} />
      <Ellipse cx="24" cy="28" rx="11" ry="15" fill={p.orange} />
      <Path d="M24 14v28M15 16c-3 8-3 16 0 24M33 16c3 8 3 16 0 24" stroke={p.redDeep} strokeWidth={1.5} fill="none" opacity={0.35} />
      <Rect x="22" y="7" width="4" height="9" rx="2" fill={p.brown} />
      <Path d="M26 10c4-4 9-3 10 0-4 2-7 2-10 0z" fill={p.green} />
    </>
  ),
  butternut_squash: (p) => (
    <>
      <Path d="M20 8c6 0 8 4 8 10 0 4 8 6 8 15 0 7-5 11-12 11s-12-4-12-11c0-9 8-11 8-15 0-6 0-10 0-10z" fill={t(p, '#E9B872')} />
      <Ellipse cx="24" cy="34" rx="7" ry="5" fill={p.orange} opacity={0.5} />
      <Rect x="18" y="4" width="4" height="7" rx="2" fill={p.brown} />
    </>
  ),
  sweet_potato: (p) => (
    <>
      <Path d="M6 28c2-10 14-16 24-14s14 8 12 14-12 10-22 10S4 36 6 28z" fill={t(p, '#B5576B')} />
      <Path d="M14 24c4-2 8-2 12 0M20 32c4-1 8-1 12 0" stroke={p.card} strokeWidth={1.6} fill="none" opacity={0.4} strokeLinecap="round" />
      <Path d="M42 24l4-2M4 32l-2 2" stroke={t(p, '#B5576B')} strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  zucchini: (p) => (
    <>
      <Rect x="4" y="19" width="38" height="12" rx="6" fill={p.greenDeep} transform="rotate(-25 24 24)" />
      <Path d="M12 30l22-12" stroke={p.green} strokeWidth={2.5} strokeLinecap="round" />
      <Rect x="38" y="8" width="6" height="7" rx="2" fill={p.brown} transform="rotate(-25 41 11)" />
    </>
  ),
  eggplant: (p) => (
    <>
      <Path d="M30 14c8 2 12 10 8 20s-14 12-22 8S6 30 12 24c6-4 10-12 18-10z" fill={p.purple} />
      <Path d="M28 10c2 2 6 4 10 4-2 4-6 6-10 4-2 2-6 2-8 0 4-2 6-4 8-8z" fill={p.green} />
      <Ellipse cx="18" cy="30" rx="3" ry="6" fill={p.card} opacity={0.35} transform="rotate(30 18 30)" />
    </>
  ),
  cauliflower: (p) => (
    <>
      <Path d="M8 28c-2-10 8-12 8-12s8-4 8-4 8 0 8 4 10 2 8 12z" fill={p.green} />
      <Circle cx="16" cy="22" r="7" fill={p.cream} />
      <Circle cx="24" cy="18" r="8" fill={p.cream} />
      <Circle cx="32" cy="22" r="7" fill={p.cream} />
      <Circle cx="24" cy="26" r="7" fill={p.cream} />
      <Path d="M8 28c4 10 10 14 16 14s12-4 16-14c-6 4-10 4-16 4s-10 0-16-4z" fill={p.greenDeep} />
    </>
  ),
  cabbage: (p) => (
    <>
      <Circle cx="24" cy="26" r="17" fill={t(p, '#9CC98A')} />
      <Path d="M24 10c-6 6-6 26 0 32M14 16c4 8 4 18 0 24M34 16c-4 8-4 18 0 24" stroke={p.green} strokeWidth={2} fill="none" />
      <Path d="M8 26c4-6 10-6 16-2 6-4 12-4 16 2" stroke={p.card} strokeWidth={2} fill="none" opacity={0.5} />
    </>
  ),
  lettuce: (p) => (
    <>
      <Path d="M24 42c-14 0-18-10-14-20 2 2 4 2 6 0 0-6 4-10 8-10s8 4 8 10c2 2 4 2 6 0 4 10 0 20-14 20z" fill={p.green} />
      <Path d="M24 42c-6-6-8-14-6-24M24 42c6-6 8-14 6-24" stroke={t(p, '#9CC98A')} strokeWidth={2.5} fill="none" />
    </>
  ),
  peas: (p) => (
    <>
      <Path d="M4 30c8-14 28-20 40-14-6 14-26 22-40 14z" fill={p.greenDeep} />
      <Path d="M8 28c8-10 26-14 34-10-6 10-24 16-34 10z" fill={t(p, '#9CC98A')} />
      <Circle cx="16" cy="27" r="4" fill={p.green} />
      <Circle cx="24" cy="24" r="4" fill={p.green} />
      <Circle cx="32" cy="21" r="4" fill={p.green} />
    </>
  ),
  green_beans: (p) => (
    <>
      <Path d="M8 40C14 30 20 16 36 8" stroke={p.green} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M14 42C20 32 28 20 42 14" stroke={p.greenDeep} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M6 34C12 24 18 12 30 6" stroke={t(p, '#9CC98A')} strokeWidth={5} strokeLinecap="round" fill="none" />
    </>
  ),
  asparagus: (p) => (
    <>
      <Path d="M14 44L22 8M22 44L26 6M30 44L32 8" stroke={p.green} strokeWidth={5} strokeLinecap="round" />
      <Path d="M20 10l2-6 4 6zM24 8l2-6 4 6zM29 10l3-6 3 6z" fill={t(p, PLUM)} />
      <Rect x="12" y="30" width="24" height="5" rx="2" fill={p.red} />
    </>
  ),
  celery: (p) => (
    <>
      <Path d="M14 44l4-28M22 44l2-30M30 44l-2-28" stroke={t(p, '#9CC98A')} strokeWidth={6} strokeLinecap="round" />
      <Path d="M12 16c0-6 4-10 8-8 2-4 8-4 10 0 4-2 8 2 6 8z" fill={p.green} />
    </>
  ),
  beetroot: (p) => (
    <>
      <Circle cx="24" cy="28" r="14" fill={t(p, PLUM)} />
      <Path d="M24 42l2 5" stroke={t(p, PLUM)} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M20 14c-6-8-2-12 2-10 0 4 0 6-2 10zM26 14c4-8 10-8 10-4-4 2-6 4-10 4z" fill={p.green} />
      <Ellipse cx="18" cy="26" rx="3" ry="5" fill={t(p, PINK)} opacity={0.5} />
    </>
  ),
  radish: (p) => (
    <>
      <Circle cx="24" cy="28" r="12" fill={t(p, '#D9405A')} />
      <Path d="M24 40l1 6" stroke={p.card} strokeWidth={2} strokeLinecap="round" />
      <Path d="M22 16c-6-8-2-12 2-10 0 4 0 6-2 10zM26 16c4-8 10-8 10-4-4 2-6 4-10 4z" fill={p.green} />
      <Path d="M16 34c4 4 12 4 16 0" stroke={p.card} strokeWidth={2} fill="none" opacity={0.6} />
    </>
  ),
  spring_onion: (p) => (
    <>
      <Path d="M18 40V10M24 40V6M30 40V12" stroke={p.green} strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx="24" cy="40" rx="10" ry="5" fill={p.cream} stroke={p.ink} strokeWidth={1.2} />
      <Path d="M20 44l-1 3M24 44v3M28 44l1 3" stroke={p.inkSoft} strokeWidth={1.2} />
    </>
  ),
  leek: (p) => (
    <>
      <Rect x="18" y="20" width="12" height="24" rx="5" fill={p.cream} stroke={p.ink} strokeWidth={1.2} />
      <Path d="M18 22c-6-8-6-16-2-18 2 6 4 10 6 18zM30 22c6-8 6-16 2-18-2 6-4 10-6 18zM24 20V4" stroke={p.greenDeep} strokeWidth={3} fill={p.green} />
      <Rect x="18" y="20" width="12" height="6" fill={p.green} opacity={0.6} />
    </>
  ),
  ginger: (p) => (
    <>
      <Path d="M8 30c0-6 6-8 10-6 2-6 8-8 12-4 4-4 10-2 10 4 4 2 4 8 0 10-4 4-10 2-12 0-4 4-12 4-14 0-4 2-8 0-6-4z" fill={t(p, '#D9B27C')} />
      <Path d="M16 30c2-2 4-2 6 0M28 28c2-2 4-2 6 0" stroke={p.brown} strokeWidth={1.6} fill="none" />
    </>
  ),
  olive: (p) => (
    <>
      <Ellipse cx="18" cy="28" rx="9" ry="11" fill={t(p, '#6B7A2E')} />
      <Ellipse cx="32" cy="26" rx="9" ry="11" fill={p.panIn} />
      <Circle cx="18" cy="28" r="3" fill={p.red} />
      <Ellipse cx="29" cy="22" rx="2.5" ry="3.5" fill={p.card} opacity={0.4} />
      <Path d="M24 14c2-6 8-8 12-6-4 4-8 6-12 6z" fill={p.green} />
    </>
  ),
  pickle: (p) => (
    <>
      <Rect x="14" y="6" width="20" height="38" rx="10" fill={t(p, '#6B7A2E')} />
      <Circle cx="20" cy="14" r="1.5" fill={p.cream} />
      <Circle cx="28" cy="22" r="1.5" fill={p.cream} />
      <Circle cx="20" cy="30" r="1.5" fill={p.cream} />
      <Circle cx="27" cy="37" r="1.5" fill={p.cream} />
    </>
  ),

  /* ---------- fruit ---------- */
  orange: (p) => (
    <>
      <Circle cx="24" cy="27" r="16" fill={p.orange} />
      <Circle cx="18" cy="22" r="1" fill={p.redDeep} opacity={0.4} />
      <Circle cx="28" cy="30" r="1" fill={p.redDeep} opacity={0.4} />
      <Ellipse cx="17" cy="24" rx="3" ry="5" fill={p.card} opacity={0.4} />
      <Path d="M24 11c4-4 9-3 10 0-4 2-7 2-10 0z" fill={p.green} />
    </>
  ),
  grapes: (p) => (
    <>
      {[[18, 16], [30, 16], [24, 22], [14, 26], [34, 26], [20, 32], [28, 32], [24, 40]].map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill={p.purple} />
      ))}
      <Path d="M24 10V4M24 8c4-4 10-4 12 0-4 2-8 2-12 0z" stroke={p.brown} strokeWidth={2} fill={p.green} />
    </>
  ),
  pineapple: (p) => (
    <>
      <Ellipse cx="24" cy="32" rx="12" ry="14" fill={p.yellow} />
      <Path d="M14 24l20 16M14 32l14 12M18 20l18 14M34 24L14 40M34 32L20 44M30 20L12 34" stroke={p.orange} strokeWidth={1.4} opacity={0.6} />
      <Path d="M24 18l-6-14 6 6 0-8 4 8 6-6-4 14z" fill={p.green} />
    </>
  ),
  mango: (p) => (
    <>
      <Path d="M12 30c-2-12 8-22 20-20 8 2 10 12 6 20-4 10-14 14-20 10-4-2-6-6-6-10z" fill={p.yellow} />
      <Path d="M30 12c4 4 8 10 8 18" stroke={p.red} strokeWidth={8} opacity={0.5} fill="none" strokeLinecap="round" />
      <Path d="M30 10c2-4 6-6 10-4-2 4-6 6-10 4z" fill={p.green} />
    </>
  ),
  peach: (p) => (
    <>
      <Circle cx="24" cy="28" r="15" fill={t(p, '#F2A07B')} />
      <Path d="M24 14c-4 8-4 20 0 28" stroke={p.orange} strokeWidth={2} fill="none" opacity={0.6} />
      <Ellipse cx="17" cy="26" rx="4" ry="6" fill={t(p, PINK)} opacity={0.6} />
      <Path d="M24 14c2-6 8-8 12-6-2 4-6 6-12 6z" fill={p.green} />
    </>
  ),
  pear: (p) => (
    <>
      <Path d="M24 10c5 0 6 6 6 10 0 4 8 6 8 14 0 7-6 10-14 10s-14-3-14-10c0-8 8-10 8-14 0-4 1-10 6-10z" fill={t(p, '#B9C94F')} />
      <Path d="M24 10V4" stroke={p.brown} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M25 6c4-2 8 0 8 2-4 2-6 1-8-2z" fill={p.green} />
      <Ellipse cx="18" cy="32" rx="3" ry="5" fill={p.card} opacity={0.45} />
    </>
  ),
  cherry: (p) => (
    <>
      <Path d="M16 30C18 18 24 10 32 6M32 32c0-10-2-20 0-26" stroke={p.greenDeep} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Circle cx="15" cy="34" r="9" fill={t(p, '#C0283C')} />
      <Circle cx="33" cy="36" r="9" fill={t(p, '#C0283C')} />
      <Ellipse cx="12" cy="31" rx="2" ry="3" fill={p.card} opacity={0.5} />
      <Ellipse cx="30" cy="33" rx="2" ry="3" fill={p.card} opacity={0.5} />
      <Path d="M32 6c4-2 10 0 10 4-4 2-8 0-10-4z" fill={p.green} />
    </>
  ),
  blueberry: (p) => (
    <>
      {[[16, 28], [30, 26], [22, 36], [34, 38], [24, 18]].map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill={t(p, '#4B5BA8')} />
      ))}
      {[[16, 25], [30, 23], [22, 33], [34, 35], [24, 15]].map(([x, y]) => (
        <Path key={`c${x}-${y}`} d={`M${x - 2} ${y}l2 -2 2 2`} stroke={p.ink} strokeWidth={1.4} fill="none" />
      ))}
    </>
  ),
  raspberry: (p) => (
    <>
      {[[18, 20], [24, 18], [30, 20], [16, 27], [22, 26], [28, 26], [33, 28], [19, 33], [25, 33], [31, 34], [24, 39]].map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill={t(p, '#D9405A')} />
      ))}
      <Path d="M18 14l6-6 6 6-6 2z" fill={p.green} />
    </>
  ),
  watermelon: (p) => (
    <>
      <Path d="M4 18h40c0 14-9 24-20 24S4 32 4 18z" fill={p.greenDeep} />
      <Path d="M8 18h32c0 11-7 20-16 20S8 29 8 18z" fill={t(p, '#E5536A')} />
      <Path d="M8 18h32" stroke={p.card} strokeWidth={2} />
      {[[16, 24], [24, 28], [32, 24], [20, 32], [28, 32]].map(([x, y]) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.4" ry="2.2" fill={p.ink} />
      ))}
    </>
  ),
  kiwi: (p) => (
    <>
      <Circle cx="24" cy="25" r="17" fill={p.brown} />
      <Circle cx="24" cy="25" r="14" fill={t(p, '#8DBF3E')} />
      <Circle cx="24" cy="25" r="5" fill={p.cream} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <Circle key={i} cx={24 + Math.cos(a) * 8.5} cy={25 + Math.sin(a) * 8.5} r="1.1" fill={p.ink} />;
      })}
    </>
  ),
  coconut: (p) => (
    <>
      <Circle cx="24" cy="26" r="17" fill={p.brown} />
      <Path d="M10 22h28c0 10-6 18-14 18s-14-8-14-18z" fill={p.card} />
      <Path d="M10 22h28" stroke={p.panIn} strokeWidth={3} />
      <Circle cx="20" cy="14" r="2" fill={p.panIn} />
      <Circle cx="27" cy="13" r="2" fill={p.panIn} />
    </>
  ),
  pomegranate: (p) => (
    <>
      <Circle cx="24" cy="28" r="16" fill={t(p, '#B8323F')} />
      <Path d="M18 12l2 4h8l2-4-4 2-2-4-2 4z" fill={t(p, '#8E2430')} />
      <Ellipse cx="17" cy="25" rx="3" ry="5" fill={p.card} opacity={0.4} />
    </>
  ),

  /* ---------- dairy ---------- */
  cream: (p) => (
    <>
      <Path d="M16 12h16v6l4 6v18a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V24l4-6z" fill={p.card} stroke={p.ink} strokeWidth={1.8} />
      <Rect x="15" y="8" width="18" height="6" rx="2" fill={p.yellow} />
      <Rect x="12" y="28" width="24" height="9" fill={p.yellow} opacity={0.8} />
    </>
  ),
  cream_cheese: (p) => (
    <>
      <Path d="M8 22h32v14a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill={p.card} stroke={p.ink} strokeWidth={1.8} />
      <Ellipse cx="24" cy="22" rx="16" ry="6" fill={p.blue} />
      <Path d="M14 22c4-4 16-4 20 0" stroke={p.card} strokeWidth={2} fill="none" />
      <Rect x="14" y="30" width="20" height="5" rx="2" fill={p.blue} opacity={0.6} />
    </>
  ),
  mozzarella: (p) => (
    <>
      <Circle cx="24" cy="27" r="15" fill={p.card} stroke={p.ink} strokeWidth={1.6} />
      <Path d="M24 12c-2 2-2 4 0 6 2-2 2-4 0-6z" fill={p.card} stroke={p.ink} strokeWidth={1.4} />
      <Ellipse cx="18" cy="23" rx="4" ry="6" fill={t(p, '#FFFFFF')} />
      <Path d="M30 8c4-2 10 0 10 4-4 2-8 0-10-4z" fill={p.green} />
    </>
  ),
  parmesan: (p) => (
    <>
      <Path d="M6 36L30 10l12 6v20z" fill={t(p, '#F2D488')} />
      <Path d="M6 36h36v6H6z" fill={p.yellow} />
      <Path d="M30 10l12 6" stroke={p.brown} strokeWidth={3} />
      <Circle cx="24" cy="28" r="1.4" fill={p.brown} opacity={0.5} />
      <Circle cx="32" cy="24" r="1.4" fill={p.brown} opacity={0.5} />
    </>
  ),
  feta: (p) => (
    <>
      <Path d="M8 18l8-6h24v22l-8 6H8z" fill={p.card} stroke={p.ink} strokeWidth={1.6} />
      <Path d="M8 18h24v22M32 18l8-6" stroke={p.ink} strokeWidth={1.6} fill="none" />
      <Circle cx="16" cy="28" r="1.4" fill={p.kraftDeep} />
      <Circle cx="24" cy="32" r="1.4" fill={p.kraftDeep} />
      <Circle cx="22" cy="24" r="1.4" fill={p.kraftDeep} />
    </>
  ),
  ice_cream: (p) => (
    <>
      <Path d="M14 22l10 24 10-24z" fill={t(p, '#D9A673')} />
      <Path d="M16 26l14 4M18 32l10 3" stroke={p.brown} strokeWidth={1.4} />
      <Circle cx="18" cy="18" r="8" fill={t(p, PINK)} />
      <Circle cx="30" cy="18" r="8" fill={p.cream} />
      <Circle cx="24" cy="11" r="7" fill={p.panIn} />
      <Circle cx="25" cy="5" r="2.5" fill={p.red} />
    </>
  ),

  /* ---------- protein ---------- */
  tofu: (p) => (
    <>
      <Path d="M8 20l8-8h24v20l-8 8H8z" fill={p.cream} stroke={p.ink} strokeWidth={1.6} />
      <Path d="M8 20h24v20M32 20l8-8" stroke={p.ink} strokeWidth={1.6} fill="none" />
      <Path d="M8 30h24M20 20v20" stroke={p.kraftDeep} strokeWidth={1.4} />
    </>
  ),
  shrimp: (p) => (
    <>
      <Path d="M36 12c-12-4-26 4-26 18 0 6 4 10 10 10 4 0 6-2 6-6s-4-4-6-2c0-6 6-10 14-10 4 0 6-2 6-4s-2-4-4-6z" fill={t(p, '#F28C6B')} />
      <Path d="M20 14c2 6 2 12 0 18M28 12c2 4 2 8 0 12" stroke={p.card} strokeWidth={1.8} fill="none" opacity={0.6} />
      <Path d="M18 36l-6 6 8-2z" fill={t(p, '#F28C6B')} />
      <Circle cx="34" cy="14" r="1.5" fill={p.ink} />
    </>
  ),
  bacon: (p) => (
    <>
      <Path d="M6 16c6-6 12 6 18 0s12 6 18 0v8c-6 6-12-6-18 0s-12-6-18 0z" fill={t(p, '#D9646B')} />
      <Path d="M6 26c6-6 12 6 18 0s12 6 18 0v8c-6 6-12-6-18 0s-12-6-18 0z" fill={t(p, '#D9646B')} />
      <Path d="M6 20c6-6 12 6 18 0s12 6 18 0M6 30c6-6 12 6 18 0s12 6 18 0" stroke={p.cream} strokeWidth={2.4} fill="none" />
    </>
  ),
  sausage: (p) => (
    <>
      <Path d="M8 30c4-12 16-18 30-14 4 2 4 6 0 8-10-2-18 2-22 10-2 4-8 2-8-4z" fill={t(p, '#B5575B')} />
      <Path d="M14 30c4-8 12-12 20-10" stroke={t(p, PINK)} strokeWidth={2} fill="none" opacity={0.6} strokeLinecap="round" />
      <Circle cx="9" cy="35" r="2" fill={t(p, '#8E3F43')} />
    </>
  ),
  beans: (p) => (
    <>
      <Rect x="12" y="8" width="24" height="34" rx="3" fill={p.steel} />
      <Rect x="12" y="16" width="24" height="18" fill={p.red} />
      {[[19, 23], [27, 23], [23, 28]].map(([x, y]) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.5" ry="2.5" fill={p.card} />
      ))}
      <Path d="M12 11h24M12 39h24" stroke={p.inkSoft} strokeWidth={1.2} />
    </>
  ),
  chickpeas: (p) => (
    <>
      {[[16, 30], [26, 32], [34, 26], [20, 20], [30, 18], [14, 38], [28, 40]].map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill={t(p, '#E9C98E')} />
      ))}
      {[[17, 28], [27, 30], [35, 24], [21, 18], [31, 16]].map(([x, y]) => (
        <Path key={`n${x}`} d={`M${x - 2} ${y}q2 -2 4 0`} stroke={p.brown} strokeWidth={1.2} fill="none" />
      ))}
    </>
  ),
  lentils: (p) => (
    <>
      <Path d="M8 24h32c0 10-7 18-16 18S8 34 8 24z" fill={p.card} stroke={p.ink} strokeWidth={1.6} />
      <Ellipse cx="24" cy="24" rx="16" ry="5" fill={p.orange} />
      {[[16, 23], [22, 25], [28, 22], [32, 25], [19, 21], [26, 26]].map(([x, y]) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2" ry="1.3" fill={p.redDeep} opacity={0.6} />
      ))}
    </>
  ),
  nuts: (p) => (
    <>
      <Path d="M16 10c6 0 10 8 10 16s-4 14-10 14-10-6-10-14 4-16 10-16z" fill={p.brown} />
      <Path d="M32 14c6 0 10 8 10 16s-4 12-10 12-10-4-10-12 4-16 10-16z" fill={t(p, '#C99561')} />
      <Path d="M16 14c-2 6-2 16 0 22M32 18c-2 6-2 14 0 20" stroke={p.panIn} strokeWidth={1.4} fill="none" opacity={0.5} />
    </>
  ),
  peanut_butter: (p) => (
    <>
      <Rect x="12" y="8" width="24" height="8" rx="2" fill={p.red} />
      <Path d="M10 16h28v22a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill={t(p, '#C88A4E')} />
      <Rect x="14" y="24" width="20" height="12" rx="2" fill={p.card} />
      <Path d="M20 30c0-4 8-4 8 0s-8 4-8 0z" fill={t(p, '#C88A4E')} />
    </>
  ),

  /* ---------- pantry ---------- */
  oats: (p) => (
    <>
      <Path d="M8 22h32c0 12-7 20-16 20S8 34 8 22z" fill={p.blue} />
      <Ellipse cx="24" cy="22" rx="16" ry="5" fill={t(p, '#E9D3A4')} />
      {[[16, 21], [22, 23], [28, 20], [33, 22], [19, 19], [26, 24]].map(([x, y]) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.4" ry="1.4" fill={p.card} />
      ))}
      <Path d="M30 4l2 12M34 6l-2 10M38 8l-6 8" stroke={t(p, '#C99561')} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  honey: (p) => (
    <>
      <Path d="M12 14h24v24a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z" fill={p.yellow} />
      <Rect x="10" y="8" width="28" height="8" rx="3" fill={p.brown} />
      <Path d="M18 24l3-2h6l3 2-3 2h-6z" fill={p.orange} />
      <Path d="M18 30l3-2h6l3 2-3 2h-6z" fill={p.orange} />
      <Path d="M36 8c4 0 6 2 6 6v6" stroke={p.brown} strokeWidth={2} fill="none" />
    </>
  ),
  maple_syrup: (p) => (
    <>
      <Path d="M18 6h12v6l6 6v22a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V18l6-6z" fill={t(p, '#B8621F')} />
      <Rect x="17" y="3" width="14" height="5" rx="1.5" fill={p.red} />
      <Path d="M24 22l3 4 4-1-2 4 3 3-5 1-3 4-3-4-5-1 3-3-2-4 4 1z" fill={p.red} />
      <Path d="M36 22h4v10h-4" stroke={t(p, '#B8621F')} strokeWidth={3} fill="none" />
    </>
  ),
  soy_sauce: (p) => (
    <>
      <Path d="M18 4h12v6c4 2 6 6 6 10v20a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V20c0-4 2-8 6-10z" fill={p.panIn} />
      <Rect x="17" y="2" width="14" height="5" rx="1.5" fill={p.red} />
      <Rect x="14" y="24" width="20" height="12" rx="2" fill={p.card} />
      <Path d="M20 30h8" stroke={p.red} strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  vinegar: (p) => (
    <>
      <Path d="M20 4h8v8l4 6v22a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V18l4-6z" fill={t(p, '#E9E1B4')} stroke={p.ink} strokeWidth={1.4} />
      <Rect x="19" y="2" width="10" height="5" rx="1.5" fill={p.ink} />
      <Rect x="16" y="24" width="16" height="10" fill={t(p, PLUM)} opacity={0.7} />
    </>
  ),
  spices: (p) => (
    <>
      <Rect x="8" y="16" width="14" height="26" rx="3" fill={p.card} stroke={p.ink} strokeWidth={1.4} />
      <Rect x="8" y="12" width="14" height="6" rx="1.5" fill={p.red} />
      <Rect x="8" y="28" width="14" height="14" rx="3" fill={p.orange} />
      <Rect x="26" y="12" width="14" height="30" rx="3" fill={p.card} stroke={p.ink} strokeWidth={1.4} />
      <Rect x="26" y="8" width="14" height="6" rx="1.5" fill={p.green} />
      <Rect x="26" y="24" width="14" height="18" rx="3" fill={t(p, '#8E4A2E')} />
    </>
  ),
  vanilla: (p) => (
    <>
      <Path d="M18 8h12v8l4 6v18a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V22l4-6z" fill={p.panIn} />
      <Rect x="18" y="4" width="12" height="6" rx="2" fill={p.ink} />
      <Rect x="16" y="26" width="16" height="10" rx="2" fill={p.cream} />
      <Path d="M38 6c-4 12-4 26 0 38" stroke={p.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  ),
  tortilla: (p) => (
    <>
      <Circle cx="24" cy="26" r="18" fill={t(p, '#EAD39C')} />
      <Circle cx="24" cy="26" r="15" fill={t(p, '#F2E2B6')} />
      {[[16, 20], [28, 18], [32, 30], [20, 32], [25, 26]].map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill={p.brown} opacity={0.5} />
      ))}
    </>
  ),
  noodles: (p) => (
    <>
      <Path d="M8 24h32c0 10-7 18-16 18S8 34 8 24z" fill={p.red} />
      <Path d="M10 24c2-6 6-2 8-6s6 2 8-2 6 2 8-2 4 4 6 10" stroke={p.yellow} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M30 4l-8 22M36 6l-10 20" stroke={p.brown} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  stock: (p) => (
    <>
      <Rect x="10" y="16" width="28" height="22" rx="4" fill={p.yellow} />
      <Path d="M10 22h28" stroke={p.orange} strokeWidth={2} />
      <Rect x="14" y="26" width="20" height="8" rx="2" fill={p.card} />
      <Path d="M18 12c-2-4 2-6 0-10M26 12c-2-4 2-6 0-10" stroke={p.inkSoft} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
    </>
  ),
  coffee: (p) => (
    <>
      <Path d="M10 18h24v16a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill={p.card} stroke={p.ink} strokeWidth={1.6} />
      <Path d="M34 22h4a4 4 0 0 1 0 8h-4" stroke={p.ink} strokeWidth={2.4} fill="none" />
      <Ellipse cx="22" cy="20" rx="11" ry="3" fill={p.brown} />
      <Path d="M18 14c-2-3 2-5 0-8M26 14c-2-3 2-5 0-8" stroke={p.inkSoft} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  ),
  tea: (p) => (
    <>
      <Path d="M10 20h24v14a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill={p.card} stroke={p.ink} strokeWidth={1.6} />
      <Path d="M34 24h4a4 4 0 0 1 0 8h-4" stroke={p.ink} strokeWidth={2.4} fill="none" />
      <Ellipse cx="22" cy="22" rx="11" ry="3" fill={t(p, '#C99561')} />
      <Path d="M22 22V8" stroke={p.inkSoft} strokeWidth={1.2} />
      <Rect x="18" y="4" width="8" height="7" rx="1" fill={p.green} />
    </>
  ),
  sesame: (p) => (
    <>
      {[[14, 18], [22, 14], [30, 20], [18, 26], [26, 28], [34, 30], [14, 34], [22, 38], [30, 38]].map(([x, y], i) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2" ry="3.5" fill={i % 3 ? p.cream : p.panIn} transform={`rotate(${i * 25} ${x} ${y})`} stroke={p.ink} strokeWidth={0.6} />
      ))}
    </>
  ),
  breadcrumbs: (p) => (
    <>
      <Path d="M8 26h32c0 10-7 16-16 16S8 36 8 26z" fill={p.blue} />
      <Ellipse cx="24" cy="26" rx="16" ry="5" fill={t(p, '#E2B572')} />
      {[[16, 25], [22, 27], [28, 24], [33, 26], [19, 23]].map(([x, y]) => (
        <Rect key={`${x}-${y}`} x={x} y={y} width="3" height="2.5" rx="0.6" fill={p.brown} />
      ))}
    </>
  ),
};

export const MORE_ALIASES: Record<string, string> = {
  'pumpkin puree': 'pumpkin', 'pumpkin purée': 'pumpkin', 'canned pumpkin': 'pumpkin', squash: 'butternut_squash', 'butternut squash': 'butternut_squash',
  'sweet potato': 'sweet_potato', 'sweet potatoes': 'sweet_potato', yam: 'sweet_potato', yams: 'sweet_potato',
  zucchini: 'zucchini', zucchinis: 'zucchini', courgette: 'zucchini', courgettes: 'zucchini',
  eggplant: 'eggplant', eggplants: 'eggplant', aubergine: 'eggplant', aubergines: 'eggplant', brinjal: 'eggplant',
  cauliflower: 'cauliflower', cabbage: 'cabbage', 'red cabbage': 'cabbage', 'bok choy': 'cabbage', 'pak choi': 'cabbage',
  lettuce: 'lettuce', romaine: 'lettuce', 'iceberg lettuce': 'lettuce', 'mixed greens': 'lettuce',
  pea: 'peas', 'green peas': 'peas', 'frozen peas': 'peas', edamame: 'peas', 'snow peas': 'peas',
  'green beans': 'green_beans', 'string beans': 'green_beans', 'french beans': 'green_beans',
  asparagus: 'asparagus', celery: 'celery', beet: 'beetroot', beets: 'beetroot', beetroot: 'beetroot',
  radish: 'radish', radishes: 'radish', 'spring onion': 'spring_onion', 'spring onions': 'spring_onion', scallion: 'spring_onion', scallions: 'spring_onion', 'green onion': 'spring_onion', 'green onions': 'spring_onion', chives: 'spring_onion',
  leek: 'leek', leeks: 'leek', ginger: 'ginger', 'fresh ginger': 'ginger', olives: 'olive', olive: 'olive', pickles: 'pickle', gherkin: 'pickle', gherkins: 'pickle',
  oranges: 'orange', 'orange juice': 'orange', 'orange zest': 'orange', clementine: 'orange', mandarin: 'orange', tangerine: 'orange',
  grape: 'grapes', grapes: 'grapes', raisins: 'grapes', pineapple: 'pineapple', mango: 'mango', mangoes: 'mango', mangos: 'mango',
  peach: 'peach', peaches: 'peach', nectarine: 'peach', apricot: 'peach', apricots: 'peach', pear: 'pear', pears: 'pear',
  cherry: 'cherry', cherries: 'cherry', blueberry: 'blueberry', blueberries: 'blueberry', blackberries: 'blueberry',
  raspberry: 'raspberry', raspberries: 'raspberry', watermelon: 'watermelon', melon: 'watermelon', kiwi: 'kiwi', kiwis: 'kiwi',
  coconut: 'coconut', 'coconut milk': 'coconut', 'coconut cream': 'coconut', 'desiccated coconut': 'coconut', pomegranate: 'pomegranate',
  cream: 'cream', 'heavy cream': 'cream', 'double cream': 'cream', 'whipping cream': 'cream', 'single cream': 'cream', 'half and half': 'cream',
  'cream cheese': 'cream_cheese', mascarpone: 'cream_cheese', mozzarella: 'mozzarella', burrata: 'mozzarella',
  parmesan: 'parmesan', parmigiano: 'parmesan', 'grated parmesan': 'parmesan', pecorino: 'parmesan', feta: 'feta', 'goat cheese': 'feta', halloumi: 'feta', paneer: 'tofu',
  'ice cream': 'ice_cream', gelato: 'ice_cream',
  tofu: 'tofu', tempeh: 'tofu', shrimp: 'shrimp', prawn: 'shrimp', prawns: 'shrimp', bacon: 'bacon', pancetta: 'bacon', prosciutto: 'bacon',
  sausage: 'sausage', sausages: 'sausage', chorizo: 'sausage', 'hot dog': 'sausage',
  beans: 'beans', 'black beans': 'beans', 'kidney beans': 'beans', 'baked beans': 'beans', 'cannellini beans': 'beans',
  chickpeas: 'chickpeas', chickpea: 'chickpeas', 'garbanzo beans': 'chickpeas', hummus: 'chickpeas', lentils: 'lentils', lentil: 'lentils', dal: 'lentils',
  nuts: 'nuts', almonds: 'nuts', almond: 'nuts', walnuts: 'nuts', pecans: 'nuts', cashews: 'nuts', peanuts: 'nuts', pistachios: 'nuts', hazelnuts: 'nuts',
  'peanut butter': 'peanut_butter', 'almond butter': 'peanut_butter', tahini: 'peanut_butter', nutella: 'peanut_butter',
  oats: 'oats', 'rolled oats': 'oats', oatmeal: 'oats', 'whole grain rolled oats': 'oats', granola: 'oats',
  honey: 'honey', 'maple syrup': 'maple_syrup', syrup: 'maple_syrup', 'agave': 'maple_syrup', 'golden syrup': 'maple_syrup',
  'soy sauce': 'soy_sauce', tamari: 'soy_sauce', 'fish sauce': 'soy_sauce', 'oyster sauce': 'soy_sauce', worcestershire: 'soy_sauce',
  vinegar: 'vinegar', 'balsamic vinegar': 'vinegar', 'rice vinegar': 'vinegar', 'apple cider vinegar': 'vinegar',
  cinnamon: 'spices', 'pumpkin spice': 'spices', 'pumpkin pie spice': 'spices', nutmeg: 'spices', cumin: 'spices', paprika: 'spices', turmeric: 'spices',
  'chili powder': 'spices', 'curry powder': 'spices', 'garam masala': 'spices', oregano: 'spices', 'italian seasoning': 'spices', spices: 'spices', cloves: 'spices',
  vanilla: 'vanilla', 'vanilla extract': 'vanilla', 'vanilla essence': 'vanilla',
  tortilla: 'tortilla', tortillas: 'tortilla', wrap: 'tortilla', wraps: 'tortilla', pita: 'tortilla', naan: 'tortilla',
  noodles: 'noodles', ramen: 'noodles', udon: 'noodles', 'rice noodles': 'noodles', 'egg noodles': 'noodles',
  stock: 'stock', broth: 'stock', 'chicken stock': 'stock', 'vegetable stock': 'stock', 'beef stock': 'stock', 'stock cube': 'stock', bouillon: 'stock',
  coffee: 'coffee', espresso: 'coffee', tea: 'tea', matcha: 'tea', 'sesame seeds': 'sesame', sesame: 'sesame', 'chia seeds': 'sesame', 'flax seeds': 'sesame', seeds: 'sesame',
  breadcrumbs: 'breadcrumbs', panko: 'breadcrumbs', 'bread crumbs': 'breadcrumbs',
};
