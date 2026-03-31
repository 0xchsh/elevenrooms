'use client'

import type { SceneName, LayerStep } from '@/lib/three/types'
import { SCENE_COLORS } from '@/lib/three/asciiRenderer'

interface Props {
  scene: SceneName
  onSceneChange: (s: SceneName) => void
  layerStep: LayerStep
  onLayerStepChange: (s: LayerStep) => void
  volume: number
  onVolumeChange: (v: number) => void
}

const SCENES: SceneName[] = ['city', 'cafe', 'nature']

export default function ControlBar({
  scene,
  onSceneChange,
  layerStep,
  onLayerStepChange,
  volume,
  onVolumeChange,
}: Props) {
  const tint = SCENE_COLORS[scene]

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6"
      style={{
        height: 56,
        borderRadius: 20,
        // Liquid glass layers
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px) saturate(180%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(1.1)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.4),
          0 1px 0 rgba(255,255,255,0.15) inset,
          0 -1px 0 rgba(0,0,0,0.3) inset
        `,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Specular highlight strip */}
      <div
        className="absolute top-0 left-4 right-4 pointer-events-none"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.3) 70%, transparent)',
          borderRadius: '50%',
        }}
      />

      {/* Scene tabs */}
      <div className="flex items-center gap-1">
        {SCENES.map(s => (
          <button
            key={s}
            onClick={() => onSceneChange(s)}
            className="relative px-3 text-xs tracking-widest uppercase transition-all duration-300 flex items-center"
            style={{
              color: scene === s ? tint : 'rgba(255,255,255,0.3)',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
            }}
          >
            {scene === s && (
              <span
                className="absolute inset-x-1 bottom-0 transition-all duration-300"
                style={{
                  height: 1,
                  background: tint,
                  boxShadow: `0 0 6px ${tint}`,
                  borderRadius: 1,
                }}
              />
            )}
            {s}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

      {/* Layer dial */}
      <div className="flex items-center gap-2.5">
        <span style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em' }}>
          LAYERS
        </span>
        {([1, 2, 3, 4] as LayerStep[]).map(n => (
          <button
            key={n}
            onClick={() => onLayerStepChange(n)}
            title={`${n} layer${n > 1 ? 's' : ''}`}
            style={{ padding: 3 }}
          >
            <div
              className="transition-all duration-300"
              style={{
                width: n <= layerStep ? 7 : 5,
                height: n <= layerStep ? 7 : 5,
                borderRadius: '50%',
                background: n <= layerStep ? tint : 'rgba(255,255,255,0.15)',
                boxShadow: n <= layerStep ? `0 0 8px ${tint}88` : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

      {/* Mute toggle */}
      <button
        onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
        className="flex items-center transition-opacity duration-200 hover:opacity-70"
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon muted={volume === 0} tint={tint} />
      </button>
    </div>
  )
}

function VolumeIcon({ muted, tint }: { muted: boolean; tint: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ color: muted ? 'rgba(255,255,255,0.2)' : tint, flexShrink: 0 }}>
      {muted ? (
        <path d="M2 5h3l4-3v12l-4-3H2V5zm9 1l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M2 5h3l4-3v12l-4-3H2V5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 5.5a3 3 0 010 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 3.5a5.5 5.5 0 010 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
