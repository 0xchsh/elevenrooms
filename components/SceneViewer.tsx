'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js'
import { SCENE_CHARSETS, SCENE_COLORS, ASCII_RESOLUTION } from '@/lib/three/asciiRenderer'
import { createCityScene } from '@/components/scenes/CityScene'
import { createCafeScene } from '@/components/scenes/CafeScene'
import { createNatureScene } from '@/components/scenes/NatureScene'
import { createFireplaceScene } from '@/components/scenes/FireplaceScene'
import { createLibraryScene } from '@/components/scenes/LibraryScene'
import { createBarbershopScene } from '@/components/scenes/BarbershopScene'
import { createSpaceStationScene } from '@/components/scenes/SpaceStationScene'
import { createUnderwaterScene } from '@/components/scenes/UnderwaterScene'
import { createCasinoScene } from '@/components/scenes/CasinoScene'
import { createGymScene } from '@/components/scenes/GymScene'
import { createTennisScene } from '@/components/scenes/TennisScene'
import { createRamenScene } from '@/components/scenes/RamenScene'
import { createBeachScene } from '@/components/scenes/BeachScene'
import { createLaundroMatScene } from '@/components/scenes/LaundroMatScene'
import { createNightclubScene } from '@/components/scenes/NightclubScene'
import { createRecordingStudioScene } from '@/components/scenes/RecordingStudioScene'
import type { SceneName, SceneModule } from '@/lib/three/types'

export const CONTROL_BAR_HEIGHT = 0

// Mix scene color into near-black background at given strength (0–1)
function tintedBg(hex: string, strength = 0.12): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const br = Math.round(r * strength)
  const bg = Math.round(g * strength)
  const bb = Math.round(b * strength)
  return `rgb(${br},${bg},${bb})`
}

interface Props {
  scene: SceneName
}

function createScene(name: SceneName): SceneModule {
  switch (name) {
    case 'city':         return createCityScene()
    case 'cafe':         return createCafeScene()
    case 'nature':       return createNatureScene()
    case 'fireplace':    return createFireplaceScene()
    case 'library':      return createLibraryScene()
    case 'barbershop':   return createBarbershopScene()
    case 'spacestation':     return createSpaceStationScene()
    case 'underwater':       return createUnderwaterScene()
    case 'casino':           return createCasinoScene()
    case 'gym':              return createGymScene()
    case 'tennis':           return createTennisScene()
    case 'ramen':            return createRamenScene()
    case 'beach':            return createBeachScene()
    case 'laundromat':       return createLaundroMatScene()
    case 'club':             return createNightclubScene()
    case 'recordingstudio':  return createRecordingStudioScene()
  }
}

export default function SceneViewer({ scene }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const effectRef = useRef<AsciiEffect | null>(null)
  const threeSceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const moduleRef = useRef<SceneModule | null>(null)
  const animFrameRef = useRef<number>(0)
  const clockRef = useRef(new THREE.Clock())
  const sceneNameRef = useRef<SceneName>(scene)

  // Init renderer once
  useEffect(() => {
    if (!mountRef.current) return

    const w = window.innerWidth
    const h = window.innerHeight - CONTROL_BAR_HEIGHT

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
    rendererRef.current = renderer

    const threeScene = new THREE.Scene()
    threeSceneRef.current = threeScene

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
    cameraRef.current = camera

    // Build initial AsciiEffect
    const effect = new AsciiEffect(renderer, SCENE_CHARSETS[sceneNameRef.current], {
      invert: true,
      resolution: ASCII_RESOLUTION,
    })
    effect.setSize(w, h)
    Object.assign(effect.domElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: `calc(100vh - ${CONTROL_BAR_HEIGHT}px)`,
      color: SCENE_COLORS[sceneNameRef.current],
      background: tintedBg(SCENE_COLORS[sceneNameRef.current]),
      transition: 'opacity 0.4s ease, color 0.6s ease',
    })
    mountRef.current.appendChild(effect.domElement)
    effectRef.current = effect

    // Load initial scene module
    const mod = createScene(sceneNameRef.current)
    mod.init(threeScene, camera)
    moduleRef.current = mod

    // Animation loop
    let time = 0
    function loop() {
      animFrameRef.current = requestAnimationFrame(loop)
      const delta = clockRef.current.getDelta()
      time += delta
      moduleRef.current?.animate(delta, time)
      effectRef.current?.render(threeSceneRef.current!, cameraRef.current!)
    }
    loop()

    // Resize handler
    function onResize() {
      const nw = window.innerWidth
      const nh = window.innerHeight - CONTROL_BAR_HEIGHT
      cameraRef.current!.aspect = nw / nh
      cameraRef.current!.updateProjectionMatrix()
      rendererRef.current!.setSize(nw, nh)
      effectRef.current!.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', onResize)
      moduleRef.current?.dispose()
      effect.domElement.remove()
      renderer.dispose()
      rendererRef.current = null
      effectRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle scene changes
  useEffect(() => {
    if (!rendererRef.current || !threeSceneRef.current || !cameraRef.current || !mountRef.current) return
    if (scene === sceneNameRef.current) return
    sceneNameRef.current = scene

    cancelAnimationFrame(animFrameRef.current)

    // Fade out
    if (effectRef.current) {
      effectRef.current.domElement.style.opacity = '0'
    }

    setTimeout(() => {
      if (!rendererRef.current || !threeSceneRef.current || !cameraRef.current || !mountRef.current) return

      // Dispose old scene content
      moduleRef.current?.dispose()
      while (threeSceneRef.current.children.length > 0) {
        threeSceneRef.current.remove(threeSceneRef.current.children[0])
      }

      // Rebuild AsciiEffect with new charset
      const oldEl = effectRef.current?.domElement
      if (oldEl) oldEl.remove()

      const w = window.innerWidth
      const h = window.innerHeight - CONTROL_BAR_HEIGHT
      const newEffect = new AsciiEffect(rendererRef.current, SCENE_CHARSETS[scene], {
        invert: true,
        resolution: ASCII_RESOLUTION,
      })
      newEffect.setSize(w, h)
      Object.assign(newEffect.domElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: `calc(100vh - ${CONTROL_BAR_HEIGHT}px)`,
        color: SCENE_COLORS[scene],
        background: tintedBg(SCENE_COLORS[scene]),
        opacity: '0',
        transition: 'opacity 0.4s ease',
      })
      mountRef.current.appendChild(newEffect.domElement)
      effectRef.current = newEffect

      // Init new scene
      const mod = createScene(scene)
      mod.init(threeSceneRef.current, cameraRef.current)
      moduleRef.current = mod

      // Restart loop
      let time = 0
      clockRef.current = new THREE.Clock()
      function loop() {
        animFrameRef.current = requestAnimationFrame(loop)
        const delta = clockRef.current.getDelta()
        time += delta
        moduleRef.current?.animate(delta, time)
        effectRef.current?.render(threeSceneRef.current!, cameraRef.current!)
      }
      loop()

      // Fade in
      requestAnimationFrame(() => {
        if (effectRef.current) effectRef.current.domElement.style.opacity = '1'
      })
    }, 400)
  }, [scene])

  return (
    <div
      ref={mountRef}
      className="absolute inset-x-0 top-0"
      style={{ height: `calc(100vh - ${CONTROL_BAR_HEIGHT}px)`, background: '#0a0a0a' /* tinted per-effect */}}
    />
  )
}
