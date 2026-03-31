import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createUnderwaterScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let bubbleGeo: THREE.BufferGeometry | null = null
  const bubblePos = new Float32Array(250 * 3)
  const bubbleVel = new Float32Array(250 * 3)
  const kelpMeshes: THREE.Mesh[] = []
  const fishGroups: THREE.Group[] = []
  let lightRays: THREE.Mesh[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function addKelp(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    const segments = 4 + Math.floor(Math.random() * 3)
    const totalHeight = 1.5 + Math.random() * 2

    for (let s = 0; s < segments; s++) {
      const segH = totalHeight / segments
      const geo = new THREE.PlaneGeometry(0.15 + Math.random() * 0.1, segH)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(x + (Math.random() - 0.5) * 0.1, s * segH + segH / 2, z)
      mesh.rotation.y = Math.random() * Math.PI
      scene.add(mesh)
      objects.push(mesh)
      kelpMeshes.push(mesh)
    }
  }

  function addFish(scene: THREE.Scene, x: number, y: number, z: number, scale: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const group = new THREE.Group()

    const bodyGeo = new THREE.SphereGeometry(0.18 * scale, 10, 6)
    bodyGeo.scale(1.8, 0.7, 0.6)
    const body = new THREE.Mesh(bodyGeo, mat.clone())
    group.add(body)

    const tailGeo = new THREE.ConeGeometry(0.12 * scale, 0.22 * scale, 4)
    const tail = new THREE.Mesh(tailGeo, mat.clone())
    tail.rotation.z = Math.PI / 2
    tail.position.set(-0.36 * scale, 0, 0)
    group.add(tail)

    // Fin
    const finGeo = new THREE.ConeGeometry(0.1 * scale, 0.16 * scale, 4)
    const fin = new THREE.Mesh(finGeo, mat.clone())
    fin.position.set(0, 0.14 * scale, 0)
    group.add(fin)

    group.position.set(x, y, z)
    group.userData = { baseX: x, baseY: y, baseZ: z, speed: 0.5 + Math.random() * 1, phase: Math.random() * Math.PI * 2 }
    scene.add(group)
    objects.push(group)
    fishGroups.push(group)
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x001a2e, 0.045)

    const ambient = new THREE.AmbientLight(0x38bdf8, 0.3)
    scene.add(ambient)

    const causticLight = new THREE.DirectionalLight(0x7dd3fc, 0.6)
    causticLight.position.set(0, 10, 0)
    scene.add(causticLight)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Seafloor — extended so it fills the bottom of tall viewports
    const floorGeo = new THREE.PlaneGeometry(50, 40)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x0d1a1a }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Sandy mounds
    for (let i = 0; i < 8; i++) {
      const moundGeo = new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 10, 6)
      const mound = new THREE.Mesh(moundGeo, new THREE.MeshLambertMaterial({ color: 0x0d1a14 }))
      mound.scale.y = 0.25
      mound.position.set((Math.random() - 0.5) * 16, 0, (Math.random() - 0.5) * 12 - 2)
      scene.add(mound)
      objects.push(mound)
    }

    // Rocks and coral
    const rockPositions: [number, number][] = [[-5, -3], [3, -2], [-2, -5], [5, -4], [-7, -1], [0, -6]]
    rockPositions.forEach(([rx, rz]) => {
      const scale = 0.2 + Math.random() * 0.5
      const rGeo = new THREE.DodecahedronGeometry(scale, 0)
      const rock = new THREE.Mesh(rGeo, mat.clone())
      rock.position.set(rx, scale * 0.5, rz)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      scene.add(rock)
      objects.push(rock)

      // Coral on rocks
      if (Math.random() > 0.4) {
        const coralGeo = new THREE.ConeGeometry(0.06, 0.3 + Math.random() * 0.3, 5)
        const coral = new THREE.Mesh(coralGeo, mat.clone())
        coral.position.set(rx + (Math.random() - 0.5) * 0.3, scale + 0.1, rz + (Math.random() - 0.5) * 0.3)
        scene.add(coral)
        objects.push(coral)
      }
    })

    // Kelp forest — denser, closer to camera
    const kelpPositions: [number, number][] = [
      [-8, -4], [-7, -2], [-7.5, -5], [-6.5, -3], [-5.5, -1],
      [7, -3], [7.5, -5], [6.5, -2], [8, -4], [5.5, -1],
      [-3, -7], [0, -7.5], [3.5, -7],
      [-4, 2], [-2, 3], [2, 2.5], [4, 3], // foreground kelp
      [-6, 1], [6, 1],
    ]
    kelpPositions.forEach(([kx, kz]) => addKelp(scene, kx, kz))

    // Foreground coral formations
    const coralFormations: [number, number][] = [[-3, 2], [0, 3], [3, 2.5], [-5, 0], [5, 1]]
    coralFormations.forEach(([cx, cz]) => {
      for (let i = 0; i < 5; i++) {
        const h = 0.25 + Math.random() * 0.7
        const coral = new THREE.Mesh(new THREE.ConeGeometry(0.05 + Math.random() * 0.04, h, 5), mat.clone())
        coral.position.set(cx + (Math.random() - 0.5) * 0.6, h / 2, cz + (Math.random() - 0.5) * 0.4)
        scene.add(coral); objects.push(coral)
        kelpMeshes.push(coral)
      }
      // Fan coral (flat plane)
      const fan = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5 + Math.random() * 0.4, 0.6 + Math.random() * 0.3),
        new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      )
      fan.position.set(cx, 0.5 + Math.random() * 0.3, cz)
      fan.rotation.y = Math.random() * Math.PI
      scene.add(fan); objects.push(fan)
      kelpMeshes.push(fan)
    })

    // Sunken anchor on the seafloor
    const anchorShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), mat.clone())
    anchorShaft.position.set(2, 0.6, -3)
    anchorShaft.rotation.z = 0.3
    scene.add(anchorShaft); objects.push(anchorShaft)

    const anchorBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), mat.clone())
    anchorBar.rotation.z = Math.PI / 2
    anchorBar.position.set(2, 1.1, -3)
    scene.add(anchorBar); objects.push(anchorBar)

    // Chest / debris box on floor
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.35), mat.clone())
    chest.position.set(-3.5, 0.18, -2)
    chest.rotation.y = 0.4
    scene.add(chest); objects.push(chest)

    const chestLid = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.35), mat.clone())
    chestLid.position.set(-3.5, 0.43, -2)
    chestLid.rotation.y = 0.4
    chestLid.rotation.z = -0.25
    scene.add(chestLid); objects.push(chestLid)

    // Light rays from surface
    for (let r = 0; r < 8; r++) {
      const rayGeo = new THREE.CylinderGeometry(0.02, 0.8, 8, 6, 1, true)
      const rayMat = new THREE.MeshLambertMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.04, side: THREE.DoubleSide
      })
      const ray = new THREE.Mesh(rayGeo, rayMat)
      ray.position.set((Math.random() - 0.5) * 8, 4, -3 + r * 0.8)
      ray.rotation.z = (Math.random() - 0.5) * 0.4
      scene.add(ray)
      objects.push(ray)
      lightRays.push(ray)
    }

    // Fish schools
    for (let i = 0; i < 12; i++) {
      addFish(scene,
        (Math.random() - 0.5) * 12,
        1 + Math.random() * 4,
        (Math.random() - 0.5) * 8 - 2,
        0.6 + Math.random() * 0.6
      )
    }

    // Bubbles
    for (let i = 0; i < 250; i++) {
      bubblePos[i * 3 + 0] = (Math.random() - 0.5) * 14
      bubblePos[i * 3 + 1] = Math.random() * 7
      bubblePos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      bubbleVel[i * 3 + 0] = (Math.random() - 0.5) * 0.2
      bubbleVel[i * 3 + 1] = 0.4 + Math.random() * 0.8
      bubbleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }
    bubbleGeo = new THREE.BufferGeometry()
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3))
    const bubbleMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.07, transparent: true, opacity: 0.55 })
    const bubblePts = new THREE.Points(bubbleGeo, bubbleMat)
    scene.add(bubblePts)
    objects.push(bubblePts)

    cam.position.set(0, 2.2, 7)
    cam.lookAt(0, 1.0, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !bubbleGeo) return

    // Camera drifts like current
    camera.position.x = Math.sin(time * 0.12) * 2
    camera.position.y = 2.2 + Math.sin(time * 0.08) * 0.3
    camera.lookAt(Math.sin(time * 0.1) * 1, 0.8, -1)

    // Kelp sway
    kelpMeshes.forEach((mesh, i) => {
      mesh.rotation.z = Math.sin(time * 0.7 + i * 0.4) * 0.15
      mesh.rotation.x = Math.sin(time * 0.5 + i * 0.3) * 0.05
    })

    // Fish swim in loose arcs
    fishGroups.forEach(group => {
      const { baseX, baseY, baseZ, speed, phase } = group.userData
      group.position.x = baseX + Math.sin(time * speed * 0.4 + phase) * 3
      group.position.y = baseY + Math.sin(time * speed * 0.3 + phase + 1) * 0.8
      group.position.z = baseZ + Math.cos(time * speed * 0.3 + phase) * 2
      // Face direction of movement
      group.rotation.y = Math.sin(time * speed * 0.4 + phase) * 0.8
    })

    // Light rays shimmer
    lightRays.forEach((ray, i) => {
      ;(ray.material as THREE.MeshLambertMaterial).opacity = 0.03 + Math.sin(time * 1.2 + i) * 0.015
    })

    // Bubbles rise
    for (let i = 0; i < 250; i++) {
      bubblePos[i * 3 + 0] += (Math.sin(time * 1.5 + i * 0.6) * 0.008)
      bubblePos[i * 3 + 1] += bubbleVel[i * 3 + 1] * delta
      if (bubblePos[i * 3 + 1] > 8) {
        bubblePos[i * 3 + 1] = 0
        bubblePos[i * 3 + 0] = (Math.random() - 0.5) * 14
      }
    }
    ;(bubbleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    kelpMeshes.length = 0
    fishGroups.length = 0
    lightRays = []
    bubbleGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
