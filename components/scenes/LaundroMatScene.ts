import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createLaundroMatScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const machinePortals: THREE.Mesh[] = []
  const drumMeshes: THREE.Mesh[] = []
  let lintGeo: THREE.BufferGeometry | null = null
  const lintPos = new Float32Array(180 * 3)
  const lintVel = new Float32Array(180 * 3)
  const fluorLights: THREE.RectAreaLight[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function addWasher(scene: THREE.Scene, x: number, z: number, isDryer = false) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.65), mat.clone())
    body.position.set(x, 0.425, z)
    scene.add(body)
    objects.push(body)

    // Porthole ring
    const ringGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 20)
    const ring = new THREE.Mesh(ringGeo, mat.clone())
    ring.position.set(x, 0.44, z + 0.33)
    scene.add(ring)
    objects.push(ring)

    // Porthole glass (emissive when active)
    const glassEmissive = isDryer ? 0.15 : 0.25
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: glassEmissive,
      transparent: true,
      opacity: 0.7,
    })
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.19, 16), glassMat)
    glass.position.set(x, 0.44, z + 0.345)
    scene.add(glass)
    objects.push(glass)
    machinePortals.push(glass)

    // Drum (visible through porthole, spins)
    if (!isDryer) {
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 8), mat.clone())
      drum.rotation.x = Math.PI / 2
      drum.position.set(x, 0.44, z + 0.3)
      scene.add(drum)
      objects.push(drum)
      drumMeshes.push(drum)
    }

    // Control panel on top
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.2), mat.clone())
    panel.position.set(x, 0.91, z - 0.2)
    scene.add(panel)
    objects.push(panel)

    // Knob
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), mat.clone())
    knob.rotation.x = Math.PI / 2
    knob.position.set(x - 0.15, 0.97, z - 0.13)
    scene.add(knob)
    objects.push(knob)
  }

  function addChair(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.42), mat.clone())
    seat.position.set(x, 0.44, z)
    scene.add(seat)
    objects.push(seat)

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.4, 0.04), mat.clone())
    back.position.set(x, 0.66, z - 0.19)
    scene.add(back)
    objects.push(back)

    for (const [lx, lz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 4), mat.clone())
      leg.position.set(x + lx, 0.22, z + lz)
      scene.add(leg)
      objects.push(leg)
    }
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.07)

    // Flat fluorescent ambient
    const ambient = new THREE.AmbientLight(0xd8eeff, 0.5)
    scene.add(ambient)

    // Overhead fluorescent tubes
    for (let i = -2; i <= 2; i++) {
      const light = new THREE.PointLight(0xd8eeff, 0.8, 10)
      light.position.set(i * 2.5, 3.2, 0)
      scene.add(light)
      fluorLights.push(light as unknown as THREE.RectAreaLight)
      objects.push(light)
    }

    // Floor — linoleum
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 14),
      new THREE.MeshLambertMaterial({ color: 0x0d0d0d })
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 5),
      new THREE.MeshLambertMaterial({ color: 0x0a0a0a })
    )
    wall.position.set(0, 2.5, -5)
    scene.add(wall)
    objects.push(wall)

    // Row of washers along back wall
    for (let i = 0; i < 5; i++) {
      addWasher(scene, -4 + i * 2, -3.8)
    }

    // Row of dryers opposite
    for (let i = 0; i < 5; i++) {
      addWasher(scene, -4 + i * 2, -3.8, true)
    }

    // Dryer row on raised platform (stacked dryers)
    for (let i = 0; i < 4; i++) {
      const x = -3 + i * 2
      // Lower unit
      addWasher(scene, x, 3.5, true)
    }

    // Waiting chairs
    for (let i = 0; i < 4; i++) {
      addChair(scene, -2.5 + i * 1.4, 1.2)
    }

    // Folding table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.04, 0.7),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    )
    tableTop.position.set(3.5, 0.82, 0)
    scene.add(tableTop)
    objects.push(tableTop)

    // Table legs
    for (const [lx, lz] of [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.82, 4),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      )
      leg.position.set(3.5 + lx, 0.41, lz)
      scene.add(leg)
      objects.push(leg)
    }

    // Detergent bottles on table
    for (let i = 0; i < 3; i++) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.28, 6),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      )
      bottle.position.set(3.1 + i * 0.3, 1.0, 0)
      scene.add(bottle)
      objects.push(bottle)
    }

    // Lint/dust particles drifting
    for (let i = 0; i < 180; i++) {
      lintPos[i * 3 + 0] = (Math.random() - 0.5) * 12
      lintPos[i * 3 + 1] = Math.random() * 3.5
      lintPos[i * 3 + 2] = (Math.random() - 0.5) * 8
      lintVel[i * 3 + 0] = (Math.random() - 0.5) * 0.15
      lintVel[i * 3 + 1] = (Math.random() - 0.5) * 0.06
      lintVel[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }
    lintGeo = new THREE.BufferGeometry()
    lintGeo.setAttribute('position', new THREE.BufferAttribute(lintPos, 3))
    const lintMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.35 })
    const lint = new THREE.Points(lintGeo, lintMat)
    scene.add(lint)
    objects.push(lint)

    cam.position.set(0, 1.6, 6.5)
    cam.lookAt(0, 0.8, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !lintGeo) return

    // Slow camera drift — late night, nobody's moving
    camera.position.x = Math.sin(time * 0.06) * 1.5
    camera.position.y = 1.6 + Math.sin(time * 0.04) * 0.1
    camera.lookAt(Math.sin(time * 0.05) * 0.5, 0.8, 0)

    // Drums spin
    drumMeshes.forEach((drum, i) => {
      drum.rotation.z = time * (1.8 + i * 0.2)
    })

    // Porthole glow pulses slightly (machines running)
    machinePortals.forEach((portal, i) => {
      const mat = portal.material as THREE.MeshLambertMaterial
      mat.emissiveIntensity = 0.18 + Math.sin(time * 0.9 + i * 1.1) * 0.06
    })

    // Fluorescent flicker — occasional subtle stutter
    objects.forEach(o => {
      if (o instanceof THREE.PointLight) {
        (o as THREE.PointLight).intensity = 0.75 + Math.sin(time * 60 + (o as THREE.PointLight).position.x) * 0.01
      }
    })

    // Lint drifts
    for (let i = 0; i < 180; i++) {
      lintPos[i * 3 + 0] += lintVel[i * 3 + 0] * delta
      lintPos[i * 3 + 1] += lintVel[i * 3 + 1] * delta
      lintPos[i * 3 + 2] += lintVel[i * 3 + 2] * delta
      if (
        Math.abs(lintPos[i * 3 + 0]) > 6 ||
        lintPos[i * 3 + 1] < 0 || lintPos[i * 3 + 1] > 3.5 ||
        Math.abs(lintPos[i * 3 + 2]) > 4
      ) {
        lintPos[i * 3 + 0] = (Math.random() - 0.5) * 12
        lintPos[i * 3 + 1] = Math.random() * 3.5
        lintPos[i * 3 + 2] = (Math.random() - 0.5) * 8
      }
    }
    ;(lintGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    machinePortals.length = 0
    drumMeshes.length = 0
    fluorLights.length = 0
    lintGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
