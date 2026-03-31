'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'
import ControlBar from '@/components/ControlBar'
import type { SceneName, LayerStep } from '@/lib/three/types'
import { SCENE_COLORS } from '@/lib/three/asciiRenderer'
import { AudioEngine } from '@/lib/audio/AudioEngine'

const SceneViewer = dynamic(() => import('@/components/SceneViewer'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: '#0a0a0a' }} />,
})

export default function Home() {
  const [scene, setScene] = useState<SceneName>('city')
  const [layerStep, setLayerStep] = useState<LayerStep>(4)
  const [volume, setVolume] = useState(0.8)
  const [audioReady, setAudioReady] = useState(false)

  const audioEngineRef = useRef<AudioEngine | null>(null)
  const sceneRef = useRef<SceneName>(scene)
  const layerStepRef = useRef<LayerStep>(layerStep)
  const volumeRef = useRef(volume)

  // Keep refs in sync with state
  sceneRef.current = scene
  layerStepRef.current = layerStep
  volumeRef.current = volume

  async function initAudio() {
    if (audioEngineRef.current) return
    // AudioEngine must be instantiated synchronously within the user gesture
    // handler so iOS Safari allows AudioContext to start
    const engine = new AudioEngine()
    audioEngineRef.current = engine
    await engine.setScene(sceneRef.current)
    engine.setLayerStep(layerStepRef.current)
    engine.setMasterVolume(volumeRef.current)
    setAudioReady(true)
  }

  // Sync scene changes to audio
  useEffect(() => {
    if (!audioReady || !audioEngineRef.current) return
    audioEngineRef.current.setScene(scene).then(() => {
      audioEngineRef.current!.setLayerStep(layerStep)
    })
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync layer step changes to audio
  useEffect(() => {
    if (!audioReady || !audioEngineRef.current) return
    audioEngineRef.current.setLayerStep(layerStep)
  }, [layerStep, audioReady])

  // Sync volume changes to audio
  useEffect(() => {
    if (!audioReady || !audioEngineRef.current) return
    audioEngineRef.current.setMasterVolume(volume)
  }, [volume, audioReady])

  const tint = SCENE_COLORS[scene]

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      <SceneViewer scene={scene} />

      {/* Click-to-enable overlay — covers full screen, initializes audio on any tap/click */}
      {!audioReady && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={initAudio}
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <span
            className="tracking-widest uppercase animate-pulse pointer-events-none"
            style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: 'clamp(11px, 3vw, 16px)', letterSpacing: '0.2em' }}
          >
            click to enter
          </span>
        </div>
      )}

      <ControlBar
        scene={scene}
        onSceneChange={setScene}
        layerStep={layerStep}
        onLayerStepChange={setLayerStep}
        volume={volume}
        onVolumeChange={setVolume}
      />
    </main>
  )
}
