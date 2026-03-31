'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronUp, X } from 'lucide-react'
import {
  Buildings, Coffee, Leaf, Flame, BookOpen, Scissors, Rocket, Waves,
  SpeakerHigh, SpeakerSlash, DiceFive, Info,
  Barbell, TennisBall, BowlFood, Umbrella, MusicNotes, Headphones,
  Cards, WashingMachine,
} from '@phosphor-icons/react'
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

const SCENES: SceneName[] = [
  'city', 'cafe', 'nature', 'fireplace', 'library', 'barbershop', 'spacestation', 'underwater',
  'casino', 'gym', 'tennis', 'ramen', 'beach', 'laundromat', 'club', 'recordingstudio',
]

const SCENE_META: Record<SceneName, { label: string; Icon: React.ElementType }> = {
  city:            { label: 'City',         Icon: Buildings      },
  cafe:            { label: 'Cafe',         Icon: Coffee         },
  nature:          { label: 'Nature',       Icon: Leaf           },
  fireplace:       { label: 'Fireplace',    Icon: Flame          },
  library:         { label: 'Library',      Icon: BookOpen       },
  barbershop:      { label: 'Barbershop',   Icon: Scissors       },
  spacestation:    { label: 'Space',        Icon: Rocket         },
  underwater:      { label: 'Underwater',   Icon: Waves          },
  casino:          { label: 'Casino',       Icon: Cards          },
  gym:             { label: 'Gym',          Icon: Barbell        },
  tennis:          { label: 'Tennis',       Icon: TennisBall     },
  ramen:           { label: 'Ramen',        Icon: BowlFood       },
  beach:           { label: 'Beach',        Icon: Umbrella       },
  laundromat:      { label: 'Laundromat',   Icon: WashingMachine },
  club:            { label: 'Club',         Icon: MusicNotes     },
  recordingstudio: { label: 'Studio',       Icon: Headphones     },
}

const GRAY = 'rgba(255,255,255,0.28)'
const GRAY_DIM = 'rgba(255,255,255,0.12)'

function crtBox(tint: string, active = false) {
  return {
    background: active ? `${tint}0f` : '#050505',
    border: `1px solid ${active ? tint + '66' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 2,
  } as const
}

const SCANLINES: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
  pointerEvents: 'none',
  zIndex: 10,
  borderRadius: 2,
}

const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.1em',
}

export default function ControlBar({
  scene,
  onSceneChange,
  layerStep,
  onLayerStepChange,
  volume,
  onVolumeChange,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoVisible, setInfoVisible] = useState(false)
  const infoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tint = SCENE_COLORS[scene]
  const { label: activeLabel, Icon: ActiveIcon } = SCENE_META[scene]

  // Picker fade
  useEffect(() => {
    if (pickerOpen) requestAnimationFrame(() => setPickerVisible(true))
    else setPickerVisible(false)
  }, [pickerOpen])

  // Info modal fade in/out
  function openInfo() {
    setInfoOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setInfoVisible(true)))
  }
  function closeInfo() {
    setInfoVisible(false)
    if (infoTimerRef.current) clearTimeout(infoTimerRef.current)
    infoTimerRef.current = setTimeout(() => setInfoOpen(false), 250)
  }

  function selectScene(s: SceneName) {
    onSceneChange(s)
    setPickerOpen(false)
  }

  return (
    <>
      {/* Room picker popover */}
      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
          <div
            className="fixed bottom-24 left-1/2 z-50 p-3 grid grid-cols-4 gap-2"
            style={{
              ...crtBox(tint, false),
              minWidth: 340,
              border: `1px solid rgba(255,255,255,0.1)`,
              opacity: pickerVisible ? 1 : 0,
              transform: `translateX(-50%) translateY(${pickerVisible ? 0 : 8}px)`,
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              position: 'fixed',
            }}
          >
            <div style={SCANLINES} />
            {SCENES.map(s => {
              const { label, Icon } = SCENE_META[s]
              const active = s === scene
              const c = active ? SCENE_COLORS[s] : GRAY
              return (
                <button
                  key={s}
                  onClick={() => selectScene(s)}
                  className={`scene-picker-btn flex flex-col items-center gap-1.5 transition-all duration-150 relative${active ? '' : ''}`}
                  style={{
                    padding: '10px 8px',
                    background: active ? `${SCENE_COLORS[s]}0f` : 'transparent',
                    border: `1px solid ${active ? SCENE_COLORS[s] + '55' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 2,
                    zIndex: 1,
                  }}
                >
                  <Icon size={20} weight="fill" style={{ color: c }} />
                  <span style={{ ...MONO, fontSize: 8, color: active ? SCENE_COLORS[s] : GRAY_DIM, textTransform: 'uppercase' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Info modal */}
      {infoOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0,0,0,0.75)',
              opacity: infoVisible ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
            onClick={closeInfo}
          />
          <div
            className="fixed top-1/2 left-1/2 z-50 p-8"
            style={{
              ...crtBox(tint, false),
              border: `1px solid ${tint}33`,
              width: 380,
              maxWidth: 'calc(100vw - 48px)',
              opacity: infoVisible ? 1 : 0,
              transform: `translate(-50%, ${infoVisible ? '-50%' : 'calc(-50% + 10px)'})`,
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
            <div style={SCANLINES} />
            <button
              onClick={closeInfo}
              className="absolute top-4 right-4 z-10 transition-opacity hover:opacity-80"
              style={{ opacity: 0.4 }}
            >
              <X size={14} style={{ color: tint }} />
            </button>
            <div style={{ borderBottom: `1px solid ${tint}22`, paddingBottom: 10, marginBottom: 16 }}>
              <span style={{ ...MONO, fontSize: 8, color: GRAY_DIM, textTransform: 'uppercase' }}>
                // ELEVEN_ROOMS.SYS
              </span>
            </div>
            <p style={{ ...MONO, fontSize: 11, lineHeight: 1.9, color: 'rgba(255,255,255,0.4)' }}>
              Eleven Rooms is an ambient soundscape experience. Choose a room, set your sound layers, and let the atmosphere carry you. Each room is a living ASCII world — part visual, part sonic. Sounds are generated by ElevenLabs and layered in real time through the Web Audio API.
            </p>
            <div style={{ marginTop: 20, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...MONO, fontSize: 8, color: GRAY_DIM, textTransform: 'uppercase' }}>
                  {SCENES.length} ROOMS · 4 LAYERS EACH
                </span>
                <span style={{ ...MONO, fontSize: 8, color: GRAY_DIM }}>USE HEADPHONES</span>
              </div>
              <div style={{ borderTop: `1px solid rgba(255,255,255,0.04)`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ ...MONO, fontSize: 8, color: GRAY_DIM }}>
                  A PROJECT BY{' '}
                  <a href="https://ch.sh" target="_blank" rel="noopener noreferrer" style={{ color: tint, textDecoration: 'none' }}>
                    CH.SH
                  </a>
                </span>
                <span style={{ ...MONO, fontSize: 8, color: GRAY_DIM }}>
                  POWERED BY{' '}
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>ELEVENLABS API</span>
                  {' '}· SUBMITTED FOR{' '}
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>SILLYHACKS</span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main dock bar */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-0 z-30"
        style={{
          background: '#050505',
          border: `1px solid ${tint}33`,
          borderRadius: 2,
          height: 52,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <div style={SCANLINES} />

        {/* Top edge accent */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tint}55 20%, ${tint}55 80%, transparent)` }}
        />

        {/* Room selector */}
        <button
          onClick={() => setPickerOpen(v => !v)}
          className="flex items-center gap-2 relative z-10 transition-all duration-150"
          style={{
            height: '100%',
            padding: '0 20px',
            borderRight: `1px solid rgba(255,255,255,0.08)`,
            background: pickerOpen ? `${tint}0f` : 'transparent',
          }}
        >
          <ActiveIcon size={16} weight="fill" style={{ color: tint }} />
          <span style={{ ...MONO, fontSize: 11, color: tint, textTransform: 'uppercase' }}>
            {activeLabel}
          </span>
          <ChevronUp size={10} style={{ color: GRAY_DIM, transform: pickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
        </button>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Layer slider */}
        <div className="relative z-10 px-6">
          <LayerSlider value={layerStep} onChange={onLayerStepChange} tint={tint} />
        </div>

        {/* Random room */}
        <button
          onClick={() => {
            const others = SCENES.filter(s => s !== scene)
            selectScene(others[Math.floor(Math.random() * others.length)])
          }}
          className="relative z-10 flex items-center justify-center transition-opacity duration-150 hover:opacity-60"
          style={{ height: '100%', padding: '0 14px', borderLeft: `1px solid rgba(255,255,255,0.08)`, borderRight: `1px solid rgba(255,255,255,0.08)` }}
          title="Random room"
        >
          <DiceFive size={18} weight="fill" style={{ color: GRAY }} />
        </button>

        {/* Mute */}
        <button
          onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
          className="relative z-10 flex items-center justify-center transition-opacity duration-150 hover:opacity-60"
          style={{ height: '100%', padding: '0 14px', borderRight: `1px solid rgba(255,255,255,0.08)` }}
          title={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0
            ? <SpeakerSlash size={18} weight="fill" style={{ color: GRAY_DIM }} />
            : <SpeakerHigh size={18} weight="fill" style={{ color: tint }} />
          }
        </button>

        {/* Info */}
        <button
          onClick={openInfo}
          className="relative z-10 flex items-center justify-center transition-opacity duration-150 hover:opacity-60"
          style={{ height: '100%', padding: '0 14px' }}
          title="Info"
        >
          <Info size={18} weight="fill" style={{ color: GRAY }} />
        </button>
      </div>
    </>
  )
}

function LayerSlider({ value, onChange, tint }: { value: LayerStep; onChange: (v: LayerStep) => void; tint: string }) {
  const pct = (value - 1) / 3
  return (
    <div className="relative flex items-center" style={{ width: 110, height: 28, flexShrink: 0 }}>
      <div className="absolute" style={{ left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute" style={{ left: 0, width: `${pct * 100}%`, height: 2, background: tint, transition: 'width 0.15s ease' }} />
      {([1, 2, 3] as const).map(n => {
        const filled = n <= value
        return (
          <div key={n} className="absolute pointer-events-none" style={{
            left: `calc(${((n - 1) / 3) * 100}% - 3px)`,
            width: 6, height: 6,
            background: filled ? tint : 'rgba(255,255,255,0.12)',
            zIndex: 1,
            transition: 'background 0.15s ease',
          }} />
        )
      })}
      <div className="absolute pointer-events-none" style={{
        left: `calc(${pct * 100}% - 8px)`,
        width: 16, height: 16,
        background: '#050505',
        border: `1.5px solid ${tint}`,
        zIndex: 2,
        transition: 'left 0.15s ease',
      }} />
      <input type="range" min={1} max={4} step={1} value={value}
        onChange={e => onChange(Number(e.target.value) as LayerStep)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ zIndex: 3 }} />
    </div>
  )
}
