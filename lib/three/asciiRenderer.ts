import type { SceneName } from '@/lib/three/types'

// Character sets baked at AsciiEffect construction time — must recreate effect on scene change
export const SCENE_CHARSETS: Record<SceneName, string> = {
  city:   ' .,:;|/\\[]{}#%@█▓▒░',
  cafe:   ' .,-~°•○◉∞≈',
  nature: ' .,:;~*+xX#%&@♦◆▲▼',
}

// Scene tint colors
export const SCENE_COLORS: Record<SceneName, string> = {
  city:   '#7eb8f7',
  cafe:   '#f5c87a',
  nature: '#86efac',
}

export const ASCII_RESOLUTION = 0.175
