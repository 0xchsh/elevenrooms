'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'
import ControlBar from '@/components/ControlBar'
import type { SceneName, LayerStep } from '@/lib/three/types'
import { SCENE_COLORS } from '@/lib/three/asciiRenderer'
import type { AudioEngine } from '@/lib/audio/AudioEngine'

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

  // Initialize AudioEngine on first user click (autoplay policy)
  useEffect(() => {
    async function initAudio() {
      if (audioEngineRef.current) return
      const { AudioEngine } = await import('@/lib/audio/AudioEngine')
      const engine = new AudioEngine()
      audioEngineRef.current = engine
      await engine.setScene(sceneRef.current)
      engine.setLayerStep(layerStepRef.current)
      engine.setMasterVolume(volumeRef.current)
      setAudioReady(true)
    }

    window.addEventListener('click', initAudio, { once: true })
    return () => window.removeEventListener('click', initAudio)
  }, [])

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

      {/* Scene name overlay */}
      <div
        className="absolute top-5 left-6 text-xs tracking-widest uppercase pointer-events-none transition-colors duration-600"
        style={{ color: `${tint}44`, fontFamily: 'monospace' }}
      >
        {scene}
      </div>

      {/* Click to begin hint */}
      {!audioReady && (
        <div
          className="absolute top-5 right-6 text-xs tracking-widest uppercase pointer-events-none animate-pulse"
          style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
        >
          click to begin
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
