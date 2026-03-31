import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createBeachScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let seagullGeo: THREE.BufferGeometry | null = null
  const seagullPos = new Float32Array(50 * 3)
  const seagullVel = new Float32Array(50 * 3)
  const waveBars: THREE.Mesh[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x050d18, 0.022)

    const ambient = new THREE.AmbientLight(0xfff5cc, 0.18)
    scene.add(ambient)

    const sunLight = new THREE.DirectionalLight(0xfff0a0, 1.6)
    sunLight.position.set(5, 14, 4)
    scene.add(sunLight)

    // Sky dome — dark at top, fades to fog at horizon
    const skyGeo = new THREE.SphereGeometry(55, 16, 10)
    const skyMat = new THREE.MeshLambertMaterial({ color: 0x050d18, side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)
    objects.push(sky)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Sandy beach ground — large to fill portrait viewports
    const beachGeo = new THREE.PlaneGeometry(60, 50)
    const beach = new THREE.Mesh(beachGeo, new THREE.MeshLambertMaterial({ color: 0xd9c28e }))
    beach.rotation.x = -Math.PI / 2
    scene.add(beach)
    objects.push(beach)

    // Ocean plane behind wave bars
    const oceanGeo = new THREE.PlaneGeometry(60, 30)
    const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshLambertMaterial({ color: 0x1a7fb5 }))
    ocean.rotation.x = -Math.PI / 2
    ocean.position.set(0, 0.01, -14)
    scene.add(ocean)
    objects.push(ocean)

    // Distant horizon plane
    const horizonGeo = new THREE.PlaneGeometry(60, 8)
    const horizon = new THREE.Mesh(horizonGeo, new THREE.MeshLambertMaterial({ color: 0x5ab4e0 }))
    horizon.position.set(0, 2, -25)
    scene.add(horizon)
    objects.push(horizon)

    // Sun sphere high up (emissive)
    const sunGeo = new THREE.SphereGeometry(1.2, 16, 12)
    const sunMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffee88, emissiveIntensity: 1.0 })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    sun.position.set(8, 12, -22)
    scene.add(sun)
    objects.push(sun)

    // Wave bars — rows of thin boxes that animate up/down
    const waveRowCount = 8
    const waveBarsPerRow = 20
    for (let row = 0; row < waveRowCount; row++) {
      for (let col = 0; col < waveBarsPerRow; col++) {
        const waveGeo = new THREE.BoxGeometry(2.8, 0.18, 0.35)
        const waveMat = new THREE.MeshLambertMaterial({ color: 0x4aafd4 })
        const wave = new THREE.Mesh(waveGeo, waveMat)
        wave.position.set(
          (col - waveBarsPerRow / 2) * 3.0,
          0.09,
          -2 - row * 1.4
        )
        wave.userData = { row, col, baseY: 0.09 }
        scene.add(wave)
        objects.push(wave)
        waveBars.push(wave)
      }
    }

    // Foam crest bars along the nearest wave row
    for (let col = 0; col < waveBarsPerRow; col++) {
      const foamGeo = new THREE.BoxGeometry(2.6, 0.12, 0.2)
      const foamMat = new THREE.MeshLambertMaterial({ color: 0xf0f8ff })
      const foam = new THREE.Mesh(foamGeo, foamMat)
      foam.position.set((col - waveBarsPerRow / 2) * 3.0, 0.3, -1.2)
      foam.userData = { isFoam: true, col, baseY: 0.3 }
      scene.add(foam)
      objects.push(foam)
      waveBars.push(foam)
    }

    // Towel rectangles on sand
    const towelColors = [0xe84040, 0x4080e8, 0xe8c040, 0x40c850]
    const towelData = [
      { x: -3.5, z: 3.0, rot: 0.15 },
      { x: 0.5, z: 2.5, rot: -0.1 },
      { x: 3.8, z: 3.4, rot: 0.3 },
      { x: -1.0, z: 4.5, rot: -0.2 },
    ]
    towelData.forEach((t, i) => {
      const towelGeo = new THREE.BoxGeometry(1.4, 0.03, 0.8)
      const towelMat = new THREE.MeshLambertMaterial({ color: towelColors[i % towelColors.length] })
      const towel = new THREE.Mesh(towelGeo, towelMat)
      towel.position.set(t.x, 0.015, t.z)
      towel.rotation.y = t.rot
      scene.add(towel)
      objects.push(towel)
    })

    // Beach umbrellas
    const umbrellaData = [
      { x: -3.2, z: 2.4 },
      { x: 1.2, z: 2.0 },
      { x: 4.5, z: 2.8 },
    ]
    umbrellaData.forEach(u => {
      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8)
      const pole = new THREE.Mesh(poleGeo, mat.clone())
      pole.position.set(u.x, 1.1, u.z)
      scene.add(pole)
      objects.push(pole)

      // Canopy (cone)
      const canopyGeo = new THREE.ConeGeometry(0.85, 0.55, 12)
      const canopyMat = new THREE.MeshLambertMaterial({ color: 0xff6633 })
      const canopy = new THREE.Mesh(canopyGeo, canopyMat)
      canopy.position.set(u.x, 2.45, u.z)
      scene.add(canopy)
      objects.push(canopy)

      // Canopy stripes (inner cone slightly smaller)
      const stripesGeo = new THREE.ConeGeometry(0.78, 0.52, 12)
      const stripesMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const stripes = new THREE.Mesh(stripesGeo, stripesMat)
      stripes.position.set(u.x, 2.44, u.z)
      scene.add(stripes)
      objects.push(stripes)
    })

    // Sandcastles
    const castlePositions = [{ x: 2.0, z: 5.5 }, { x: -4.5, z: 5.0 }]
    castlePositions.forEach(c => {
      // Base
      const baseGeo = new THREE.BoxGeometry(0.6, 0.35, 0.6)
      const base = new THREE.Mesh(baseGeo, new THREE.MeshLambertMaterial({ color: 0xc8a85a }))
      base.position.set(c.x, 0.175, c.z)
      scene.add(base)
      objects.push(base)

      // Tower
      const towerGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.45, 8)
      const tower = new THREE.Mesh(towerGeo, new THREE.MeshLambertMaterial({ color: 0xd4b06a }))
      tower.position.set(c.x, 0.575, c.z)
      scene.add(tower)
      objects.push(tower)

      // Cone top
      const topGeo = new THREE.ConeGeometry(0.16, 0.25, 8)
      const top = new THREE.Mesh(topGeo, new THREE.MeshLambertMaterial({ color: 0xe8c888 }))
      top.position.set(c.x, 0.925, c.z)
      scene.add(top)
      objects.push(top)
    })

    // Beach ball
    const ballGeo = new THREE.SphereGeometry(0.2, 14, 10)
    const ball = new THREE.Mesh(ballGeo, new THREE.MeshLambertMaterial({ color: 0xff3030 }))
    ball.position.set(-1.8, 0.2, 4.0)
    scene.add(ball)
    objects.push(ball)

    // Rock clusters along waterline
    const rockData = [
      { x: -7, z: -0.5, s: 0.3 }, { x: -5.5, z: -1, s: 0.2 }, { x: 6, z: -0.8, s: 0.35 },
      { x: 7.5, z: -1.2, s: 0.25 }, { x: -9, z: 0.2, s: 0.4 }, { x: 5, z: 0.5, s: 0.18 },
    ]
    rockData.forEach(r => {
      const rockGeo = new THREE.DodecahedronGeometry(r.s, 0)
      const rock = new THREE.Mesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0x888880 }))
      rock.position.set(r.x, r.s * 0.4, r.z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      scene.add(rock)
      objects.push(rock)
    })

    // Seagull particles
    for (let i = 0; i < 50; i++) {
      seagullPos[i * 3 + 0] = (Math.random() - 0.5) * 30
      seagullPos[i * 3 + 1] = 3 + Math.random() * 6
      seagullPos[i * 3 + 2] = -5 - Math.random() * 15
      seagullVel[i * 3 + 0] = (Math.random() - 0.5) * 1.5
      seagullVel[i * 3 + 1] = 0
      seagullVel[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }
    seagullGeo = new THREE.BufferGeometry()
    seagullGeo.setAttribute('position', new THREE.BufferAttribute(seagullPos, 3))
    const seagullMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, transparent: true, opacity: 0.9 })
    const seagulls = new THREE.Points(seagullGeo, seagullMat)
    scene.add(seagulls)
    objects.push(seagulls)

    cam.position.set(0, 2, 10)
    cam.lookAt(0, 0.5, -3)
  }

  function animate(delta: number, time: number) {
    if (!camera || !seagullGeo) return

    // Camera gentle drift
    camera.position.x = Math.sin(time * 0.09) * 0.8
    camera.position.y = 2 + Math.sin(time * 0.07) * 0.15
    camera.lookAt(0, 0.5, -3)

    // Wave bars oscillate with sin
    waveBars.forEach(bar => {
      const { row, col, baseY, isFoam } = bar.userData
      if (isFoam) {
        bar.position.y = baseY + Math.sin(time * 1.4 + (col as number) * 0.3) * 0.12
      } else {
        const r = row as number
        const c = col as number
        bar.position.y = baseY + Math.sin(time * 1.2 + c * 0.28 + r * 0.9) * (0.1 + r * 0.025)
        bar.scale.y = 1 + Math.sin(time * 1.2 + c * 0.28 + r * 0.9) * 0.4
      }
    })

    // Seagull particles arc and drift
    for (let i = 0; i < 50; i++) {
      seagullPos[i * 3 + 0] += seagullVel[i * 3 + 0] * delta
      seagullPos[i * 3 + 1] = (seagullPos[i * 3 + 1] || 6) + Math.sin(time * 0.8 + i * 0.7) * delta * 0.3
      seagullPos[i * 3 + 2] += seagullVel[i * 3 + 2] * delta

      // Wrap horizontally
      if (seagullPos[i * 3 + 0] > 18) seagullPos[i * 3 + 0] = -18
      if (seagullPos[i * 3 + 0] < -18) seagullPos[i * 3 + 0] = 18
      // Keep altitude in range
      if (seagullPos[i * 3 + 1] > 11) seagullPos[i * 3 + 1] = 3
      if (seagullPos[i * 3 + 1] < 2.5) seagullPos[i * 3 + 1] = 3
    }
    ;(seagullGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
  }

  function dispose() {
    objects.forEach(o => {
      o.traverse(child => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
          else (child.material as THREE.Material).dispose()
        }
      })
    })
    objects.length = 0
    waveBars.length = 0
    seagullGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
