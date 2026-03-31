import type { SceneName } from '@/lib/three/types'

export interface LayerConfig {
  id: string
  src: string
  label: string
  prompt: string
  // If set, layer plays in bursts rather than continuously
  intermittent?: {
    burstDuration: number   // seconds the burst lasts
    intervalMin: number     // min seconds between bursts
    intervalMax: number     // max seconds between bursts
    burstGain: number       // gain during burst (0-1)
    fadeTime: number        // fade in/out time constant
  }
}

export const AUDIO_CONFIG: Record<SceneName, LayerConfig[]> = {
  city: [
    {
      id: 'city-1',
      src: '/audio/city/layer1.mp3',
      label: 'Traffic',
      prompt: 'heavy city traffic ambience, cars passing, engine rumble, urban soundscape',
    },
    {
      id: 'city-2',
      src: '/audio/city/layer2.mp3',
      label: 'Crowd',
      prompt: 'busy street crowd, people talking and walking, urban pedestrians',
    },
    {
      id: 'city-3',
      src: '/audio/city/layer3.mp3',
      label: 'Rain',
      prompt: 'rain falling on city streets, steady light rain, wet pavement ambience',
    },
    {
      id: 'city-4',
      src: '/audio/city/layer4.mp3',
      label: 'Sirens',
      prompt: 'distant police and ambulance sirens, city emergency vehicles in the distance',
    },
  ],
  cafe: [
    {
      id: 'cafe-1',
      src: '/audio/cafe/layer1.mp3',
      label: 'Jazz',
      prompt: 'soft jazz piano background music, warm intimate cafe ambience',
    },
    {
      id: 'cafe-2',
      src: '/audio/cafe/layer2.mp3',
      label: 'Crowd',
      prompt: 'busy coffee shop crowd, murmuring conversations, social cafe atmosphere',
    },
    {
      id: 'cafe-3',
      src: '/audio/cafe/layer3.mp3',
      label: 'Machine',
      prompt: 'espresso machine steaming and hissing, coffee grinder sounds, barista equipment',
      intermittent: {
        burstDuration: 3,
        intervalMin: 14,
        intervalMax: 24,
        burstGain: 0.85,
        fadeTime: 0.4,
      },
    },
    {
      id: 'cafe-4',
      src: '/audio/cafe/layer4.mp3',
      label: 'Cups',
      prompt: 'cups and saucers clinking, coffee shop dishes, ceramic sounds in a cafe',
    },
  ],
  nature: [
    {
      id: 'nature-1',
      src: '/audio/nature/layer1.mp3',
      label: 'Birds',
      prompt: 'birds chirping, morning bird song, peaceful forest ambience',
    },
    {
      id: 'nature-2',
      src: '/audio/nature/layer2.mp3',
      label: 'Wind',
      prompt: 'wind through trees, gentle rustling leaves, outdoor breeze in a forest',
    },
    {
      id: 'nature-3',
      src: '/audio/nature/layer3.mp3',
      label: 'Stream',
      prompt: 'babbling brook, stream water flowing over rocks, gentle river ambience',
    },
    {
      id: 'nature-4',
      src: '/audio/nature/layer4.mp3',
      label: 'Crickets',
      prompt: 'crickets and night insects chirping, evening nature sounds, cicadas',
    },
  ],
}
