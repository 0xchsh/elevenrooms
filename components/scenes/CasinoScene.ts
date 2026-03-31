import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createCasinoScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const spinningReels: THREE.Mesh[] = []
  const chipStacks: THREE.Group[] = []
  const neonLights: THREE.PointLight[] = []
  let chipParticleGeo: THREE.BufferGeometry | null = null
  const chipPos = new Float32Array(200 * 3)
  const chipVel = new Float32Array(200 * 3)
  let camera: THREE.PerspectiveCamera | null = null

  const mat = () => new THREE.MeshLambertMaterial({ color: 0xffffff })
  const emissiveMat = (i = 0.5) => new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: i })

  function addSlotMachine(scene: THREE.Scene, x: number, z: number) {
    const m = mat()
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.7, 0.52), m)
    body.position.set(x, 0.85, z)
    scene.add(body); objects.push(body)

    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.04), emissiveMat(0.6))
    screen.position.set(x, 1.15, z + 0.28)
    scene.add(screen); objects.push(screen)
    spinningReels.push(screen)

    // Top display panel
    const topScreen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.04), emissiveMat(0.4))
    topScreen.position.set(x, 1.58, z + 0.28)
    scene.add(topScreen); objects.push(topScreen)
    spinningReels.push(topScreen)

    // Buttons row
    const btnGeo = new THREE.BoxGeometry(0.12, 0.06, 0.04)
    for (let b = 0; b < 3; b++) {
      const btn = new THREE.Mesh(btnGeo, emissiveMat(0.3))
      btn.position.set(x - 0.12 + b * 0.12, 0.82, z + 0.28)
      scene.add(btn); objects.push(btn)
    }

    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), m.clone())
    lever.position.set(x + 0.4, 0.9, z)
    lever.rotation.z = 0.25
    scene.add(lever); objects.push(lever)

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), m.clone())
    ball.position.set(x + 0.53, 1.15, z)
    scene.add(ball); objects.push(ball)

    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.28), m.clone())
    tray.position.set(x, 0.12, z + 0.14)
    scene.add(tray); objects.push(tray)
  }

  function addSlotRow(scene: THREE.Scene, startX: number, z: number, count: number) {
    for (let i = 0; i < count; i++) addSlotMachine(scene, startX + i * 1.0, z)
    // Back panel connecting machines
    const panel = new THREE.Mesh(new THREE.BoxGeometry(count * 1.0 + 0.2, 2.2, 0.1), mat())
    panel.position.set(startX + (count - 1) * 0.5, 1.1, z - 0.32)
    scene.add(panel); objects.push(panel)
  }

  function addChipStack(scene: THREE.Scene, x: number, z: number, count: number) {
    const group = new THREE.Group()
    for (let i = 0; i < count; i++) {
      const chip = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 10), mat())
      chip.position.set(0, i * 0.028 + 0.012, 0)
      group.add(chip)
    }
    group.position.set(x, 0, z)
    scene.add(group); objects.push(group)
    chipStacks.push(group)
  }

  function addCard(scene: THREE.Scene, x: number, y: number, z: number, rotY: number, rotZ: number) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }))
    card.position.set(x, y, z); card.rotation.y = rotY; card.rotation.z = rotZ
    scene.add(card); objects.push(card)
  }

  function addBlackjackTable(scene: THREE.Scene, x: number, z: number) {
    const m = mat()
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.1, 20), m)
    tableTop.scale.z = 0.5
    tableTop.position.set(x, 0.78, z)
    scene.add(tableTop); objects.push(tableTop)

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.78, 8), m.clone())
    leg.position.set(x, 0.39, z)
    scene.add(leg); objects.push(leg)

    // Cards
    const cardData: [number, number, number, number, number][] = [
      [x - 0.8, 0.84, z - 0.2, 0.1, 0.08], [x - 0.45, 0.84, z - 0.1, -0.05, -0.06],
      [x + 0.4, 0.84, z - 0.15, 0.15, 0.12], [x + 0.75, 0.84, z - 0.05, -0.1, -0.04],
      [x, 0.84, z - 0.5, 0.0, 0.2],
    ]
    cardData.forEach(([cx, cy, cz, ry, rz]) => addCard(scene, cx, cy, cz, ry, rz))

    addChipStack(scene, x - 0.5, z + 0.3, 6)
    addChipStack(scene, x - 0.2, z + 0.1, 4)
    addChipStack(scene, x + 0.5, z + 0.4, 8)
    addChipStack(scene, x + 0.2, z, 3)
  }

  function addRouletteTable(scene: THREE.Scene, x: number, z: number) {
    const m = mat()
    // Long rectangular roulette table
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 1.4), m)
    tableTop.position.set(x, 0.78, z)
    scene.add(tableTop); objects.push(tableTop)

    for (let lx = -1; lx <= 1; lx += 2) {
      for (let lz = -1; lz <= 1; lz += 2) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 0.1), m.clone())
        leg.position.set(x + lx * 1.3, 0.39, z + lz * 0.55)
        scene.add(leg); objects.push(leg)
      }
    }

    // Wheel at one end
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.12, 24), m.clone())
    wheel.position.set(x - 1.0, 0.9, z)
    scene.add(wheel); objects.push(wheel)
    spinningReels.push(wheel)

    const wheelInner = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.14, 24), m.clone())
    wheelInner.position.set(x - 1.0, 0.92, z)
    scene.add(wheelInner); objects.push(wheelInner)

    // Betting grid lines on table
    for (let col = 0; col < 4; col++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 1.2), m.clone())
      line.position.set(x + 0.1 + col * 0.42, 0.84, z)
      scene.add(line); objects.push(line)
    }

    addChipStack(scene, x + 0.3, z - 0.3, 5)
    addChipStack(scene, x + 0.8, z + 0.2, 7)
  }

  function addPokerTable(scene: THREE.Scene, x: number, z: number) {
    const m = mat()
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 10), m)
    tableTop.position.set(x, 0.78, z)
    scene.add(tableTop); objects.push(tableTop)

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.78, 8), m.clone())
    leg.position.set(x, 0.39, z)
    scene.add(leg); objects.push(leg)

    // Cards spread around
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      addCard(scene, x + Math.cos(angle) * 0.6, 0.84, z + Math.sin(angle) * 0.4, angle, 0.1)
    }

    addChipStack(scene, x + 0.4, z - 0.4, 9)
    addChipStack(scene, x - 0.3, z + 0.3, 5)
  }

  function addChandelier(scene: THREE.Scene, x: number, z: number) {
    // Central orb
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), emissiveMat(0.9))
    orb.position.set(x, 3.8, z)
    scene.add(orb); objects.push(orb)

    // Hanging arms
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4), mat())
      arm.position.set(x + Math.cos(angle) * 0.4, 3.6, z + Math.sin(angle) * 0.4)
      arm.rotation.z = Math.PI / 4
      scene.add(arm); objects.push(arm)

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), emissiveMat(0.8))
      bulb.position.set(x + Math.cos(angle) * 0.65, 3.35, z + Math.sin(angle) * 0.65)
      scene.add(bulb); objects.push(bulb)
      spinningReels.push(bulb)

      const light = new THREE.PointLight(0xfff0cc, 0.8, 5)
      light.position.set(x + Math.cos(angle) * 0.65, 3.35, z + Math.sin(angle) * 0.65)
      scene.add(light); neonLights.push(light)
    }

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), mat())
    chain.position.set(x, 4.15, z)
    scene.add(chain); objects.push(chain)
  }

  function addBarCounter(scene: THREE.Scene, x: number, z: number, width: number) {
    const m = mat()
    const counter = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, 0.55), m)
    counter.position.set(x, 1.05, z)
    scene.add(counter); objects.push(counter)

    const base = new THREE.Mesh(new THREE.BoxGeometry(width, 1.05, 0.5), m.clone())
    base.position.set(x, 0.52, z + 0.02)
    scene.add(base); objects.push(base)

    // Bottles on bar
    for (let i = 0; i < Math.floor(width * 2); i++) {
      const h = 0.18 + Math.random() * 0.2
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, h, 8), emissiveMat(0.2))
      bottle.position.set(x - width / 2 + 0.3 + i * 0.45, 1.05 + h / 2, z - 0.2)
      scene.add(bottle); objects.push(bottle)
    }

    // Bar stools
    for (let i = 0; i < Math.floor(width * 1.2); i++) {
      const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), m.clone())
      stoolSeat.position.set(x - width / 2 + 0.4 + i * 0.75, 0.8, z + 0.55)
      scene.add(stoolSeat); objects.push(stoolSeat)

      const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.8, 6), m.clone())
      stoolLeg.position.set(x - width / 2 + 0.4 + i * 0.75, 0.4, z + 0.55)
      scene.add(stoolLeg); objects.push(stoolLeg)
    }
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x080005, 0.038)

    const ambient = new THREE.AmbientLight(0xffeedd, 0.3)
    scene.add(ambient)

    // ── Room structure ──────────────────────────────────────────────────────

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshLambertMaterial({ color: 0x080808 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor); objects.push(floor)

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshLambertMaterial({ color: 0x0a0a0a }))
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = 4.5
    scene.add(ceiling); objects.push(ceiling)

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    backWall.position.set(0, 2.5, -10)
    scene.add(backWall); objects.push(backWall)

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(30, 5)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-12, 2.5, 0)
    scene.add(leftWall); objects.push(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(12, 2.5, 0)
    scene.add(rightWall); objects.push(rightWall)

    // Floor carpet pattern (thin stripes)
    for (let i = -5; i <= 5; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 28), new THREE.MeshLambertMaterial({ color: 0x111111 }))
      stripe.rotation.x = -Math.PI / 2
      stripe.position.set(i * 2.2, 0.001, 0)
      scene.add(stripe); objects.push(stripe)
    }

    // ── Overhead lighting grid ──────────────────────────────────────────────
    const lightGrid: [number, number, number][] = [
      [-6, 4, -6], [0, 4, -6], [6, 4, -6],
      [-6, 4, 0],  [0, 4, 0],  [6, 4, 0],
      [-6, 4, 5],  [0, 4, 5],  [6, 4, 5],
    ]
    lightGrid.forEach(([lx, ly, lz]) => {
      const light = new THREE.PointLight(0xfff0cc, 0.55, 9)
      light.position.set(lx, ly, lz)
      scene.add(light); neonLights.push(light)

      const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.1, 10), emissiveMat(0.5))
      fixture.position.set(lx, 4.42, lz)
      scene.add(fixture); objects.push(fixture)
    })

    // ── Slot machine banks ──────────────────────────────────────────────────
    // Left bank — against left wall
    addSlotRow(scene, -10.5, -7, 6)
    addSlotRow(scene, -10.5, -5.8, 6)

    // Right bank — against right wall
    addSlotRow(scene, -10.5, 8, 6)
    addSlotRow(scene, -10.5, 6.8, 6)

    // Center island row
    addSlotRow(scene, -3.5, -6.5, 4)
    addSlotRow(scene, -3.5, -5.3, 4) // back to back

    // ── Tables ──────────────────────────────────────────────────────────────
    addBlackjackTable(scene, -4, 0)
    addBlackjackTable(scene, 3.5, -2)

    addRouletteTable(scene, 0, 3)
    addRouletteTable(scene, -7, 3.5)

    addPokerTable(scene, 6, 2)
    addPokerTable(scene, 7, -4)

    // ── Bar counter along back wall ─────────────────────────────────────────
    addBarCounter(scene, 0, -9.2, 10)

    // Neon sign on back wall (bright emissive strip)
    const signGeo = new THREE.BoxGeometry(5, 0.22, 0.08)
    const sign = new THREE.Mesh(signGeo, emissiveMat(0.95))
    sign.position.set(0, 3.8, -9.85)
    scene.add(sign); objects.push(sign)
    spinningReels.push(sign)

    // Wall sconce lights
    for (let sx = -9; sx <= 9; sx += 4.5) {
      const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), emissiveMat(0.7))
      sconce.position.set(sx, 2.8, -9.85)
      scene.add(sconce); objects.push(sconce)
      spinningReels.push(sconce)

      const sLight = new THREE.PointLight(0xffd080, 0.7, 5)
      sLight.position.set(sx, 2.8, -9.5)
      scene.add(sLight); neonLights.push(sLight)
    }

    // Side wall sconces
    for (let sz = -7; sz <= 7; sz += 4) {
      for (const sx of [-11.85, 11.85]) {
        const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), emissiveMat(0.7))
        sconce.position.set(sx, 2.8, sz)
        scene.add(sconce); objects.push(sconce)
        spinningReels.push(sconce)

        const sLight = new THREE.PointLight(0xffd080, 0.6, 4)
        sLight.position.set(sx * 0.95, 2.8, sz)
        scene.add(sLight); neonLights.push(sLight)
      }
    }

    // ── Chandeliers ─────────────────────────────────────────────────────────
    addChandelier(scene, -4, -3)
    addChandelier(scene, 3, 2)
    addChandelier(scene, -1, -7.5)

    // ── Chip particles ──────────────────────────────────────────────────────
    for (let i = 0; i < 200; i++) {
      chipPos[i * 3 + 0] = (Math.random() - 0.5) * 20
      chipPos[i * 3 + 1] = Math.random() * 4.5
      chipPos[i * 3 + 2] = (Math.random() - 0.5) * 16
      chipVel[i * 3 + 0] = (Math.random() - 0.5) * 0.25
      chipVel[i * 3 + 1] = -0.15 - Math.random() * 0.35
      chipVel[i * 3 + 2] = (Math.random() - 0.5) * 0.18
    }
    chipParticleGeo = new THREE.BufferGeometry()
    chipParticleGeo.setAttribute('position', new THREE.BufferAttribute(chipPos, 3))
    const chipMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.55 })
    const chips = new THREE.Points(chipParticleGeo, chipMat)
    scene.add(chips); objects.push(chips)

    cam.position.set(0, 1.75, 9)
    cam.lookAt(0, 1.1, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !chipParticleGeo) return

    camera.position.x = Math.sin(time * 0.07) * 3
    camera.position.y = 1.75 + Math.sin(time * 0.05) * 0.2
    camera.lookAt(Math.sin(time * 0.055) * 1.5, 1.0, -2)

    spinningReels.forEach((mesh, i) => {
      if (mesh.material instanceof THREE.MeshLambertMaterial && mesh.material.emissive) {
        mesh.material.emissiveIntensity = 0.45 + Math.sin(time * 5 + i * 1.7) * 0.2
      }
      if (mesh.geometry.type === 'CylinderGeometry') {
        mesh.rotation.y = time * 1.1
      }
    })

    chipStacks.forEach((group, i) => {
      group.rotation.y = Math.sin(time * 0.4 + i) * 0.04
    })

    neonLights.forEach((light, i) => {
      light.intensity = light.intensity * 0.95 + (0.5 + Math.sin(time * 2.2 + i * 0.9) * 0.12) * 0.05
    })

    for (let i = 0; i < 200; i++) {
      chipPos[i * 3 + 0] += chipVel[i * 3 + 0] * delta
      chipPos[i * 3 + 1] += chipVel[i * 3 + 1] * delta
      chipPos[i * 3 + 2] += chipVel[i * 3 + 2] * delta
      if (chipPos[i * 3 + 1] < 0) {
        chipPos[i * 3 + 0] = (Math.random() - 0.5) * 20
        chipPos[i * 3 + 1] = 4 + Math.random()
        chipPos[i * 3 + 2] = (Math.random() - 0.5) * 16
      }
    }
    ;(chipParticleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    spinningReels.length = 0
    chipStacks.length = 0
    neonLights.length = 0
    chipParticleGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
