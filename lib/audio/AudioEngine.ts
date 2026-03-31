import { AUDIO_CONFIG } from '@/lib/audio/audioConfig'
import type { SceneName, LayerStep } from '@/lib/three/types'

const CROSSFADE = 2.5 // seconds of overlap between segments

interface LayerState {
  buf: AudioBuffer
  outputGain: GainNode              // controlled by layer step (0 or 1)
  activeSources: { node: AudioBufferSourceNode; srcGain: GainNode }[]
  nextTimer: ReturnType<typeof setTimeout> | null
}

export class AudioEngine {
  private ctx: AudioContext
  private masterGain: GainNode
  private layerStates: Map<string, LayerState> = new Map()
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
    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  private async fetchBuffer(src: string): Promise<AudioBuffer> {
    const res = await fetch(src)
    const arrayBuffer = await res.arrayBuffer()
    return this.ctx.decodeAudioData(arrayBuffer)
  }

  // ── Looping engine ────────────────────────────────────────────────────────

  private playSegment(layerId: string, state: LayerState, offset: number) {
    const { buf, outputGain, activeSources } = state
    const remaining = buf.duration - offset

    // Spawn source node
    const node = this.ctx.createBufferSource()
    node.buffer = buf
    // Subtle pitch variation so repeated segments never sound identical
    node.playbackRate.value = 0.985 + Math.random() * 0.03

    const srcGain = this.ctx.createGain()
    srcGain.gain.setValueAtTime(0, this.ctx.currentTime)
    srcGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + CROSSFADE)
    node.connect(srcGain)
    srcGain.connect(outputGain)
    node.start(this.ctx.currentTime, offset)

    activeSources.push({ node, srcGain })

    // Schedule the crossfade into the next segment
    const crossfadeAt = Math.max(0, (remaining - CROSSFADE) * 1000)
    const timer = setTimeout(() => {
      if (!this.layerStates.has(layerId)) return

      // Fade this segment out
      srcGain.gain.setValueAtTime(srcGain.gain.value, this.ctx.currentTime)
      srcGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + CROSSFADE)

      // Clean up this source after fade
      setTimeout(() => {
        try { node.stop(0) } catch {}
        node.disconnect()
        srcGain.disconnect()
        const s = this.layerStates.get(layerId)
        if (s) s.activeSources = s.activeSources.filter(x => x.node !== node)
      }, CROSSFADE * 1200)

      // Start next segment at a random offset (bias toward first 60% to avoid silence near end)
      const nextOffset = Math.random() * buf.duration * 0.65
      this.playSegment(layerId, state, nextOffset)
    }, crossfadeAt)

    state.nextTimer = timer
  }

  private startLayerLoop(name: SceneName, layerIndex: number, buf: AudioBuffer) {
    const layerId = `${name}-${layerIndex}`

    const outputGain = this.ctx.createGain()
    outputGain.gain.value = layerIndex < this.currentLayerStep ? 1 : 0
    outputGain.connect(this.masterGain)

    const state: LayerState = { buf, outputGain, activeSources: [], nextTimer: null }
    this.layerStates.set(layerId, state)

    // Random start so layers don't all hit their seams at the same time
    const initialOffset = Math.random() * buf.duration * 0.65
    this.playSegment(layerId, state, initialOffset)
  }

  private stopLayer(layerId: string) {
    const state = this.layerStates.get(layerId)
    if (!state) return
    if (state.nextTimer) clearTimeout(state.nextTimer)
    state.activeSources.forEach(({ node, srcGain }) => {
      try { node.stop(0) } catch {}
      node.disconnect()
      srcGain.disconnect()
    })
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

    // Start silent
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
      const next = setTimeout(scheduleBurst, nextInterval)
      this.intermittentTimers.push(next)
    }

    const initialDelay = (intervalMin * 0.5 + Math.random() * intervalMin) * 1000
    this.intermittentTimers.push(setTimeout(scheduleBurst, initialDelay))
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async setScene(name: SceneName): Promise<void> {
    await this.resume()
    this.clearIntermittentTimers()

    // Stop all layers from old scene
    if (this.activeScene && this.activeScene !== name) {
      AUDIO_CONFIG[this.activeScene].forEach((_, i) => {
        this.stopLayer(`${this.activeScene}-${i}`)
      })
    }

    this.activeScene = name
    const layers = AUDIO_CONFIG[name]

    for (let i = 0; i < layers.length; i++) {
      const layerId = `${name}-${i}`
      // Skip if already running (scene revisit)
      if (this.layerStates.has(layerId)) continue
      try {
        const buf = await this.fetchBuffer(layers[i].src)
        this.startLayerLoop(name, i, buf)
      } catch {
        console.warn(`Failed to load audio: ${layers[i].src}`)
      }
    }

    // Start intermittent schedulers
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
      if (layer.intermittent) {
        if (!active) state.outputGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3)
        // Re-activation is handled naturally by the next scheduled burst
      } else {
        state.outputGain.gain.setTargetAtTime(active ? 1 : 0, this.ctx.currentTime, 0.3)
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
    this.ctx.close()
  }
}
