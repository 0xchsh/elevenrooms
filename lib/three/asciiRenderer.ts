import type { SceneName } from '@/lib/three/types'

export const SCENE_CHARSETS: Record<SceneName, string> = {
  city:           ' .,:;|/\\[]{}#%@█▓▒░',
  cafe:           ' .,-~°•○◉∞≈',
  nature:         ' .,:;~*+xX#%&@♦◆▲▼',
  fireplace:      ' .,:;~*^°▲△▴░▒▓█',
  library:        ' .,:;|[]{}/\\Il!#@',
  barbershop:     ' .,-~+•○◉#@|/',
  spacestation:   ' .,:+*x#○●◎⊕▣◆',
  underwater:     ' .,:~≈∿*°•○◯∾',
  casino:         ' .,:;+*x#♠♦♣♥░▒▓',
  gym:            ' .,:;~+*xX%#@█▓▒░',
  tennis:         ' .,-~*+xX#@&',
  ramen:          ' .,:;~°•○◉∞≈~',
  beach:          ' .,:;~-+*°•○≈#',
  laundromat:     ' .,:~○◯°•·-+=',
  club:           ' .,:;+*x#▓█░▒●◉',
  recordingstudio:' .,:;|Il[]{}#@/',
}

export const SCENE_COLORS: Record<SceneName, string> = {
  city:           '#7eb8f7',
  cafe:           '#f5c87a',
  nature:         '#86efac',
  fireplace:      '#fb923c',
  library:        '#c8a97e',
  barbershop:     '#f87171',
  spacestation:   '#22d3ee',
  underwater:     '#38bdf8',
  casino:         '#f59e0b',
  gym:            '#f97316',
  tennis:         '#a3e635',
  ramen:          '#fbbf24',
  beach:          '#fde68a',
  laundromat:     '#bae6fd',
  club:           '#f472b6',
  recordingstudio:'#4ade80',
}

export const ASCII_RESOLUTION = 0.175
