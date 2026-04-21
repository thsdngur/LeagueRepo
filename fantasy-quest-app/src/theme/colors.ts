export const colors = {
  bgDeep: '#05070f',
  bgPanel: '#0a1224',
  bgPanelAlt: '#0d1730',
  cyan: '#4fd0ff',
  cyanGlow: '#7ee7ff',
  cyanDim: '#2a7a9e',
  blue: '#2d7fff',
  blueDeep: '#1a3c82',
  white: '#e6f4ff',
  muted: '#6a7a99',
  gold: '#ffd666',
  goldGlow: '#ffe59a',
  danger: '#ff5470',
  success: '#34d399',
  border: 'rgba(79, 208, 255, 0.35)',
  borderStrong: 'rgba(79, 208, 255, 0.75)',
  shadow: 'rgba(79, 208, 255, 0.55)',
  overlay: 'rgba(2, 6, 18, 0.82)',
};

export const rankColor: Record<string, string> = {
  E: '#8b95a7',
  D: '#5bd3a0',
  C: '#4fd0ff',
  B: '#9a7bff',
  A: '#ff9f43',
  S: '#ff5470',
};

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
