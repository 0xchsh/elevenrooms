import type * as THREE from 'three'

export type SceneName = 'city' | 'cafe' | 'nature' | 'fireplace' | 'library' | 'barbershop' | 'spacestation' | 'underwater' | 'casino' | 'gym' | 'tennis' | 'ramen' | 'beach' | 'laundromat' | 'club' | 'recordingstudio'

export type LayerStep = 1 | 2 | 3 | 4

export interface SceneModule {
  init(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void
  animate(delta: number, time: number): void
  dispose(): void
}
