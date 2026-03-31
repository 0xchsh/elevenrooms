import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createCasinoScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const spinningReels: THREE.Mesh[] = []
  const chipStacks: THREE.Group[] = []
  const dealerCards: THREE.Mesh[] = []
  const neonLights: THREE.PointLight[] = []
  let chipParticleGeo: THREE.BufferGeometry | null = null
  const chipPos = new Float32Array(120 * 3)
  const chipVel = new Float32Array(120 * 3)
  let camera: THREE.PerspectiveCamera | null = null

  function addSlotMachine(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Cabinet
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), mat.clone())
    body.position.set(x, 0.8, z)
    scene.add(body)
    objects.push(body)

    // Screen
    const screenMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.05), screenMat)
    screen.position.set(x, 1.05, z + 0.27)
    scene.add(screen)
    objects.push(screen)
    spinningReels.push(screen)

    // Lever arm
    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), mat.clone())
    lever.position.set(x + 0.38, 0.85, z)
    lever.rotation.z = 0.3
    scene.add(lever)
    objects.push(lever)

    // Lever ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), mat.clone())
    ball.position.set(x + 0.52, 1.1, z)
    scene.add(ball)
    objects.push(ball)

    // Coin tray at bottom
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.25), mat.clone())
    tray.position.set(x, 0.14, z + 0.15)
    scene.add(tray)
    objects.push(tray)
  }

  function addChipStack(scene: THREE.Scene, x: number, z: number, count: number) {
    const group = new THREE.Group()
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    for (let i = 0; i < count; i++) {
      const chip = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 10), mat.clone())
      chip.position.set(0, i * 0.028 + 0.012, 0)
      group.add(chip)
    }
    group.position.set(x, 0, z)
    scene.add(group)
    objects.push(group)
    chipStacks.push(group)
  }

  function addCard(scene: THREE.Scene, x: number, y: number, z: number, rotY: number, rotZ: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), mat)
    card.position.set(x, y, z)
    card.rotation.y = rotY
    card.rotation.z = rotZ
    scene.add(card)
    objects.push(card)
    dealerCards.push(card)
    return card
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x0a0005, 0.06)

    const ambient = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambient)

    // Overhead warm casino lights
    const positions: [number, number, number][] = [
      [-4, 4, -2], [0, 4, -2], [4, 4, -2],
      [-4, 4, 2],  [0, 4, 2],  [4, 4, 2],
    ]
    positions.forEach(([lx, ly, lz]) => {
      const light = new THREE.PointLight(0xffffff, 0.5, 8)
      light.position.set(lx, ly, lz)
      scene.add(light)
      neonLights.push(light)
    })

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 20),
      new THREE.MeshLambertMaterial({ color: 0x0a0a0a })
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Slot machines row
    for (let i = 0; i < 4; i++) {
      addSlotMachine(scene, -5 + i * 1.2, -4)
    }

    // Blackjack table — oval
    const tableMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 20), tableMat)
    tableTop.scale.z = 0.55
    tableTop.position.set(1, 0.76, 1)
    scene.add(tableTop)
    objects.push(tableTop)

    // Table leg
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.76, 8), tableMat.clone())
    tableLeg.position.set(1, 0.38, 1)
    scene.add(tableLeg)
    objects.push(tableLeg)

    // Cards on table
    const cardPositions: [number, number, number, number, number][] = [
      [0.2, 0.82, 0.8, 0.1, 0.08],
      [0.55, 0.82, 0.9, -0.05, -0.06],
      [1.4, 0.82, 0.7, 0.15, 0.12],
      [1.75, 0.82, 0.85, -0.1, -0.04],
      [1.0, 0.82, 0.5, 0.0, 0.2],
    ]
    cardPositions.forEach(([cx, cy, cz, ry, rz]) => addCard(scene, cx, cy, cz, ry, rz))

    // Chip stacks on table
    addChipStack(scene, 0.5, 1.3, 6)
    addChipStack(scene, 0.8, 1.1, 4)
    addChipStack(scene, 1.5, 1.4, 8)
    addChipStack(scene, 1.2, 1.0, 3)

    // Roulette wheel suggestion — flat cylinder
    const wheelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 24), tableMat.clone())
    wheelBase.position.set(-2.5, 0.8, 2)
    scene.add(wheelBase)
    objects.push(wheelBase)
    spinningReels.push(wheelBase)

    const wheelInner = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 24), tableMat.clone())
    wheelInner.position.set(-2.5, 0.86, 2)
    scene.add(wheelInner)
    objects.push(wheelInner)

    // Chip particles (flying chips)
    for (let i = 0; i < 120; i++) {
      chipPos[i * 3 + 0] = (Math.random() - 0.5) * 10
      chipPos[i * 3 + 1] = Math.random() * 4
      chipPos[i * 3 + 2] = (Math.random() - 0.5) * 8
      chipVel[i * 3 + 0] = (Math.random() - 0.5) * 0.3
      chipVel[i * 3 + 1] = -0.2 - Math.random() * 0.4
      chipVel[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }
    chipParticleGeo = new THREE.BufferGeometry()
    chipParticleGeo.setAttribute('position', new THREE.BufferAttribute(chipPos, 3))
    const chipMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6 })
    const chips = new THREE.Points(chipParticleGeo, chipMat)
    scene.add(chips)
    objects.push(chips)

    cam.position.set(0, 2.5, 7)
    cam.lookAt(0, 0.8, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !chipParticleGeo) return

    // Slow camera drift around the floor
    camera.position.x = Math.sin(time * 0.08) * 2.5
    camera.position.y = 2.5 + Math.sin(time * 0.05) * 0.3
    camera.lookAt(Math.sin(time * 0.06) * 0.8, 0.8, 0)

    // Slot machine screens flicker
    spinningReels.forEach((mesh, i) => {
      if (mesh.material instanceof THREE.MeshLambertMaterial && mesh.material.emissive) {
        mesh.material.emissiveIntensity = 0.4 + Math.sin(time * 6 + i * 2.1) * 0.15
      }
      // Roulette wheel spins
      if (mesh.geometry.type === 'CylinderGeometry') {
        mesh.rotation.y = time * 1.2
      }
    })

    // Chip stacks sway slightly
    chipStacks.forEach((group, i) => {
      group.rotation.y = Math.sin(time * 0.4 + i) * 0.04
    })

    // Lights pulse subtly
    neonLights.forEach((light, i) => {
      light.intensity = 0.45 + Math.sin(time * 2.5 + i * 0.8) * 0.08
    })

    // Chips fall and recycle
    for (let i = 0; i < 120; i++) {
      chipPos[i * 3 + 0] += chipVel[i * 3 + 0] * delta
      chipPos[i * 3 + 1] += chipVel[i * 3 + 1] * delta
      chipPos[i * 3 + 2] += chipVel[i * 3 + 2] * delta
      if (chipPos[i * 3 + 1] < 0) {
        chipPos[i * 3 + 0] = (Math.random() - 0.5) * 10
        chipPos[i * 3 + 1] = 3 + Math.random()
        chipPos[i * 3 + 2] = (Math.random() - 0.5) * 8
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
    dealerCards.length = 0
    neonLights.length = 0
    chipParticleGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
