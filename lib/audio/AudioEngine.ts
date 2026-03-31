import { AUDIO_CONFIG } from '@/lib/audio/audioConfig'
import type { SceneName, LayerStep } from '@/lib/three/types'

interface LayerState {
  el: HTMLAudioElement
  outputGain: GainNode
}

export class AudioEngine {
  private ctx: AudioContext
  private masterGain: GainNode
  private layerStates: Map<string, LayerState> = new Map()
  private activeScene: SceneName | null = null
  private intermittentTimers: ReturnType<typeof setTimeout>[] = []
  private currentLayerStep: LayerStep = 4
  // Audio elements pre-created synchronously in the gesture handler
  private pendingEls: Map<string, HTMLAudioElement> = new Map()

  constructor(initialScene: SceneName) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new AC()
    void this.ctx.resume()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.8
    this.masterGain.connect(this.ctx.destination)
    // Re-resume if iOS suspends (phone calls, backgrounding, etc.)
    this.ctx.addEventListener('statechange', () => {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
    })
    // Pre-create and start all audio elements synchronously within the user
    // gesture handler — iOS Safari requires play() to be called in a gesture
    AUDIO_CONFIG[initialScene].forEach((layer, i) => {
      const el = new Audio(layer.src)
      el.loop = true
      el.preload = 'auto'
      void el.play()
      this.pendingEls.set(`${initialScene}-${i}`, el)
    })
  }

  async resume() {
    if (this.ctx.state !== 'running') await this.ctx.resume()
  }

  private stopLayer(layerId: string) {
    const state = this.layerStates.get(layerId)
    if (!state) return
    state.el.pause()
    state.el.src = ''
    state.outputGain.disconnect()
    this.layerStates.delete(layerId)
  }

  // ── Intermittent scheduler ────────────────────────────────────────────────

  private clearIntermittentTimers() {
    this.intermittentTimers.forEach(t => clearTimeout(t))
    this.intermittentTimers = []
  }

  private scheduleIntermittentLayer(name: SceneName, layerIndex: number) {
    const config = AUDIO_CONFIG[name][layerIndex].intermittent
    if (!config) return

    const { burstDuration, intervalMin, intervalMax, burstGain, fadeTime } = config
    const layerId = `${name}-${layerIndex}`

    const getOutputGain = () => this.layerStates.get(layerId)?.outputGain ?? null

    getOutputGain()?.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime)

    const scheduleBurst = () => {
      if (this.activeScene !== name) return
      const g = getOutputGain()
      if (!g) return

      if (layerIndex < this.currentLayerStep) {
        g.gain.setTargetAtTime(burstGain, this.ctx.currentTime, fadeTime)
        const fadeOut = setTimeout(() => {
          if (this.activeScene !== name) return
          getOutputGain()?.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime)
        }, burstDuration * 1000)
        this.intermittentTimers.push(fadeOut)
      }

      const nextInterval = (intervalMin + Math.random() * (intervalMax - intervalMin)) * 1000
      this.intermittentTimers.push(setTimeout(scheduleBurst, nextInterval))
    }

    const initialDelay = (intervalMin * 0.5 + Math.random() * intervalMin) * 1000
    this.intermittentTimers.push(setTimeout(scheduleBurst, initialDelay))
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async setScene(name: SceneName): Promise<void> {
    await this.resume()
    this.clearIntermittentTimers()

    if (this.activeScene && this.activeScene !== name) {
      AUDIO_CONFIG[this.activeScene].forEach((_, i) => {
        this.stopLayer(`${this.activeScene}-${i}`)
      })
    }

    this.activeScene = name
    const layers = AUDIO_CONFIG[name]

    for (let i = 0; i < layers.length; i++) {
      const layerId = `${name}-${i}`
      if (this.layerStates.has(layerId)) continue

      const config = layers[i]
      const baseGain = config.baseGain ?? 1
      const active = i < this.currentLayerStep && !config.intermittent

      // Use the pre-created element (started in gesture) or create a new one
      const pendingEl = this.pendingEls.get(layerId)
      this.pendingEls.delete(layerId)
      const el = pendingEl ?? new Audio(config.src)
      el.loop = true
      if (!pendingEl) void el.play().catch(() => {})

      const source = this.ctx.createMediaElementSource(el)
      const outputGain = this.ctx.createGain()
      outputGain.gain.value = active ? baseGain : 0
      source.connect(outputGain)
      outputGain.connect(this.masterGain)

      this.layerStates.set(layerId, { el, outputGain })
    }

    layers.forEach((layer, i) => {
      if (layer.intermittent) this.scheduleIntermittentLayer(name, i)
    })
  }

  setLayerStep(step: LayerStep): void {
    this.currentLayerStep = step
    if (!this.activeScene) return

    AUDIO_CONFIG[this.activeScene].forEach((layer, i) => {
      const layerId = `${this.activeScene}-${i}`
      const state = this.layerStates.get(layerId)
      if (!state) return

      const active = i < step
      const baseGain = layer.baseGain ?? 1
      if (layer.intermittent) {
        if (!active) state.outputGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3)
      } else {
        state.outputGain.gain.setTargetAtTime(active ? baseGain : 0, this.ctx.currentTime, 0.3)
      }
    })
  }

  setMasterVolume(volume: number): void {
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
  }

  destroy() {
    this.clearIntermittentTimers()
    if (this.activeScene) {
      AUDIO_CONFIG[this.activeScene].forEach((_, i) => {
        this.stopLayer(`${this.activeScene}-${i}`)
      })
    }
    this.pendingEls.forEach(el => { el.pause(); el.src = '' })
    this.pendingEls.clear()
    this.ctx.close()
  }
}
