import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

interface SteamSource {
  geo: THREE.BufferGeometry
  positions: Float32Array
  baseX: number
  baseY: number
  baseZ: number
}

export function createRamenScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const steamSources: SteamSource[] = []
  const pendantLights: { light: THREE.PointLight; baseY: number; phase: number }[] = []
  let camera: THREE.PerspectiveCamera | null = null
  const STEAM_COUNT = 150

  function addSteam(scene: THREE.Scene, bx: number, by: number, bz: number) {
    const positions = new Float32Array(STEAM_COUNT * 3)
    for (let i = 0; i < STEAM_COUNT; i++) {
      positions[i * 3 + 0] = bx + (Math.random() - 0.5) * 0.15
      positions[i * 3 + 1] = by + Math.random() * 0.5
      positions[i * 3 + 2] = bz + (Math.random() - 0.5) * 0.15
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const steamMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.055, transparent: true, opacity: 0.22 })
    const pts = new THREE.Points(geo, steamMat)
    scene.add(pts)
    objects.push(pts)
    steamSources.push({ geo, positions, baseX: bx, baseY: by, baseZ: bz })
  }

  function addStool(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Seat top
    const seatGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.06, 14)
    const seat = new THREE.Mesh(seatGeo, mat.clone())
    seat.position.set(x, 0.72, z)
    scene.add(seat)
    objects.push(seat)

    // Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.68, 8)
    const ped = new THREE.Mesh(pedGeo, mat.clone())
    ped.position.set(x, 0.34, z)
    scene.add(ped)
    objects.push(ped)

    // Base feet ring
    const baseGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 14)
    const base = new THREE.Mesh(baseGeo, mat.clone())
    base.position.set(x, 0.02, z)
    scene.add(base)
    objects.push(base)
  }

  function addBowl(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Bowl outer
    const bowlOutGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.1, 14)
    const bowlOut = new THREE.Mesh(bowlOutGeo, mat.clone())
    bowlOut.position.set(x, 1.02, z)
    scene.add(bowlOut)
    objects.push(bowlOut)

    // Bowl inner (liquid surface — flat circle)
    const liquidGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.01, 14)
    const liquidMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.1 })
    const liquid = new THREE.Mesh(liquidGeo, liquidMat)
    liquid.position.set(x, 1.07, z)
    scene.add(liquid)
    objects.push(liquid)

    // Chopsticks (two thin boxes)
    for (let cs = -1; cs <= 1; cs += 2) {
      const chopGeo = new THREE.BoxGeometry(0.01, 0.01, 0.28)
      const chop = new THREE.Mesh(chopGeo, mat.clone())
      chop.position.set(x + cs * 0.04, 1.1, z + 0.04)
      chop.rotation.y = 0.15 * cs
      scene.add(chop)
      objects.push(chop)
    }
  }

  function addPendantLight(scene: THREE.Scene, x: number, z: number, phase: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Cord
    const cordGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.0, 4)
    const cord = new THREE.Mesh(cordGeo, mat.clone())
    cord.position.set(x, 3.3, z)
    scene.add(cord)
    objects.push(cord)

    // Shade (Japanese-style cylinder)
    const shadeGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.28, 10, 1, true)
    const shadeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4 })
    const shade = new THREE.Mesh(shadeGeo, shadeMat)
    shade.position.set(x, 2.72, z)
    scene.add(shade)
    objects.push(shade)

    // Bulb
    const bulbGeo = new THREE.SphereGeometry(0.07, 8, 8)
    const bulbMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 })
    const bulb = new THREE.Mesh(bulbGeo, bulbMat)
    bulb.position.set(x, 2.75, z)
    scene.add(bulb)
    objects.push(bulb)

    const light = new THREE.PointLight(0xffcc88, 1.8, 7)
    light.position.set(x, 2.65, z)
    scene.add(light)
    objects.push(light)
    pendantLights.push({ light, baseY: 2.65, phase })
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x080606, 0.07)

    const ambient = new THREE.AmbientLight(0xffffff, 0.18)
    scene.add(ambient)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // ---- FLOOR ----
    const floorGeo = new THREE.PlaneGeometry(40, 30)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x0c0a08 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Floor tiles
    for (let tx = -8; tx <= 8; tx += 1.4) {
      const tileGeo = new THREE.PlaneGeometry(0.03, 28)
      const tile = new THREE.Mesh(tileGeo, new THREE.MeshLambertMaterial({ color: 0x1a1614 }))
      tile.rotation.x = -Math.PI / 2
      tile.position.set(tx, 0.002, 0)
      scene.add(tile)
      objects.push(tile)
    }
    for (let tz = -6; tz <= 6; tz += 1.4) {
      const tileGeo = new THREE.PlaneGeometry(28, 0.03)
      const tile = new THREE.Mesh(tileGeo, new THREE.MeshLambertMaterial({ color: 0x1a1614 }))
      tile.rotation.x = -Math.PI / 2
      tile.position.set(0, 0.002, tz)
      scene.add(tile)
      objects.push(tile)
    }

    // ---- BACK WALL ----
    const backWallGeo = new THREE.PlaneGeometry(18, 5.5)
    const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshLambertMaterial({ color: 0x0a0806 }))
    backWall.position.set(0, 2.75, -6)
    scene.add(backWall)
    objects.push(backWall)

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(14, 5.5)
    const leftWallMesh = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x0a0806 }))
    leftWallMesh.rotation.y = Math.PI / 2
    leftWallMesh.position.set(-7, 2.75, -1)
    scene.add(leftWallMesh)
    objects.push(leftWallMesh)

    const rightWallMesh = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x0a0806 }))
    rightWallMesh.rotation.y = -Math.PI / 2
    rightWallMesh.position.set(7, 2.75, -1)
    scene.add(rightWallMesh)
    objects.push(rightWallMesh)

    // ---- L-SHAPED COUNTER ----
    // Main front counter segment
    const counterFrontGeo = new THREE.BoxGeometry(8, 1.0, 0.55)
    const counterFront = new THREE.Mesh(counterFrontGeo, mat.clone())
    counterFront.position.set(0, 0.5, -0.8)
    scene.add(counterFront)
    objects.push(counterFront)

    // Counter top
    const cTopGeo = new THREE.BoxGeometry(8.1, 0.06, 0.65)
    const cTop = new THREE.Mesh(cTopGeo, mat.clone())
    cTop.position.set(0, 1.01, -0.8)
    scene.add(cTop)
    objects.push(cTop)

    // Side counter segment (L arm going back)
    const counterSideGeo = new THREE.BoxGeometry(0.55, 1.0, 5.5)
    const counterSide = new THREE.Mesh(counterSideGeo, mat.clone())
    counterSide.position.set(4.23, 0.5, -3.3)
    scene.add(counterSide)
    objects.push(counterSide)

    const cSideTopGeo = new THREE.BoxGeometry(0.65, 0.06, 5.6)
    const cSideTop = new THREE.Mesh(cSideTopGeo, mat.clone())
    cSideTop.position.set(4.23, 1.01, -3.3)
    scene.add(cSideTop)
    objects.push(cSideTop)

    // ---- STOOLS along front counter ----
    for (let i = 0; i < 5; i++) {
      addStool(scene, -3.6 + i * 1.8, 1.4)
    }

    // ---- BOWLS on counter ----
    addBowl(scene, -2.5, -0.25)
    addBowl(scene, 0.2, -0.25)
    addBowl(scene, 2.8, -0.25)

    // Steam from bowls
    addSteam(scene, -2.5, 1.1, -0.25)
    addSteam(scene, 0.2, 1.1, -0.25)
    addSteam(scene, 2.8, 1.1, -0.25)

    // ---- KITCHEN BEHIND COUNTER ----
    // Stove (large box)
    const stoveGeo = new THREE.BoxGeometry(3.2, 0.85, 0.9)
    const stove = new THREE.Mesh(stoveGeo, mat.clone())
    stove.position.set(-1.5, 0.425, -3.5)
    scene.add(stove)
    objects.push(stove)

    // Stove top surface
    const stoveTopGeo = new THREE.BoxGeometry(3.2, 0.04, 0.9)
    const stoveTop = new THREE.Mesh(stoveTopGeo, mat.clone())
    stoveTop.position.set(-1.5, 0.87, -3.5)
    scene.add(stoveTop)
    objects.push(stoveTop)

    // Burner rings
    const burnerPositions: [number, number][] = [[-2.5, -3.5], [-1.5, -3.5], [-0.5, -3.5]]
    burnerPositions.forEach(([bx, bz]) => {
      const burnerGeo = new THREE.TorusGeometry(0.2, 0.03, 6, 16)
      const burner = new THREE.Mesh(burnerGeo, mat.clone())
      burner.rotation.x = Math.PI / 2
      burner.position.set(bx, 0.9, bz)
      scene.add(burner)
      objects.push(burner)
    })

    // Pots on stove
    const potPositions: [number, number][] = [[-2.5, -3.5], [-0.5, -3.5]]
    potPositions.forEach(([px, pz]) => {
      // Pot body
      const potGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.38, 14)
      const pot = new THREE.Mesh(potGeo, mat.clone())
      pot.position.set(px, 1.1, pz)
      scene.add(pot)
      objects.push(pot)

      // Pot lid
      const lidGeo = new THREE.CylinderGeometry(0.24, 0.23, 0.05, 14)
      const lid = new THREE.Mesh(lidGeo, mat.clone())
      lid.position.set(px, 1.31, pz)
      scene.add(lid)
      objects.push(lid)

      // Lid handle
      const lidHandleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.07, 6)
      const lidHandle = new THREE.Mesh(lidHandleGeo, mat.clone())
      lidHandle.position.set(px, 1.375, pz)
      scene.add(lidHandle)
      objects.push(lidHandle)

      // Steam from pots
      addSteam(scene, px, 1.34, pz)
    })

    // Pot handles
    potPositions.forEach(([px, pz]) => {
      const phGeo = new THREE.BoxGeometry(0.3, 0.04, 0.04)
      const ph = new THREE.Mesh(phGeo, mat.clone())
      ph.position.set(px + 0.3, 1.1, pz)
      scene.add(ph)
      objects.push(ph)
    })

    // Shelves above stove
    for (let shelf = 0; shelf < 3; shelf++) {
      const shelfGeo = new THREE.BoxGeometry(3.0, 0.04, 0.3)
      const shelfMesh = new THREE.Mesh(shelfGeo, mat.clone())
      shelfMesh.position.set(-1.5, 1.5 + shelf * 0.55, -5.7)
      scene.add(shelfMesh)
      objects.push(shelfMesh)

      // Items on shelf
      for (let si = 0; si < 5; si++) {
        const itemH = 0.1 + Math.random() * 0.18
        const itemGeo = si % 2 === 0
          ? new THREE.CylinderGeometry(0.055, 0.05, itemH, 8)
          : new THREE.BoxGeometry(0.1, itemH, 0.1)
        const item = new THREE.Mesh(itemGeo, mat.clone())
        item.position.set(-2.5 + si * 0.8, 1.52 + shelf * 0.55 + itemH / 2, -5.7)
        scene.add(item)
        objects.push(item)
      }
    }

    // ---- NEON SIGN ON BACK WALL ----
    // Large outer frame
    const neonFrameMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.7 })

    // Horizontal bars forming kanji-like shapes
    const neonParts = [
      // Left kanji block
      { x: -2.5, y: 3.8, w: 0.06, h: 0.7 },
      { x: -2.2, y: 4.15, w: 0.7, h: 0.06 },
      { x: -2.2, y: 3.8, w: 0.7, h: 0.06 },
      { x: -2.2, y: 3.45, w: 0.7, h: 0.06 },
      { x: -1.85, y: 3.8, w: 0.06, h: 0.7 },

      // Middle kanji block
      { x: -0.35, y: 4.2, w: 0.8, h: 0.06 },
      { x: -0.0, y: 3.85, w: 0.06, h: 0.7 },
      { x: -0.35, y: 3.5, w: 0.8, h: 0.06 },
      { x: -0.35, y: 3.5, w: 0.06, h: 0.7 },
      { x: 0.45, y: 3.85, w: 0.06, h: 0.7 },

      // Right kanji block
      { x: 1.4, y: 4.1, w: 0.75, h: 0.06 },
      { x: 1.4, y: 3.8, w: 0.75, h: 0.06 },
      { x: 1.4, y: 3.5, w: 0.75, h: 0.06 },
      { x: 1.4, y: 3.5, w: 0.06, h: 0.6 },
      { x: 2.15, y: 3.5, w: 0.06, h: 0.6 },

      // Outer bounding box lines
      { x: 0.05, y: 4.55, w: 4.2, h: 0.06 },
      { x: 0.05, y: 3.15, w: 4.2, h: 0.06 },
      { x: -2.0, y: 3.85, w: 0.06, h: 1.4 },
      { x: 2.1, y: 3.85, w: 0.06, h: 1.4 },
    ]

    neonParts.forEach(p => {
      const nGeo = new THREE.BoxGeometry(p.w, p.h, 0.06)
      const nMesh = new THREE.Mesh(nGeo, neonFrameMat.clone())
      nMesh.position.set(p.x, p.y, -5.92)
      scene.add(nMesh)
      objects.push(nMesh)
    })

    // Neon light glow
    const neonGlow = new THREE.PointLight(0xff6644, 1.8, 5)
    neonGlow.position.set(0, 3.8, -5.5)
    scene.add(neonGlow)
    objects.push(neonGlow)

    // ---- MENU BOARDS on back wall ----
    for (let mb = 0; mb < 2; mb++) {
      const mbGeo = new THREE.BoxGeometry(1.6, 1.1, 0.05)
      const mbMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.15 })
      const mbMesh = new THREE.Mesh(mbGeo, mbMat)
      mbMesh.position.set(-5 + mb * 10, 4.0, -5.88)
      scene.add(mbMesh)
      objects.push(mbMesh)

      // Menu text lines
      for (let line = 0; line < 4; line++) {
        const lineGeo = new THREE.BoxGeometry(1.2, 0.05, 0.06)
        const lineMesh = new THREE.Mesh(lineGeo, mat.clone())
        lineMesh.position.set(-5 + mb * 10, 4.35 - line * 0.22, -5.88)
        scene.add(lineMesh)
        objects.push(lineMesh)
      }
    }

    // ---- PENDANT LIGHTS ----
    addPendantLight(scene, -3, -0.3, 0)
    addPendantLight(scene, 0, -0.3, 1.5)
    addPendantLight(scene, 3, -0.3, 3.0)
    addPendantLight(scene, 0, -2.5, 4.5)

    // ---- CONDIMENT BOTTLES on counter ----
    const condimentPositions: [number, number][] = [[-1.0, -0.25], [1.4, -0.25], [-3.5, -0.25]]
    condimentPositions.forEach(([cx, cz]) => {
      const bottleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8)
      const bottle = new THREE.Mesh(bottleGeo, mat.clone())
      bottle.position.set(cx, 1.13, cz)
      scene.add(bottle)
      objects.push(bottle)

      const capGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.04, 8)
      const cap = new THREE.Mesh(capGeo, mat.clone())
      cap.position.set(cx, 1.25, cz)
      scene.add(cap)
      objects.push(cap)
    })

    // ---- DECORATIVE HANGING NOREN (fabric divider strips) ----
    for (let strip = 0; strip < 5; strip++) {
      const norenGeo = new THREE.BoxGeometry(0.14, 0.45, 0.02)
      const norenMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.1 })
      const noren = new THREE.Mesh(norenGeo, norenMat)
      noren.position.set(-3.4 + strip * 1.0, 2.2, 2.2)
      scene.add(noren)
      objects.push(noren)
    }
    // Rod above noren
    const norenRodGeo = new THREE.CylinderGeometry(0.02, 0.02, 5.4, 6)
    const norenRod = new THREE.Mesh(norenRodGeo, mat.clone())
    norenRod.rotation.z = Math.PI / 2
    norenRod.position.set(0, 2.45, 2.2)
    scene.add(norenRod)
    objects.push(norenRod)

    cam.position.set(0, 1.6, 6)
    cam.lookAt(0, 1.0, -1)
  }

  function animate(delta: number, time: number) {
    if (!camera) return

    // Camera gentle sway
    camera.position.x = Math.sin(time * 0.13) * 0.9
    camera.position.y = 1.6 + Math.sin(time * 0.19) * 0.07
    camera.lookAt(Math.sin(time * 0.1) * 0.3, 1.0, -1)

    // Pendant lights sway gently
    pendantLights.forEach(({ light, baseY, phase }) => {
      light.intensity = 1.6 + Math.sin(time * 1.1 + phase) * 0.25
      light.position.y = baseY + Math.sin(time * 0.4 + phase) * 0.03
    })

    // Steam particles rise and reset
    steamSources.forEach(({ geo, positions, baseX, baseY, baseZ }) => {
      for (let i = 0; i < STEAM_COUNT; i++) {
        positions[i * 3 + 0] += Math.sin(time * 1.6 + i * 0.8) * 0.007
        positions[i * 3 + 1] += 0.4 * delta
        positions[i * 3 + 2] += Math.cos(time * 1.2 + i * 0.5) * 0.005
        if (positions[i * 3 + 1] > baseY + 1.8) {
          positions[i * 3 + 0] = baseX + (Math.random() - 0.5) * 0.15
          positions[i * 3 + 1] = baseY + Math.random() * 0.08
          positions[i * 3 + 2] = baseZ + (Math.random() - 0.5) * 0.15
        }
      }
      ;(geo.attributes.position as THREE.BufferAttribute).needsUpdate = true
    })
  }

  function dispose() {
    objects.forEach(o => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry.dispose()
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose())
        else (o.material as THREE.Material).dispose()
      }
    })
    objects.length = 0
    steamSources.length = 0
    pendantLights.length = 0
    camera = null
  }

  return { init, animate, dispose }
}
