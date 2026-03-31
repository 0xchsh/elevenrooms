import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

interface BlinkLight {
  light: THREE.PointLight
  mesh: THREE.Mesh
  phase: number
  interval: number
}

export function createSpaceStationScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const blinkLights: BlinkLight[] = []
  let starGeo: THREE.BufferGeometry | null = null
  const starPos = new Float32Array(2000 * 3)
  let stationGroup: THREE.Group | null = null
  let earthMesh: THREE.Mesh | null = null
  let camera: THREE.PerspectiveCamera | null = null

  function addBlinkLight(scene: THREE.Scene, x: number, y: number, z: number, phase: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x22d3ee, emissiveIntensity: 1 })
    const geo = new THREE.SphereGeometry(0.04, 6, 6)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    objects.push(mesh)

    const light = new THREE.PointLight(0x22d3ee, 0.8, 3)
    light.position.set(x, y, z)
    scene.add(light)
    objects.push(light)

    blinkLights.push({ light, mesh, phase, interval: 1.5 + Math.random() * 2 })
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    const ambient = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambient)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    sunLight.position.set(20, 10, 5)
    scene.add(sunLight)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Stars
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 60 + Math.random() * 40
      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPos[i * 3 + 2] = r * Math.cos(phi)
    }
    starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)
    objects.push(stars)

    // Earth (partial sphere below)
    const earthGeo = new THREE.SphereGeometry(18, 24, 20)
    const earthMat = new THREE.MeshLambertMaterial({ color: 0x1a3a5c, emissive: 0x071525, emissiveIntensity: 0.5 })
    earthMesh = new THREE.Mesh(earthGeo, earthMat)
    earthMesh.position.set(0, -22, 0)
    scene.add(earthMesh)
    objects.push(earthMesh)

    // Station group (rotates slowly)
    stationGroup = new THREE.Group()

    // Central hub
    const hubGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.5, 16)
    const hub = new THREE.Mesh(hubGeo, mat.clone())
    hub.rotation.z = Math.PI / 2
    stationGroup.add(hub)

    // Docking modules along main axis
    const modulePositions = [-4, -2, 2, 4] as const
    modulePositions.forEach(mx => {
      const modGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 12)
      const mod = new THREE.Mesh(modGeo, mat.clone())
      mod.rotation.z = Math.PI / 2
      mod.position.set(mx, 0, 0)
      stationGroup!.add(mod)

      // Connecting ring
      const ringGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 16)
      const ring = new THREE.Mesh(ringGeo, mat.clone())
      ring.rotation.y = Math.PI / 2
      ring.position.set(mx < 0 ? mx + 0.8 : mx - 0.8, 0, 0)
      stationGroup!.add(ring)
    })

    // Solar panels (4 large flat arrays)
    const panelData: [number, number, number, number][] = [
      [0, 0, 3.5, 0], [0, 0, -3.5, 0],
      [0, 3.5, 0, Math.PI / 2], [0, -3.5, 0, Math.PI / 2]
    ]
    panelData.forEach(([px, py, pz, rot]) => {
      const panelGeo = new THREE.BoxGeometry(3.5, 0.06, 1.4)
      const panelMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x001133, emissiveIntensity: 0.8 })
      const panel = new THREE.Mesh(panelGeo, panelMat)
      panel.position.set(px, py, pz)
      panel.rotation.y = rot
      // Arm connecting to hub
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6)
      const arm = new THREE.Mesh(armGeo, mat.clone())
      if (pz !== 0) {
        arm.position.set(0, 0, pz / 2)
      } else {
        arm.rotation.z = Math.PI / 2
        arm.position.set(0, py / 2, 0)
      }
      stationGroup!.add(panel)
      stationGroup!.add(arm)
    })

    // Viewport windows
    for (let i = -1; i <= 1; i++) {
      const winGeo = new THREE.CircleGeometry(0.18, 10)
      const winMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x22d3ee, emissiveIntensity: 0.4 })
      const win = new THREE.Mesh(winGeo, winMat)
      win.position.set(i * 0.7, 0.96, 0.05)
      stationGroup!.add(win)
    }

    scene.add(stationGroup)
    objects.push(stationGroup)

    // Blinking navigation lights
    addBlinkLight(scene, 6, 0, 0, 0)
    addBlinkLight(scene, -6, 0, 0, Math.PI)
    addBlinkLight(scene, 0, 0, 3.5, 1)
    addBlinkLight(scene, 0, 0, -3.5, 2.5)
    addBlinkLight(scene, 0, 3.5, 0, 0.8)

    cam.position.set(8, 4, 10)
    cam.lookAt(0, 0, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !stationGroup) return

    // Slow station rotation
    stationGroup.rotation.y += delta * 0.04

    // Orbit camera around station
    const orbitR = 12
    camera.position.x = Math.sin(time * 0.06) * orbitR
    camera.position.y = 3 + Math.sin(time * 0.04) * 2
    camera.position.z = Math.cos(time * 0.06) * orbitR
    camera.lookAt(0, 0, 0)

    // Earth slow rotate
    if (earthMesh) earthMesh.rotation.y += delta * 0.01

    // Blinking lights
    blinkLights.forEach(({ light, mesh, phase, interval }) => {
      const on = Math.sin(time * (Math.PI * 2 / interval) + phase) > 0.3
      light.intensity = on ? 1.2 : 0
      ;(mesh.material as THREE.MeshLambertMaterial).emissiveIntensity = on ? 1.0 : 0.05
    })
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
    blinkLights.length = 0
    starGeo = null
    stationGroup = null
    earthMesh = null
    camera = null
  }

  return { init, animate, dispose }
}
