import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

interface SteamSystem {
  geo: THREE.BufferGeometry
  positions: Float32Array
  baseX: number
  baseY: number
  baseZ: number
  isMachine?: boolean
  burstTimer?: number
  bursting?: boolean
}

interface PendantLight {
  group: THREE.Group
  light: THREE.PointLight
  phase: number
}

export function createCafeScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const steamSystems: SteamSystem[] = []
  const pendantLights: PendantLight[] = []
  let camera: THREE.PerspectiveCamera | null = null
  const STEAM_COUNT = 140

  function addSteam(scene: THREE.Scene, bx: number, by: number, bz: number, isMachine = false) {
    const count = isMachine ? 60 : STEAM_COUNT
    const positions = new Float32Array(count * 3)
    // Start all particles at base (hidden below base when not bursting)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = bx
      positions[i * 3 + 1] = isMachine ? by - 2 : by + Math.random() * 0.6  // machine steam starts hidden
      positions[i * 3 + 2] = bz
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: isMachine ? 0.08 : 0.05,
      transparent: true,
      opacity: isMachine ? 0.0 : 0.28,
    })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    objects.push(pts)
    steamSystems.push({
      geo, positions, baseX: bx, baseY: by, baseZ: bz,
      isMachine,
      burstTimer: isMachine ? 8 + Math.random() * 6 : 0,  // first burst in 8-14s
      bursting: false,
    })
  }

  function addChair(scene: THREE.Scene, x: number, z: number, rotY: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    // Seat
    const seatGeo = new THREE.BoxGeometry(0.4, 0.05, 0.4)
    const seat = new THREE.Mesh(seatGeo, mat.clone())
    seat.position.set(x, 0.45, z)
    seat.rotation.y = rotY
    scene.add(seat)
    objects.push(seat)
    // Backrest
    const backGeo = new THREE.BoxGeometry(0.4, 0.4, 0.05)
    const back = new THREE.Mesh(backGeo, mat.clone())
    back.position.set(
      x + Math.sin(rotY) * 0.175,
      0.67,
      z + Math.cos(rotY) * 0.175
    )
    back.rotation.y = rotY
    scene.add(back)
    objects.push(back)
    // Legs (4)
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 5)
    const offsets = [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]] as const
    offsets.forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(legGeo, mat.clone())
      leg.position.set(x + ox, 0.225, z + oz)
      scene.add(leg)
      objects.push(leg)
    })
  }

  function addPerson(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8)
    const body = new THREE.Mesh(bodyGeo, mat.clone())
    body.position.set(x, 0.7, z)
    scene.add(body)
    objects.push(body)
    // Head
    const headGeo = new THREE.SphereGeometry(0.1, 8, 8)
    const head = new THREE.Mesh(headGeo, mat.clone())
    head.position.set(x, 1.02, z)
    scene.add(head)
    objects.push(head)
  }

  function addPendantLight(scene: THREE.Scene, x: number, z: number, phase: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xf5c87a, emissiveIntensity: 0.7 })
    const group = new THREE.Group()

    // Cord
    const cordGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4)
    const cordMat = new THREE.MeshLambertMaterial({ color: 0x888888 })
    const cord = new THREE.Mesh(cordGeo, cordMat)
    cord.position.set(0, -0.6, 0)
    group.add(cord)

    // Shade
    const shadeGeo = new THREE.ConeGeometry(0.2, 0.3, 12, 1, true)
    const shade = new THREE.Mesh(shadeGeo, mat)
    shade.rotation.x = Math.PI
    shade.position.set(0, -1.35, 0)
    group.add(shade)

    group.position.set(x, 3.8, z)
    scene.add(group)
    objects.push(group)

    const light = new THREE.PointLight(0xf5c87a, 1.5, 6)
    light.position.set(x, 2.4, z)
    scene.add(light)
    objects.push(light)

    pendantLights.push({ group, light, phase })
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor
    const floorGeo = new THREE.PlaneGeometry(14, 10)
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x111111 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(14, 5)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x0d0d0d })
    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.position.set(0, 2.5, -4.5)
    scene.add(wall)
    objects.push(wall)

    // Counter / bar along back wall
    const counterGeo = new THREE.BoxGeometry(5, 1.0, 0.6)
    const counter = new THREE.Mesh(counterGeo, mat.clone())
    counter.position.set(3.5, 0.5, -3.8)
    scene.add(counter)
    objects.push(counter)

    // Coffee machine on counter
    const machineGeo = new THREE.BoxGeometry(0.5, 0.6, 0.4)
    const machine = new THREE.Mesh(machineGeo, mat.clone())
    machine.position.set(2.5, 1.3, -3.8)
    scene.add(machine)
    objects.push(machine)

    // Machine chimney
    const chimneyGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6)
    const chimney = new THREE.Mesh(chimneyGeo, mat.clone())
    chimney.position.set(2.5, 1.8, -3.8)
    scene.add(chimney)
    objects.push(chimney)
    addSteam(scene, 2.5, 2.05, -3.8, true)  // machine steam: burst mode

    // Shelves on wall
    for (let i = 0; i < 3; i++) {
      const shelfGeo = new THREE.BoxGeometry(1.4, 0.05, 0.25)
      const shelf = new THREE.Mesh(shelfGeo, mat.clone())
      shelf.position.set(4 - i * 0.4, 2.2 + i * 0.5, -4.35)
      scene.add(shelf)
      objects.push(shelf)
      // Items on shelf (small cylinders / boxes)
      for (let j = 0; j < 3; j++) {
        const itemGeo = Math.random() > 0.5
          ? new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6)
          : new THREE.BoxGeometry(0.12, 0.18, 0.1)
        const item = new THREE.Mesh(itemGeo, mat.clone())
        item.position.set(4 - i * 0.4 + (j - 1) * 0.35, 2.33 + i * 0.5, -4.35)
        scene.add(item)
        objects.push(item)
      }
    }

    // Wall art (framed rectangles)
    const framePositions: [number, number][] = [[-4, 2.5], [-2.5, 3.0], [-1, 2.4]]
    framePositions.forEach(([fx, fy]) => {
      const frameGeo = new THREE.PlaneGeometry(0.7, 0.9)
      const frameMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x333333, emissiveIntensity: 0.5 })
      const frame = new THREE.Mesh(frameGeo, frameMat)
      frame.position.set(fx, fy, -4.45)
      scene.add(frame)
      objects.push(frame)
    })

    // Tables + chairs + people
    const tableData: [number, number][] = [[-3, -1], [0, -1.5], [2.8, -0.5], [-1.5, 2], [1.5, 2.2]]
    tableData.forEach(([tx, tz]) => {
      // Tabletop
      const topGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 20)
      const top = new THREE.Mesh(topGeo, mat.clone())
      top.position.set(tx, 0.75, tz)
      scene.add(top)
      objects.push(top)

      // Leg
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8)
      const leg = new THREE.Mesh(legGeo, mat.clone())
      leg.position.set(tx, 0.375, tz)
      scene.add(leg)
      objects.push(leg)

      // Chairs around table
      const chairAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
      const numChairs = 2 + Math.floor(Math.random() * 2)
      for (let c = 0; c < numChairs; c++) {
        const angle = chairAngles[c]
        addChair(scene, tx + Math.sin(angle) * 0.9, tz + Math.cos(angle) * 0.9, angle + Math.PI)
        // Seated person (50% chance)
        if (Math.random() > 0.4) {
          addPerson(scene, tx + Math.sin(angle) * 0.85, tz + Math.cos(angle) * 0.85)
        }
      }

      // Cup on table
      const cupCount = 1 + Math.floor(Math.random() * 2)
      for (let cc = 0; cc < cupCount; cc++) {
        const ox = (Math.random() - 0.5) * 0.5
        const oz = (Math.random() - 0.5) * 0.5
        const cupGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.16, 12)
        const cup = new THREE.Mesh(cupGeo, mat.clone())
        cup.position.set(tx + ox, 0.88, tz + oz)
        scene.add(cup)
        objects.push(cup)

        const handleGeo = new THREE.TorusGeometry(0.065, 0.016, 6, 12, Math.PI)
        const handle = new THREE.Mesh(handleGeo, mat.clone())
        handle.rotation.y = Math.PI / 2
        handle.position.set(tx + ox + 0.12, 0.88, tz + oz)
        scene.add(handle)
        objects.push(handle)

        addSteam(scene, tx + ox, 0.97, tz + oz)
      }
    })

    // Pendant lights
    addPendantLight(scene, -3, -1, 0)
    addPendantLight(scene, 0, -1.5, 1.2)
    addPendantLight(scene, 2.8, -0.5, 2.5)
    addPendantLight(scene, -1.5, 2, 3.8)
    addPendantLight(scene, 1.5, 2.2, 0.6)

    // Window (right wall)
    const winFrameGeo = new THREE.PlaneGeometry(2.5, 2)
    const winMat = new THREE.MeshLambertMaterial({ color: 0x0a1a2a, emissive: 0x7eb8f7, emissiveIntensity: 0.15 })
    const winFrame = new THREE.Mesh(winFrameGeo, winMat)
    winFrame.rotation.y = Math.PI / 2
    winFrame.position.set(-6.5, 1.8, -1)
    scene.add(winFrame)
    objects.push(winFrame)

    cam.position.set(-1, 3.5, 7)
    cam.lookAt(0, 1, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera) return

    camera.position.x = Math.sin(time * 0.18) * 1.8
    camera.position.y = 3.5 + Math.sin(time * 0.1) * 0.2
    camera.lookAt(Math.sin(time * 0.1) * 0.5, 1.2, -1)

    // Pendant lights sway + pulse
    pendantLights.forEach(({ group, light, phase }) => {
      group.rotation.z = Math.sin(time * 0.6 + phase) * 0.04
      group.rotation.x = Math.sin(time * 0.4 + phase + 1) * 0.025
      light.intensity = 1.4 + Math.sin(time * 1.2 + phase) * 0.2
    })

    // Steam rises
    steamSystems.forEach(system => {
      const { geo, positions, baseX, baseY, baseZ, isMachine } = system
      const mat = (geo as THREE.BufferGeometry & { _mat?: THREE.PointsMaterial })

      if (isMachine) {
        // Burst mode: countdown, then burst for ~2.5s, then cool down ~12-20s
        system.burstTimer! -= delta
        if (!system.bursting && system.burstTimer! <= 0) {
          system.bursting = true
          system.burstTimer = 2 + Math.random() * 1.5  // burst lasts 2-3.5s
          // Reset all particles to base
          for (let i = 0; i < 60; i++) {
            positions[i * 3 + 0] = baseX + (Math.random() - 0.5) * 0.08
            positions[i * 3 + 1] = baseY + Math.random() * 0.1
            positions[i * 3 + 2] = baseZ + (Math.random() - 0.5) * 0.08
          }
        } else if (system.bursting && system.burstTimer! <= 0) {
          system.bursting = false
          system.burstTimer = 12 + Math.random() * 8  // wait 12-20s before next burst
          // Hide particles
          for (let i = 0; i < 60; i++) {
            positions[i * 3 + 1] = baseY - 2
          }
        }

        if (system.bursting) {
          for (let i = 0; i < 60; i++) {
            positions[i * 3 + 0] += Math.sin(time * 3 + i * 1.2) * 0.01
            positions[i * 3 + 1] += 1.2 * delta
            positions[i * 3 + 2] += Math.cos(time * 2.5 + i * 0.8) * 0.008
            if (positions[i * 3 + 1] > baseY + 2.2) {
              positions[i * 3 + 0] = baseX + (Math.random() - 0.5) * 0.1
              positions[i * 3 + 1] = baseY + Math.random() * 0.1
              positions[i * 3 + 2] = baseZ + (Math.random() - 0.5) * 0.1
            }
          }
        }
      } else {
        // Cup steam: always gentle
        for (let i = 0; i < STEAM_COUNT; i++) {
          positions[i * 3 + 0] += Math.sin(time * 1.8 + i * 0.9) * 0.006
          positions[i * 3 + 1] += 0.45 * delta
          positions[i * 3 + 2] += Math.cos(time * 1.4 + i * 0.6) * 0.004
          if (positions[i * 3 + 1] > baseY + 1.6) {
            positions[i * 3 + 0] = baseX + (Math.random() - 0.5) * 0.08
            positions[i * 3 + 1] = baseY + Math.random() * 0.08
            positions[i * 3 + 2] = baseZ + (Math.random() - 0.5) * 0.08
          }
        }
      }
      ;(geo.attributes.position as THREE.BufferAttribute).needsUpdate = true
      void mat
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
    steamSystems.length = 0
    pendantLights.length = 0
    camera = null
  }

  return { init, animate, dispose }
}
