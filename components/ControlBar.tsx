'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Buildings, Coffee, Leaf, Flame, BookOpen, Scissors, Rocket, Waves,
  SpeakerHigh, SpeakerSlash, DiceFive, Info,
  Barbell, TennisBall, BowlFood, Umbrella, MusicNotes, Headphones,
  PokerChip, WashingMachine, CaretUp, X, GithubLogo,
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
  casino:          { label: 'Casino',       Icon: PokerChip      },
  gym:             { label: 'Gym',          Icon: Barbell        },
  tennis:          { label: 'Tennis',       Icon: TennisBall     },
  ramen:           { label: 'Ramen',        Icon: BowlFood       },
  beach:           { label: 'Beach',        Icon: Umbrella       },
  laundromat:      { label: 'Laundromat',   Icon: WashingMachine },
  club:            { label: 'Club',         Icon: MusicNotes     },
  recordingstudio: { label: 'Studio',       Icon: Headphones     },
}

const CREAM = 'rgba(255,255,255,0.08)'
const INK = 'rgba(255,255,255,0.9)'
const INK_DIM = 'rgba(255,255,255,0.55)'
const DIVIDER = 'rgba(255,255,255,0.1)'

const MONO: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 400,
  letterSpacing: '0.05em',
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
  const [isMobile, setIsMobile] = useState(false)
  const infoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tint = SCENE_COLORS[scene]
  const { label: activeLabel, Icon: ActiveIcon } = SCENE_META[scene]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])


  // Picker fade in/out
  useEffect(() => {
    if (pickerOpen) {
      if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
      requestAnimationFrame(() => requestAnimationFrame(() => setPickerVisible(true)))
    } else {
      setPickerVisible(false)
    }
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

  function closePicker() {
    setPickerVisible(false)
    if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
    pickerTimerRef.current = setTimeout(() => setPickerOpen(false), 200)
  }

  function selectScene(s: SceneName) {
    onSceneChange(s)
    closePicker()
  }

  return (
    <>
      {/* Room picker popover */}
      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closePicker} />
          <div
            className="fixed bottom-24 left-1/2 z-50 p-3 grid grid-cols-4 gap-2"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              minWidth: isMobile ? 300 : 340,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              opacity: pickerVisible ? 1 : 0,
              transform: `translateX(-50%) translateY(${pickerVisible ? 0 : 8}px)`,
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              position: 'fixed',
            }}
          >
            {SCENES.map(s => {
              const { label, Icon } = SCENE_META[s]
              const active = s === scene
              return (
                <button
                  key={s}
                  onClick={() => selectScene(s)}
                  className="scene-picker-btn flex flex-col items-center gap-1.5 transition-all duration-150 relative"
                  style={{
                    padding: '10px 8px',
                    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                  }}
                >
                  <Icon size={isMobile ? 22 : 26} weight="fill" style={{ color: active ? SCENE_COLORS[s] : INK_DIM }} />
                  <span style={{ ...MONO, fontSize: isMobile ? 10 : 14, color: active ? SCENE_COLORS[s] : INK_DIM, textTransform: 'uppercase' }}>
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
            className="fixed top-1/2 left-1/2 z-50"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              width: 520,
              maxWidth: 'calc(100vw - 40px)',
              padding: '48px 52px 44px',
              opacity: infoVisible ? 1 : 0,
              transform: `translate(-50%, ${infoVisible ? '-50%' : 'calc(-50% + 12px)'})`,
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
            <button
              onClick={closeInfo}
              className="absolute top-5 right-5 transition-opacity hover:opacity-60"
              style={{ opacity: 0.25 }}
              aria-label="Close"
            >
              <X size={20} style={{ color: INK }} />
            </button>

            {/* Main body text */}
            <p style={{ ...MONO, fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', margin: 0 }}>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>ELEVENROOMS</span>
              {' '}IS AN AMBIENT SOUNDSCAPE EXPERIENCE POWERED BY ELEVENLABS API. CHOOSE A ROOM, TOGGLE BACK THE LAYERS OF SOUND, AND LET THE ATMOSPHERE CARRY YOU. EACH ROOM IS A SMALL ASCII WORLD—PART VISUAL, PART SONIC.
            </p>

            {/* Credits */}
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
              <p style={{ ...MONO, fontSize: 14, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0 }}>
                A PROJECT BY{' '}
                <a href="https://ch.sh" target="_blank" rel="noopener noreferrer" className="info-link" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>
                  CH.SH
                </a>
              </p>
              <p style={{ ...MONO, fontSize: 14, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0 }}>
                POWERED BY{' '}
                <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="info-link" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>ELEVENLABS</a>
              </p>
              <p style={{ ...MONO, fontSize: 14, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0 }}>
                SUBMITTED FOR{' '}
                  <a href="https://sillyhacks.nyc" target="_blank" rel="noopener noreferrer" className="info-link" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>SILLY HACKS</a>
              </p>
              {!isMobile && (
                <a href="https://sillyhacks.nyc" target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', right: 0, bottom: 0 }}>
                  <div className="silly-hacks-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/sillyhacks.png" alt="Silly Hacks" className="silly-hacks-img" style={{ height: 80, width: 'auto' }} />
                  </div>
                </a>
              )}
            </div>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ ...MONO, fontSize: 14, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0 }}>
                <a href="https://github.com/0xchsh/elevenrooms" target="_blank" rel="noopener noreferrer" className="info-link" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px', display: 'inline-flex', alignItems: 'center', gap: 6 }}><GithubLogo size={18} weight="fill" style={{ color: 'rgba(255,255,255,0.35)' }} />GITHUB</a>
              </p>
              {isMobile && (
                <a href="https://sillyhacks.nyc" target="_blank" rel="noopener noreferrer">
                  <div className="silly-hacks-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/sillyhacks.png" alt="Silly Hacks" className="silly-hacks-img" style={{ height: 40, width: 'auto' }} />
                  </div>
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main dock bar */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center z-30"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 9999,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.08) inset',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          height: 52,
          paddingRight: 4,
          paddingLeft: isMobile ? 8 : 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {/* Room selector */}
        <button
          onClick={() => pickerOpen ? closePicker() : setPickerOpen(true)}
          className="flex items-center gap-2 transition-all duration-150 hover:opacity-70"
          style={{
            height: '100%',
            padding: isMobile ? '0 14px' : '0 18px',
            borderRight: `1px solid ${DIVIDER}`,
            background: pickerOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
          }}
        >
          <ActiveIcon size={16} weight="fill" style={{ color: tint, flexShrink: 0 }} />
          {!isMobile && (
            <>
              <span style={{ ...MONO, fontSize: 14, color: INK, textTransform: 'uppercase' }}>
                {activeLabel}
              </span>
              <CaretUp size={14} style={{ color: INK_DIM, transform: pickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </>
          )}
        </button>

        {/* Layer slider */}
        <div style={{ padding: isMobile ? '0 14px' : '0 24px' }}>
          <LayerSlider value={layerStep} onChange={onLayerStepChange} tint={tint} isMobile={isMobile} />
        </div>

        {/* Random room */}
        <button
          onClick={() => {
            const others = SCENES.filter(s => s !== scene)
            selectScene(others[Math.floor(Math.random() * others.length)])
          }}
          className="flex items-center justify-center transition-opacity duration-150 hover:opacity-50"
          style={{ height: '100%', padding: '0 14px', borderLeft: `1px solid ${DIVIDER}`, borderRight: `1px solid ${DIVIDER}` }}
          title="Random room"
          aria-label="Random room"
        >
          <DiceFive size={17} weight="fill" style={{ color: INK_DIM }} />
        </button>

        {/* Mute */}
        <button
          onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
          className="flex items-center justify-center transition-opacity duration-150 hover:opacity-50"
          style={{ height: '100%', padding: '0 14px', borderRight: `1px solid ${DIVIDER}` }}
          title={volume === 0 ? 'Unmute' : 'Mute'}
          aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0
            ? <SpeakerSlash size={17} weight="fill" style={{ color: INK_DIM }} />
            : <SpeakerHigh size={17} weight="fill" style={{ color: tint }} />
          }
        </button>

        {/* Info */}
        <button
          onClick={openInfo}
          className="flex items-center justify-center transition-opacity duration-150 hover:opacity-50"
          style={{ height: '100%', padding: '0 14px' }}
          title="Info"
          aria-label="Info"
        >
          <Info size={17} weight="fill" style={{ color: INK_DIM }} />
        </button>
      </div>
    </>
  )
}

function LayerSlider({ value, onChange, tint, isMobile }: { value: LayerStep; onChange: (v: LayerStep) => void; tint: string; isMobile?: boolean }) {
  const pct = (value - 1) / 3
  return (
    <div className="relative flex items-center" style={{ width: isMobile ? 80 : 110, height: 28, flexShrink: 0 }}>
      <div className="absolute" style={{ left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.25)' }} />
      <div className="absolute" style={{ left: 0, width: `${pct * 100}%`, height: 2, background: 'rgba(255,255,255,0.7)', transition: 'width 0.15s ease' }} />
      {([1, 2, 3, 4] as const).map(n => {
        const filled = n <= value
        return (
          <div key={n} className="absolute pointer-events-none" style={{
            left: `calc(${((n - 1) / 3) * 100}% - ${n === 4 ? 6 : 3}px)`,
            width: 6, height: 6,
            background: filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
            zIndex: 1,
            transition: 'background 0.15s ease',
          }} />
        )
      })}
      <div className="absolute pointer-events-none" style={{
        left: `calc(${pct * 100}% - 8px)`,
        width: 16, height: 16,
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '50%',
        zIndex: 2,
        transition: 'left 0.15s ease',
      }} />
      <input type="range" min={1} max={4} step={1} value={value}
        onChange={e => onChange(Number(e.target.value) as LayerStep)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ zIndex: 3 }} />
    </div>
  )
}
