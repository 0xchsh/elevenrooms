import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createThunderstormScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let rainGeo: THREE.BufferGeometry | null = null
  const rainPos = new Float32Array(500 * 3)
  const rainVel = new Float32Array(500)
  let lightningLight: THREE.PointLight | null = null
  let lightningTimer = 0
  let lightningDuration = 0
  let lightningInterval = 10
  let curtainMeshes: THREE.Mesh[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x080810, 0.07)

    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.4)
    scene.add(ambient)

    // Dim room light
    const roomLight = new THREE.PointLight(0x2030a0, 0.5, 15)
    roomLight.position.set(0, 3.5, 0)
    scene.add(roomLight)
    objects.push(roomLight)

    // Lightning point light (starts off)
    lightningLight = new THREE.PointLight(0xd0e8ff, 0, 30)
    lightningLight.position.set(0, 4, -4)
    scene.add(lightningLight)
    objects.push(lightningLight)

    // Randomize first lightning strike time
    lightningInterval = 8 + Math.random() * 7

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Dark floor
    const floorGeo = new THREE.PlaneGeometry(60, 50)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x0d0d0d }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(14, 7)
    const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshLambertMaterial({ color: 0x0a0a12 }))
    backWall.position.set(0, 3.5, -5)
    scene.add(backWall)
    objects.push(backWall)

    // Left wall
    const leftWallGeo = new THREE.PlaneGeometry(12, 7)
    const leftWall = new THREE.Mesh(leftWallGeo, new THREE.MeshLambertMaterial({ color: 0x090911 }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-6, 3.5, -1)
    scene.add(leftWall)
    objects.push(leftWall)

    // Right wall
    const rightWallGeo = new THREE.PlaneGeometry(12, 7)
    const rightWall = new THREE.Mesh(rightWallGeo, new THREE.MeshLambertMaterial({ color: 0x090911 }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(6, 3.5, -1)
    scene.add(rightWall)
    objects.push(rightWall)

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(14, 12)
    const ceiling = new THREE.Mesh(ceilingGeo, new THREE.MeshLambertMaterial({ color: 0x080810 }))
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(0, 7, -1)
    scene.add(ceiling)
    objects.push(ceiling)

    // Window frame on back wall
    const windowFrameParts = [
      { w: 2.6, h: 0.12, d: 0.12, x: 0, y: 4.3, z: -4.88 },  // top
      { w: 2.6, h: 0.12, d: 0.12, x: 0, y: 1.8, z: -4.88 },  // bottom
      { w: 0.12, h: 2.6, d: 0.12, x: -1.27, y: 3.05, z: -4.88 }, // left
      { w: 0.12, h: 2.6, d: 0.12, x: 1.27, y: 3.05, z: -4.88 },  // right
      { w: 0.08, h: 2.6, d: 0.08, x: 0, y: 3.05, z: -4.88 },    // center vertical
      { w: 2.6, h: 0.08, d: 0.08, x: 0, y: 3.05, z: -4.88 },    // center horizontal
    ]
    windowFrameParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Window glass pane (dim, slightly visible)
    const glassGeo = new THREE.PlaneGeometry(2.4, 2.4)
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x1a2a40, transparent: true, opacity: 0.5, side: THREE.DoubleSide
    })
    const glass = new THREE.Mesh(glassGeo, glassMat)
    glass.position.set(0, 3.05, -4.87)
    scene.add(glass)
    objects.push(glass)

    // Curtains — thin planes flanking the window
    const curtainData = [
      { x: -1.8, z: -4.6, rotY: 0.18 },
      { x: 1.8, z: -4.6, rotY: -0.18 },
    ]
    curtainData.forEach(c => {
      const curtainGeo = new THREE.PlaneGeometry(0.9, 3.2)
      const curtainMat = new THREE.MeshLambertMaterial({
        color: 0x1a1a2e, side: THREE.DoubleSide
      })
      const curtain = new THREE.Mesh(curtainGeo, curtainMat)
      curtain.position.set(c.x, 3.2, c.z)
      curtain.rotation.y = c.rotY
      scene.add(curtain)
      objects.push(curtain)
      curtainMeshes.push(curtain)
    })

    // Couch silhouette
    const couchParts = [
      { w: 3.4, h: 0.45, d: 1.1, x: 0, y: 0.225, z: 3.0 },
      { w: 3.4, h: 0.85, d: 0.28, x: 0, y: 0.75, z: 3.55 },
      { w: 0.28, h: 0.85, d: 1.1, x: -1.7, y: 0.425, z: 3.0 },
      { w: 0.28, h: 0.85, d: 1.1, x: 1.7, y: 0.425, z: 3.0 },
    ]
    couchParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Coffee table in front of couch
    const tableTopGeo = new THREE.BoxGeometry(1.4, 0.06, 0.7)
    const tableTop = new THREE.Mesh(tableTopGeo, mat.clone())
    tableTop.position.set(0, 0.42, 1.8)
    scene.add(tableTop)
    objects.push(tableTop)

    const tableLegPositions = [
      [-0.6, 1.45], [0.6, 1.45], [-0.6, 2.15], [0.6, 2.15]
    ]
    tableLegPositions.forEach(([lx, lz]) => {
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6)
      const leg = new THREE.Mesh(legGeo, mat.clone())
      leg.position.set(lx, 0.2, lz)
      scene.add(leg)
      objects.push(leg)
    })

    // Lamp in corner
    const lampBaseGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.08, 10)
    const lampBase = new THREE.Mesh(lampBaseGeo, mat.clone())
    lampBase.position.set(-4.5, 0.04, 2.0)
    scene.add(lampBase)
    objects.push(lampBase)

    const lampPoleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8)
    const lampPole = new THREE.Mesh(lampPoleGeo, mat.clone())
    lampPole.position.set(-4.5, 0.79, 2.0)
    scene.add(lampPole)
    objects.push(lampPole)

    const lampShadeGeo = new THREE.ConeGeometry(0.32, 0.36, 12, 1, true)
    const lampShade = new THREE.Mesh(lampShadeGeo, mat.clone())
    lampShade.position.set(-4.5, 1.72, 2.0)
    scene.add(lampShade)
    objects.push(lampShade)

    // Rain particles
    for (let i = 0; i < 500; i++) {
      rainPos[i * 3 + 0] = (Math.random() - 0.5) * 20
      rainPos[i * 3 + 1] = Math.random() * 10
      rainPos[i * 3 + 2] = -4.5 + (Math.random() - 0.5) * 2.5
      rainVel[i] = 6 + Math.random() * 4
    }
    rainGeo = new THREE.BufferGeometry()
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
    const rainMat = new THREE.PointsMaterial({ color: 0x8899bb, size: 0.07, transparent: true, opacity: 0.6 })
    const rain = new THREE.Points(rainGeo, rainMat)
    scene.add(rain)
    objects.push(rain)

    cam.position.set(0, 1.5, 5)
    cam.lookAt(0, 1.2, -1)
  }

  function animate(delta: number, time: number) {
    if (!camera || !rainGeo || !lightningLight) return

    // Camera gentle sway
    camera.position.x = Math.sin(time * 0.08) * 0.3
    camera.position.y = 1.5 + Math.sin(time * 0.11) * 0.05
    camera.lookAt(0, 1.2, -1)

    // Rain particles fall fast, reset at top
    for (let i = 0; i < 500; i++) {
      rainPos[i * 3 + 1] -= rainVel[i] * delta
      // Slight angle drift
      rainPos[i * 3 + 0] += 0.4 * delta
      if (rainPos[i * 3 + 1] < -1) {
        rainPos[i * 3 + 1] = 9 + Math.random() * 2
        rainPos[i * 3 + 0] = (Math.random() - 0.5) * 20
        rainPos[i * 3 + 2] = -4.5 + (Math.random() - 0.5) * 2.5
      }
    }
    ;(rainGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true

    // Curtain sway
    curtainMeshes.forEach((curtain, i) => {
      const sign = i === 0 ? 1 : -1
      curtain.rotation.y = sign * (0.18 + Math.sin(time * 1.1 + i * 1.4) * 0.07)
      curtain.rotation.z = Math.sin(time * 0.9 + i * 0.6) * 0.04
    })

    // Lightning flash logic — fires randomly every 8-15 seconds
    lightningTimer += delta
    if (lightningTimer >= lightningInterval) {
      lightningTimer = 0
      lightningInterval = 8 + Math.random() * 7
      lightningDuration = 0.18 + Math.random() * 0.2
    }
    if (lightningDuration > 0) {
      lightningDuration -= delta
      // Rapid flicker while active
      lightningLight.intensity = lightningDuration > 0
        ? (Math.random() > 0.4 ? 8 + Math.random() * 6 : 0.5)
        : 0
    } else {
      lightningLight.intensity = 0
    }
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
    curtainMeshes = []
    rainGeo = null
    lightningLight = null
    camera = null
  }

  return { init, animate, dispose }
}
