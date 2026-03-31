import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createCityScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const cars: { mesh: THREE.Mesh; speed: number; lane: number; dir: number }[] = []
  const lights: THREE.PointLight[] = []
  const windowMeshes: { mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; phase: number }[] = []
  let rainGeo: THREE.BufferGeometry | null = null
  const rainPos = new Float32Array(4000 * 3)
  const rainVelX = new Float32Array(4000)
  let orbitAngle = 0
  let camera: THREE.PerspectiveCamera | null = null

  function addBuilding(scene: THREE.Scene, x: number, z: number, w: number, h: number, d: number) {
    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, h / 2, z)
    scene.add(mesh)
    objects.push(mesh)

    // Windows: scattered bright patches on building faces
    const floors = Math.floor(h / 0.6)
    const winsPerFloor = Math.floor(w / 0.5)
    for (let f = 0; f < floors; f++) {
      for (let ww = 0; ww < winsPerFloor; ww++) {
        if (Math.random() > 0.55) continue
        const wGeo = new THREE.PlaneGeometry(0.18, 0.22)
        const wMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xf5c87a, emissiveIntensity: Math.random() * 0.8 + 0.2 })
        const win = new THREE.Mesh(wGeo, wMat)
        win.position.set(
          x + (ww / winsPerFloor - 0.5) * w + 0.25,
          (f / floors) * h + 0.3,
          z + d / 2 + 0.01
        )
        scene.add(win)
        objects.push(win)
        windowMeshes.push({ mesh: win, mat: wMat, phase: Math.random() * Math.PI * 2 })
      }
    }
  }

  function addCar(scene: THREE.Scene, lane: number, startX: number, dir: number) {
    const geo = new THREE.BoxGeometry(0.6, 0.22, 0.3)
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(startX, 0.11, lane)
    scene.add(mesh)
    objects.push(mesh)
    cars.push({ mesh, speed: 2 + Math.random() * 3, lane, dir })
  }

  function addStreetLight(scene: THREE.Scene, x: number, z: number) {
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6)
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const pole = new THREE.Mesh(poleGeo, mat)
    pole.position.set(x, 1.25, z)
    scene.add(pole)
    objects.push(pole)

    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4)
    const arm = new THREE.Mesh(armGeo, mat.clone())
    arm.rotation.z = Math.PI / 2
    arm.position.set(x + 0.3, 2.5, z)
    scene.add(arm)
    objects.push(arm)

    const light = new THREE.PointLight(0x7eb8f7, 0.8, 5)
    light.position.set(x + 0.6, 2.5, z)
    scene.add(light)
    lights.push(light)
    objects.push(light)
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.045)

    const ambient = new THREE.AmbientLight(0xffffff, 0.25)
    scene.add(ambient)
    const moon = new THREE.DirectionalLight(0x7eb8f7, 0.6)
    moon.position.set(-8, 15, -5)
    scene.add(moon)

    // Dense city block layout
    const layout = [
      // Row 1
      { x: -6, z: -8, w: 1.2, h: 6, d: 1.2 },
      { x: -4.5, z: -8, w: 0.9, h: 9, d: 1.0 },
      { x: -3, z: -8, w: 1.4, h: 4.5, d: 1.3 },
      { x: -1.2, z: -8.5, w: 1.0, h: 7, d: 1.1 },
      { x: 0.8, z: -8, w: 1.6, h: 11, d: 1.4 },
      { x: 2.8, z: -8.5, w: 1.2, h: 5, d: 1.0 },
      { x: 4.5, z: -8, w: 1.0, h: 8, d: 1.2 },
      { x: 6.2, z: -8, w: 1.3, h: 6, d: 1.1 },
      // Row 2 (closer, smaller)
      { x: -7, z: -4, w: 1.0, h: 3.5, d: 1.0 },
      { x: -5.2, z: -4.5, w: 0.8, h: 5, d: 0.9 },
      { x: -3.5, z: -4, w: 1.1, h: 3, d: 1.0 },
      { x: -1.5, z: -4.5, w: 0.9, h: 6.5, d: 0.9 },
      { x: 0.5, z: -4, w: 1.2, h: 4, d: 1.1 },
      { x: 2.5, z: -4.5, w: 1.0, h: 7, d: 1.0 },
      { x: 4.5, z: -4, w: 1.3, h: 3.5, d: 1.2 },
      { x: 6.5, z: -4.5, w: 0.9, h: 5.5, d: 0.9 },
      // Row 3 (far sides)
      { x: -9, z: -6, w: 1.4, h: 7, d: 1.5 },
      { x: 9, z: -6, w: 1.4, h: 8, d: 1.5 },
      { x: -9, z: -10, w: 1.6, h: 5, d: 1.3 },
      { x: 9, z: -10, w: 1.2, h: 10, d: 1.4 },
    ]

    layout.forEach(b => addBuilding(scene, b.x, b.z, b.w, b.h, b.d))

    // Ground / road
    const roadGeo = new THREE.PlaneGeometry(30, 8)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x111111 })
    const road = new THREE.Mesh(roadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0, 1)
    scene.add(road)
    objects.push(road)

    // Road markings
    for (let i = -6; i < 7; i++) {
      const markGeo = new THREE.PlaneGeometry(0.15, 1.2)
      const markMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 })
      const mark = new THREE.Mesh(markGeo, markMat)
      mark.rotation.x = -Math.PI / 2
      mark.position.set(i * 1.8, 0.01, 1)
      scene.add(mark)
      objects.push(mark)
    }

    // Cars on two lanes
    for (let i = 0; i < 5; i++) addCar(scene, -0.5, -10 + i * 4, 1)
    for (let i = 0; i < 4; i++) addCar(scene, 0.5, 10 - i * 4.5, -1)

    // Street lights
    for (let i = -5; i <= 5; i += 3.5) {
      addStreetLight(scene, i, -1.5)
      addStreetLight(scene, i, 3.5)
    }

    // Moon sphere
    const moonGeo = new THREE.SphereGeometry(0.5, 12, 12)
    const moonMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
    const moonMesh = new THREE.Mesh(moonGeo, moonMat)
    moonMesh.position.set(-8, 12, -15)
    scene.add(moonMesh)
    objects.push(moonMesh)

    // Rain
    for (let i = 0; i < 4000; i++) {
      rainPos[i * 3 + 0] = (Math.random() - 0.5) * 25
      rainPos[i * 3 + 1] = Math.random() * 14
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 20
      rainVelX[i] = (Math.random() - 0.5) * 0.5
    }
    rainGeo = new THREE.BufferGeometry()
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
    const rainMat = new THREE.PointsMaterial({ color: 0x7eb8f7, size: 0.04, transparent: true, opacity: 0.6 })
    const rainPts = new THREE.Points(rainGeo, rainMat)
    scene.add(rainPts)
    objects.push(rainPts)

    cam.position.set(0, 2.5, 9)
    cam.lookAt(0, 3, -4)
  }

  function animate(delta: number, time: number) {
    if (!camera || !rainGeo) return

    // Subtle camera drift — feels like standing on the street
    orbitAngle += delta * 0.04
    camera.position.x = Math.sin(orbitAngle) * 3
    camera.position.y = 2.5 + Math.sin(time * 0.15) * 0.3
    camera.lookAt(Math.sin(orbitAngle * 0.5) * 2, 4, -6)

    // Cars move along street
    cars.forEach(car => {
      car.mesh.position.x += car.speed * car.dir * delta
      if (car.dir === 1 && car.mesh.position.x > 14) car.mesh.position.x = -14
      if (car.dir === -1 && car.mesh.position.x < -14) car.mesh.position.x = 14
    })

    // Window flicker
    windowMeshes.forEach(w => {
      const flicker = Math.sin(time * 0.4 + w.phase) * 0.15
      w.mat.emissiveIntensity = Math.max(0.1, w.mat.emissiveIntensity + flicker * delta)
    })

    // Street lights pulse gently
    lights.forEach((l, i) => {
      l.intensity = 0.8 + Math.sin(time * 0.3 + i) * 0.15
    })

    // Rain falls with slight wind
    for (let i = 0; i < 4000; i++) {
      rainPos[i * 3 + 0] += rainVelX[i] * delta * 60 * 0.015
      rainPos[i * 3 + 1] -= 5 * delta
      if (rainPos[i * 3 + 1] < -1) {
        rainPos[i * 3 + 1] = 13
        rainPos[i * 3 + 0] = (Math.random() - 0.5) * 25
      }
    }
    ;(rainGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    cars.length = 0
    lights.length = 0
    windowMeshes.length = 0
    rainGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
