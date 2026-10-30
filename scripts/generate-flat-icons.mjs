/**
 * Generates components/icons/*.tsx from assets/flat/*.svg shapes.
 * Run: node scripts/generate-flat-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgDir = path.join(root, 'assets/flat');
const outDir = path.join(root, 'components/icons');

const ATTR_MAP = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
};

function toPascalCase(name) {
  return name
    .split(/[-_]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function parseAttrs(attrString) {
  const attrs = {};
  const re = /([\w-:]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(attrString)) !== null) {
    const key = ATTR_MAP[m[1]] ?? m[1];
    attrs[key] = m[2];
  }
  return attrs;
}

function attrsToJsx(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => {
      if (k === 'opacity' && v.includes('.')) {
        return `opacity={${v}}`;
      }
      if (k === 'transform') {
        return `transform="${v}"`;
      }
      if (/^\d+(\.\d+)?$/.test(v) && !['d', 'points'].includes(k)) {
        const numKeys = [
          'x',
          'y',
          'cx',
          'cy',
          'r',
          'rx',
          'ry',
          'width',
          'height',
          'strokeWidth',
          'opacity',
        ];
        if (numKeys.includes(k)) {
          return `${k}={${v}}`;
        }
      }
      return `${k}="${v}"`;
    })
    .join(' ');
}

function extractShapes(svg) {
  const cleaned = svg
    .replace(/<metadata>[\s\S]*?<\/metadata>/gi, '')
    .replace(/xmlns:[^=]+="[^"]*"/g, '');
  const shapes = [];
  const re =
    /<(path|rect|circle|ellipse|line|polyline|polygon)(\s[^>]*?)(\/?)>/gi;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const tag = m[1];
    const attrs = parseAttrs(m[2]);
    shapes.push({ tag, attrs });
  }
  return shapes;
}

function componentName(fileBase) {
  const map = {
    'cutting-board-base': 'CuttingBoardBase',
    'oil-bottle': 'OilBottle',
    'sauce-bottle': 'SauceBottle',
    'sauce-jar': 'SauceJar',
    'soup-bowl': 'SoupBowl',
    'pasta-dish': 'PastaDish',
    'pasta-dry': 'PastaDry',
    'pie-full': 'PieFull',
    'rice-dish': 'RiceDish',
    'baked-pasta': 'BakedPasta',
    'pot-topdown': 'PotTopdown',
  };
  if (map[fileBase]) return map[fileBase];
  return toPascalCase(fileBase);
}

const RN_TAG = {
  path: 'Path',
  rect: 'Rect',
  circle: 'Circle',
  ellipse: 'Ellipse',
  line: 'Line',
  polyline: 'Polyline',
  polygon: 'Polygon',
};

function writeComponent(name, shapes) {
  const used = new Set(shapes.map((s) => RN_TAG[s.tag]));
  const imports = ['Svg', ...used].join(', ');
  const body = shapes
    .map((s) => {
      const Tag = RN_TAG[s.tag];
      const jsx = attrsToJsx(s.attrs);
      return `    <${Tag} ${jsx} />`;
    })
    .join('\n');

  const content = `import Svg, { ${imports.replace('Svg, ', '')} } from 'react-native-svg';

import type { FlatIconProps } from './types';
import { iconSizeProps } from './types';

export function ${name}({ size = 24, width, height, color, style }: FlatIconProps) {
  const dim = iconSizeProps({ size, width, height });
  return (
    <Svg viewBox="0 0 24 24" {...dim} style={style} accessibilityRole="image">
${body}
    </Svg>
  );
}
`;

  fs.writeFileSync(path.join(outDir, `${name}.tsx`), content);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const generated = [];
for (const file of fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg'))) {
  const base = file.replace(/\.svg$/, '');
  const svg = fs.readFileSync(path.join(svgDir, file), 'utf8');
  const shapes = extractShapes(svg);
  if (shapes.length === 0) continue;
  const name = componentName(base);
  writeComponent(name, shapes);
  generated.push({ base, name });
}

const indexLines = [
  `export type { FlatIconProps } from './types';`,
  `export { iconSizeProps } from './types';`,
  ...generated.map(({ name }) => `export { ${name} } from './${name}';`),
];
fs.writeFileSync(path.join(outDir, 'generated.ts'), indexLines.join('\n') + '\n');

console.log(`Generated ${generated.length} icon components.`);
