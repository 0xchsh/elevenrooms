import { AUDIO_CONFIG } from '@/lib/audio/audioConfig'
import type { SceneName, LayerStep } from '@/lib/three/types'

interface LoadedScene {
  buffers: (AudioBuffer | null)[]
  sources: (AudioBufferSourceNode | null)[]
  gains: GainNode[]
  // Baseline gain per layer (0 or 1 depending on layerStep, before intermittent override)
  baseGains: number[]
}

export class AudioEngine {
  private ctx: AudioContext
  private masterGain: GainNode
  private scenes: Map<SceneName, LoadedScene> = new Map()
  private activeScene: SceneName | null = null
  private intermittentTimers: ReturnType<typeof setTimeout>[] = []
  private currentLayerStep: LayerStep = 4

  constructor() {
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.8
    this.masterGain.connect(this.ctx.destination)
  }

  async resume() {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
  }

  private async fetchBuffer(src: string): Promise<AudioBuffer> {
    const res = await fetch(src)
    const arrayBuffer = await res.arrayBuffer()
    return this.ctx.decodeAudioData(arrayBuffer)
  }

  private async preloadScene(name: SceneName): Promise<void> {
    const layers = AUDIO_CONFIG[name]
    const buffers: (AudioBuffer | null)[] = []

    for (const layer of layers) {
      try {
        const buf = await this.fetchBuffer(layer.src)
        buffers.push(buf)
      } catch {
        console.warn(`Failed to load audio: ${layer.src}`)
        buffers.push(null)
      }
    }

    const gains = layers.map(() => {
      const g = this.ctx.createGain()
      g.gain.value = 1
      g.connect(this.masterGain)
      return g
    })

    this.scenes.set(name, {
      buffers,
      sources: new Array(layers.length).fill(null),
      gains,
      baseGains: new Array(layers.length).fill(1),
    })
  }

  private clearIntermittentTimers() {
    this.intermittentTimers.forEach(t => clearTimeout(t))
    this.intermittentTimers = []
  }

  private scheduleIntermittentLayer(name: SceneName, layerIndex: number) {
    const config = AUDIO_CONFIG[name][layerIndex].intermittent
    if (!config) return

    const loaded = this.scenes.get(name)
    if (!loaded) return

    const { burstDuration, intervalMin, intervalMax, burstGain, fadeTime } = config
    const gain = loaded.gains[layerIndex]

    // Start silent
    gain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime)

    const scheduleBurst = () => {
      if (this.activeScene !== name) return

      const loaded = this.scenes.get(name)
      if (!loaded) return

      // Only burst if layer is active (within current step)
      const isActive = layerIndex < this.currentLayerStep
      if (isActive) {
        // Fade in
        loaded.gains[layerIndex].gain.setTargetAtTime(burstGain, this.ctx.currentTime, fadeTime)

        // Fade out after burst duration
        const fadeOut = setTimeout(() => {
          if (this.activeScene !== name) return
          const l = this.scenes.get(name)
          if (l) l.gains[layerIndex].gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime)
        }, burstDuration * 1000)
        this.intermittentTimers.push(fadeOut)
      }

      // Schedule next burst
      const nextInterval = (intervalMin + Math.random() * (intervalMax - intervalMin)) * 1000
      const next = setTimeout(scheduleBurst, nextInterval)
      this.intermittentTimers.push(next)
    }

    // First burst after a random initial delay
    const initialDelay = (intervalMin * 0.5 + Math.random() * intervalMin) * 1000
    const first = setTimeout(scheduleBurst, initialDelay)
    this.intermittentTimers.push(first)
  }

  private stopScene(name: SceneName) {
    const loaded = this.scenes.get(name)
    if (!loaded) return
    loaded.sources.forEach(src => {
      if (src) {
        try { src.stop(0) } catch {}
        src.disconnect()
      }
    })
    loaded.sources = new Array(loaded.sources.length).fill(null)
    loaded.gains.forEach(g => g.disconnect())
    loaded.gains.forEach(g => g.connect(this.masterGain))
  }

  async setScene(name: SceneName): Promise<void> {
    await this.resume()

    this.clearIntermittentTimers()

    if (this.activeScene && this.activeScene !== name) {
      this.stopScene(this.activeScene)
    }

    if (!this.scenes.has(name)) {
      await this.preloadScene(name)
    }

    const loaded = this.scenes.get(name)!

    loaded.buffers.forEach((buf, i) => {
      if (!buf) return
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      src.connect(loaded.gains[i])
      src.start(0)
      loaded.sources[i] = src
    })

    this.activeScene = name

    // Start intermittent schedulers for any flagged layers
    AUDIO_CONFIG[name].forEach((layer, i) => {
      if (layer.intermittent) {
        this.scheduleIntermittentLayer(name, i)
      }
    })
  }

  setLayerStep(step: LayerStep): void {
    this.currentLayerStep = step
    if (!this.activeScene) return
    const loaded = this.scenes.get(this.activeScene)
    if (!loaded) return

    AUDIO_CONFIG[this.activeScene].forEach((layer, i) => {
      const active = i < step
      if (layer.intermittent) {
        // Intermittent layers: only allow bursts if active; if deactivated, silence immediately
        if (!active) {
          loaded.gains[i].gain.setTargetAtTime(0, this.ctx.currentTime, 0.3)
        }
        // If re-activated, the next scheduled burst will fire naturally
      } else {
        loaded.gains[i].gain.setTargetAtTime(active ? 1 : 0, this.ctx.currentTime, 0.3)
      }
    })
  }

  setMasterVolume(volume: number): void {
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
  }

  destroy() {
    this.clearIntermittentTimers()
    if (this.activeScene) this.stopScene(this.activeScene)
    this.ctx.close()
  }
}
