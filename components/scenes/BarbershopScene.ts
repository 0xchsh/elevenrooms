import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createBarbershopScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let poleAngle = 0
  const poleMeshes: THREE.Mesh[] = []
  const overheadLights: THREE.PointLight[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function addBarberChair(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    // Base cylinder
    const baseGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.12, 12)
    const base = new THREE.Mesh(baseGeo, mat.clone())
    base.position.set(x, 0.06, z)
    scene.add(base)
    objects.push(base)
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8)
    const pole = new THREE.Mesh(poleGeo, mat.clone())
    pole.position.set(x, 0.39, z)
    scene.add(pole)
    objects.push(pole)
    // Seat
    const seatGeo = new THREE.BoxGeometry(0.7, 0.12, 0.65)
    const seat = new THREE.Mesh(seatGeo, mat.clone())
    seat.position.set(x, 0.72, z)
    scene.add(seat)
    objects.push(seat)
    // Backrest
    const backGeo = new THREE.BoxGeometry(0.7, 0.7, 0.1)
    const back = new THREE.Mesh(backGeo, mat.clone())
    back.position.set(x, 1.07, z + 0.28)
    scene.add(back)
    objects.push(back)
    // Headrest
    const headGeo = new THREE.BoxGeometry(0.4, 0.22, 0.09)
    const head = new THREE.Mesh(headGeo, mat.clone())
    head.position.set(x, 1.55, z + 0.27)
    scene.add(head)
    objects.push(head)
    // Footrest
    const footGeo = new THREE.BoxGeometry(0.5, 0.06, 0.18)
    const foot = new THREE.Mesh(footGeo, mat.clone())
    foot.position.set(x, 0.52, z - 0.3)
    scene.add(foot)
    objects.push(foot)
  }

  function addBarberPole(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    // Pole base
    const baseGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.1, 10)
    const base = new THREE.Mesh(baseGeo, mat.clone())
    base.position.set(x, 0.05, z)
    scene.add(base)
    objects.push(base)
    // Main pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 10)
    const pole = new THREE.Mesh(poleGeo, mat.clone())
    pole.position.set(x, 1.2, z)
    scene.add(pole)
    objects.push(pole)
    poleMeshes.push(pole)
    // Spiral stripes (torus rings)
    for (let i = 0; i < 8; i++) {
      const stripeGeo = new THREE.TorusGeometry(0.05, 0.018, 6, 12)
      const stripe = new THREE.Mesh(stripeGeo, mat.clone())
      stripe.position.set(x, 0.2 + i * 0.26, z)
      scene.add(stripe)
      objects.push(stripe)
    }
    // Top cap
    const capGeo = new THREE.SphereGeometry(0.08, 10, 8)
    const cap = new THREE.Mesh(capGeo, mat.clone())
    cap.position.set(x, 2.38, z)
    scene.add(cap)
    objects.push(cap)
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)

    // Overhead lights
    const lightPositions = [[-2, 0], [0, 0], [2, 0]] as const
    lightPositions.forEach(([lx, lz]) => {
      const l = new THREE.PointLight(0xfff5e0, 2, 8)
      l.position.set(lx, 3.2, lz)
      scene.add(l)
      objects.push(l)
      overheadLights.push(l)
    })

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor
    const floorGeo = new THREE.PlaneGeometry(14, 10)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x111111 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(14, 4.5)
    const wall = new THREE.Mesh(wallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    wall.position.set(0, 2.25, -4.5)
    scene.add(wall)
    objects.push(wall)

    // Long mirror along back wall
    const mirrorGeo = new THREE.PlaneGeometry(10, 2.4)
    const mirrorMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x666666, emissiveIntensity: 0.12 })
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat)
    mirror.position.set(0, 2.0, -4.45)
    scene.add(mirror)
    objects.push(mirror)

    // Counter beneath mirror
    const counterGeo = new THREE.BoxGeometry(10, 0.08, 0.45)
    const counter = new THREE.Mesh(counterGeo, mat.clone())
    counter.position.set(0, 0.85, -4.2)
    scene.add(counter)
    objects.push(counter)

    // Bottles and tools on counter
    for (let i = -4.5; i < 4.5; i += 0.55) {
      const height = 0.1 + Math.random() * 0.3
      const isBottle = Math.random() > 0.4
      const geo = isBottle
        ? new THREE.CylinderGeometry(0.04, 0.06, height, 8)
        : new THREE.BoxGeometry(0.08, height, 0.06)
      const item = new THREE.Mesh(geo, mat.clone())
      item.position.set(i, 0.85 + height / 2 + 0.04, -4.1)
      scene.add(item)
      objects.push(item)
    }

    // 3 barber chairs
    addBarberChair(scene, -2.5, 0)
    addBarberChair(scene, 0, 0)
    addBarberChair(scene, 2.5, 0)

    // Waiting chairs along side wall
    const waitPositions = [[-5.5, -2.5], [-5.5, -1.5], [-5.5, -0.5]] as const
    waitPositions.forEach(([wx, wz]) => {
      const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5)
      const s = new THREE.Mesh(seatGeo, mat.clone())
      s.position.set(wx, 0.44, wz)
      scene.add(s)
      objects.push(s)
      const backrGeo = new THREE.BoxGeometry(0.5, 0.5, 0.06)
      const br = new THREE.Mesh(backrGeo, mat.clone())
      br.position.set(wx, 0.7, wz + 0.23)
      scene.add(br)
      objects.push(br)
    })

    // Barber poles at entrance
    addBarberPole(scene, -4.5, -3.8)
    addBarberPole(scene, 4.5, -3.8)

    // Ceiling light fixtures
    lightPositions.forEach(([lx]) => {
      const fixtureGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.12, 12)
      const fixtureMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xfff5e0, emissiveIntensity: 0.6 })
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat)
      fixture.position.set(lx, 3.5, 0)
      scene.add(fixture)
      objects.push(fixture)
    })

    cam.position.set(0, 2.2, 6)
    cam.lookAt(0, 1.2, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera) return

    camera.position.x = Math.sin(time * 0.15) * 2
    camera.lookAt(Math.sin(time * 0.1) * 0.8, 1.2, -1)

    // Barber pole spin
    poleAngle += delta * 0.8
    poleMeshes.forEach(p => { p.rotation.y = poleAngle })

    // Light subtle flicker
    overheadLights.forEach((l, i) => {
      l.intensity = 1.9 + Math.sin(time * 1.5 + i * 2) * 0.12
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
    poleMeshes.length = 0
    overheadLights.length = 0
    camera = null
  }

  return { init, animate, dispose }
}
