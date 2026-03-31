import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createFireplaceScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let fireGeo: THREE.BufferGeometry | null = null
  let emberGeo: THREE.BufferGeometry | null = null
  const firePos = new Float32Array(300 * 3)
  const fireVel = new Float32Array(300 * 3)
  const fireAge = new Float32Array(300)
  const emberPos = new Float32Array(80 * 3)
  const emberVel = new Float32Array(80 * 3)
  const emberAge = new Float32Array(80)
  let flickerLight: THREE.PointLight | null = null
  let camera: THREE.PerspectiveCamera | null = null

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.06)

    const ambient = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambient)

    flickerLight = new THREE.PointLight(0xfb923c, 3, 12)
    flickerLight.position.set(0, 1.2, -1.5)
    scene.add(flickerLight)
    objects.push(flickerLight)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor
    const floorGeo = new THREE.PlaneGeometry(12, 10)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x111111 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(12, 6)
    const wall = new THREE.Mesh(wallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    wall.position.set(0, 3, -4.5)
    scene.add(wall)
    objects.push(wall)

    // Fireplace surround (brick frame)
    const surroundParts = [
      { w: 3.4, h: 0.2, d: 0.3, x: 0, y: 0.1, z: -1.8 },   // hearth floor
      { w: 0.3, h: 2.2, d: 0.3, x: -1.55, y: 1.1, z: -1.8 }, // left pillar
      { w: 0.3, h: 2.2, d: 0.3, x: 1.55, y: 1.1, z: -1.8 },  // right pillar
      { w: 3.4, h: 0.3, d: 0.3, x: 0, y: 2.35, z: -1.8 },    // lintel (top beam)
      { w: 3.0, h: 0.15, d: 0.25, x: 0, y: 2.6, z: -1.78 },  // mantel shelf
    ]
    surroundParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Logs in fireplace
    const logMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const logPositions: [number, number, number, number][] = [
      [-0.35, 0.17, -2.1, 0.3], [0.3, 0.17, -2.0, -0.25], [0, 0.28, -2.05, 0.1]
    ]
    logPositions.forEach(([lx, ly, lz, rot]) => {
      const logGeo = new THREE.CylinderGeometry(0.07, 0.09, 1.1, 7)
      const log = new THREE.Mesh(logGeo, logMat.clone())
      log.rotation.z = Math.PI / 2
      log.rotation.y = rot
      log.position.set(lx, ly, lz)
      scene.add(log)
      objects.push(log)
    })

    // Couch silhouette
    const couchParts = [
      { w: 3.2, h: 0.4, d: 1.0, x: 0, y: 0.2, z: 2.2 },    // seat
      { w: 3.2, h: 0.8, d: 0.25, x: 0, y: 0.7, z: 2.7 },   // backrest
      { w: 0.25, h: 0.8, d: 1.0, x: -1.6, y: 0.4, z: 2.2 }, // left arm
      { w: 0.25, h: 0.8, d: 1.0, x: 1.6, y: 0.4, z: 2.2 },  // right arm
    ]
    couchParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Small side table with candle
    const tableGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 14)
    const table = new THREE.Mesh(tableGeo, mat.clone())
    table.position.set(2.2, 0.55, 1.4)
    scene.add(table)
    objects.push(table)

    const tableLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6)
    const tableLeg = new THREE.Mesh(tableLegGeo, mat.clone())
    tableLeg.position.set(2.2, 0.275, 1.4)
    scene.add(tableLeg)
    objects.push(tableLeg)

    // Candle
    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8)
    const candle = new THREE.Mesh(candleGeo, mat.clone())
    candle.position.set(2.2, 0.69, 1.4)
    scene.add(candle)
    objects.push(candle)

    const candleLight = new THREE.PointLight(0xfb923c, 0.6, 4)
    candleLight.position.set(2.2, 0.85, 1.4)
    scene.add(candleLight)
    objects.push(candleLight)

    // Mantel items
    const mantelItems = [
      { x: -0.9, type: 'box', w: 0.12, h: 0.35, d: 0.08 },
      { x: -0.65, type: 'box', w: 0.08, h: 0.28, d: 0.06 },
      { x: -0.5, type: 'box', w: 0.14, h: 0.4, d: 0.08 },
      { x: 0.6, type: 'cyl', r: 0.08, h: 0.25 },
      { x: 0.9, type: 'box', w: 0.1, h: 0.32, d: 0.1 },
    ] as const
    mantelItems.forEach(item => {
      const geo = item.type === 'box'
        ? new THREE.BoxGeometry(item.w, item.h, item.d)
        : new THREE.CylinderGeometry((item as any).r, (item as any).r, (item as any).h, 8)
      const mesh = new THREE.Mesh(geo, mat.clone())
      const yOff = item.type === 'box' ? item.h / 2 : (item as any).h / 2
      mesh.position.set(item.x, 2.6 + yOff, -1.66)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Fire particles
    for (let i = 0; i < 300; i++) {
      firePos[i * 3 + 0] = (Math.random() - 0.5) * 0.8
      firePos[i * 3 + 1] = 0.3 + Math.random() * 1.2
      firePos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.3
      fireVel[i * 3 + 0] = (Math.random() - 0.5) * 0.3
      fireVel[i * 3 + 1] = 0.8 + Math.random() * 1.2
      fireVel[i * 3 + 2] = (Math.random() - 0.5) * 0.1
      fireAge[i] = Math.random()
    }
    fireGeo = new THREE.BufferGeometry()
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3))
    const fireMat = new THREE.PointsMaterial({ color: 0xfb923c, size: 0.12, transparent: true, opacity: 0.85 })
    scene.add(new THREE.Points(fireGeo, fireMat))
    objects.push(new THREE.Points(fireGeo, fireMat))

    // Embers
    for (let i = 0; i < 80; i++) {
      emberPos[i * 3 + 0] = (Math.random() - 0.5) * 1.0
      emberPos[i * 3 + 1] = 0.22
      emberPos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.4
      emberVel[i * 3 + 0] = (Math.random() - 0.5) * 0.8
      emberVel[i * 3 + 1] = 0.1 + Math.random() * 0.4
      emberVel[i * 3 + 2] = (Math.random() - 0.5) * 0.3
      emberAge[i] = Math.random()
    }
    emberGeo = new THREE.BufferGeometry()
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3))
    const emberMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.06, transparent: true, opacity: 0.9 })
    const emberPts = new THREE.Points(emberGeo, emberMat)
    scene.add(emberPts)
    objects.push(emberPts)

    cam.position.set(0, 1.4, 4.5)
    cam.lookAt(0, 1.2, -1)
  }

  function animate(delta: number, time: number) {
    if (!camera || !fireGeo || !emberGeo || !flickerLight) return

    // Camera gentle sway
    camera.position.x = Math.sin(time * 0.12) * 0.4
    camera.position.y = 1.4 + Math.sin(time * 0.08) * 0.1
    camera.lookAt(0, 1.2, -1)

    // Flickering firelight
    flickerLight.intensity = 2.5 + Math.sin(time * 8.3) * 0.6 + Math.sin(time * 13.7) * 0.4
    flickerLight.color.setHex(Math.random() > 0.95 ? 0xfde68a : 0xfb923c)

    // Fire particles
    for (let i = 0; i < 300; i++) {
      fireAge[i] += delta * 1.1
      firePos[i * 3 + 0] += (fireVel[i * 3 + 0] + Math.sin(time * 3 + i * 0.4) * 0.04) * delta
      firePos[i * 3 + 1] += fireVel[i * 3 + 1] * delta
      if (fireAge[i] > 1 || firePos[i * 3 + 1] > 2.2) {
        firePos[i * 3 + 0] = (Math.random() - 0.5) * 0.8
        firePos[i * 3 + 1] = 0.3
        firePos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.3
        fireAge[i] = 0
      }
    }
    ;(fireGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true

    // Embers drift and die
    for (let i = 0; i < 80; i++) {
      emberAge[i] += delta * 0.7
      emberPos[i * 3 + 0] += emberVel[i * 3 + 0] * delta * 0.4
      emberPos[i * 3 + 1] += emberVel[i * 3 + 1] * delta * 0.3
      if (emberAge[i] > 1) {
        emberPos[i * 3 + 0] = (Math.random() - 0.5) * 0.9
        emberPos[i * 3 + 1] = 0.22
        emberPos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.4
        emberAge[i] = 0
      }
    }
    ;(emberGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    fireGeo = null
    emberGeo = null
    flickerLight = null
    camera = null
  }

  return { init, animate, dispose }
}
