import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { paper } from '../../lib/theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function stroke(color: string, strokeWidth: number) {
  return {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function HomeIcon({ size = 24, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 11l9-7 9 7v9H3z" {...s} />
      <Path d="M9 20v-6h6v6" {...s} />
    </Svg>
  );
}

export function FridgeIcon({ size = 24, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="2" width="14" height="20" rx="2" {...s} />
      <Path d="M5 10h14M8 6v1M8 13v2" {...s} />
    </Svg>
  );
}

export function BookIcon({ size = 24, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" {...s} />
      <Path d="M8 9h8M8 13h5" {...s} />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = paper.card, strokeWidth = 3.2 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" {...s} />
    </Svg>
  );
}

export function BackIcon({ size = 22, color = paper.ink, strokeWidth = 2.8 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" {...s} />
    </Svg>
  );
}

export function ClockIcon({ size = 18, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="13" r="8" {...s} />
      <Path d="M12 9v4l3 2M9 2h6" {...s} />
    </Svg>
  );
}

export function ListIcon({ size = 20, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 6h11M9 12h11M9 18h11" {...s} />
      <Circle cx="4.5" cy="6" r="1.2" fill={color} />
      <Circle cx="4.5" cy="12" r="1.2" fill={color} />
      <Circle cx="4.5" cy="18" r="1.2" fill={color} />
    </Svg>
  );
}

export function LinkIcon({ size = 24, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1" {...s} />
      <Path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" {...s} />
    </Svg>
  );
}

export function MicIcon({ size = 24, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="9" y="3" width="6" height="11" rx="3" {...s} />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...s} />
    </Svg>
  );
}

export function PencilIcon({ size = 24, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20l1-5L16 4l4 4L9 19z" {...s} />
      <Path d="M13 7l4 4" {...s} />
    </Svg>
  );
}

/** Two-tone paper flame for streaks. */
export function FlameIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 20 24">
      <Path d="M10 1C12 7 18 9 18 15a8 8 0 0 1-16 0c0-4 3-5 4-9 1 3 2 4 3 4 0-3 0-6 1-9z" fill={paper.red} />
      <Path d="M10 12c2 3 4 4 4 6a4 4 0 0 1-8 0c0-2 2-3 4-6z" fill={paper.yellow} />
    </Svg>
  );
}

export function StarIcon({ size = 18, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l3 7 7 .6-5.4 4.6 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.6 9 9z"
        fill={filled ? paper.yellow : 'none'}
        stroke={paper.ink}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrashIcon({ size = 22, color = paper.ink, strokeWidth = 2.4 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...s} />
      <Path d="M10 11v6M14 11v6" {...s} />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = paper.card, strokeWidth = 3 }: IconProps) {
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12l5 5 9-10" {...s} />
    </Svg>
  );
}
