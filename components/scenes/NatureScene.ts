import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createNatureScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const foliageMeshes: THREE.Mesh[] = []
  const clouds: { mesh: THREE.Mesh; speed: number }[] = []
  let particleGeo: THREE.BufferGeometry | null = null
  let waterGeo: THREE.BufferGeometry | null = null
  const particlePos = new Float32Array(600 * 3)
  const particleVel = new Float32Array(600 * 3)
  let waterVerts: Float32Array | null = null
  let camera: THREE.PerspectiveCamera | null = null

  function addTree(scene: THREE.Scene, x: number, z: number, scale: number, layers: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.09 * scale, 0.13 * scale, 1.4 * scale, 7)
    const trunk = new THREE.Mesh(trunkGeo, mat.clone())
    trunk.position.set(x, 0.7 * scale, z)
    scene.add(trunk)
    objects.push(trunk)

    // Stacked cone layers for fuller foliage
    for (let l = 0; l < layers; l++) {
      const coneRadius = (0.85 - l * 0.12) * scale
      const coneH = (1.8 - l * 0.1) * scale
      const coneGeo = new THREE.ConeGeometry(coneRadius, coneH, 9)
      const cone = new THREE.Mesh(coneGeo, mat.clone())
      cone.position.set(x, (1.4 + l * 0.9 * scale + coneH / 2) * scale * 0.62, z)
      scene.add(cone)
      objects.push(cone)
      foliageMeshes.push(cone)
    }
  }

  function addCloud(scene: THREE.Scene, x: number, y: number, z: number) {
    const group = new THREE.Group()
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const puffs = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < puffs; i++) {
      const r = 0.4 + Math.random() * 0.5
      const geo = new THREE.SphereGeometry(r, 8, 6)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set((i - puffs / 2) * 0.6, Math.random() * 0.3, Math.random() * 0.3)
      group.add(mesh)
    }
    group.position.set(x, y, z)
    scene.add(group)
    const flatMesh = group.children[0] as THREE.Mesh
    clouds.push({ mesh: flatMesh, speed: 0.3 + Math.random() * 0.4 })
    objects.push(group)
    return group
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.03)

    const ambient = new THREE.AmbientLight(0xffffff, 0.35)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0x86efac, 0.8)
    sun.position.set(-4, 10, 3)
    scene.add(sun)
    // Fill light from opposite
    const fill = new THREE.DirectionalLight(0x86efac, 0.3)
    fill.position.set(6, 5, -3)
    scene.add(fill)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Ground
    const groundGeo = new THREE.PlaneGeometry(40, 30)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x0d0d0d })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    scene.add(ground)
    objects.push(ground)

    // Rolling hills (simple displaced planes)
    for (let h = 0; h < 3; h++) {
      const hillGeo = new THREE.SphereGeometry(4 + h * 2, 12, 8)
      const hillMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a })
      const hill = new THREE.Mesh(hillGeo, hillMat)
      hill.scale.y = 0.3
      hill.position.set(-6 + h * 5, -1.1, -8 - h * 2)
      scene.add(hill)
      objects.push(hill)
    }

    // Trees — varied sizes and positions
    const treeData: [number, number, number, number][] = [
      [-8, -6, 1.4, 3], [-5.5, -7, 1.1, 2], [-3, -8, 1.6, 3], [-1, -7.5, 0.9, 2],
      [1.5, -8, 1.3, 3], [4, -7, 1.5, 3], [6.5, -6.5, 1.0, 2], [8.5, -7.5, 1.2, 2],
      [-7, -4, 0.8, 2], [7, -4, 0.7, 2], [-9.5, -5, 1.7, 3], [9.5, -5, 1.5, 3],
      [-4, -5, 0.6, 2], [3, -5.5, 0.7, 2], [0, -9, 1.8, 3],
    ]
    treeData.forEach(([x, z, scale, layers]) => addTree(scene, x, z, scale, layers))

    // Foreground trees (bigger, closer)
    addTree(scene, -11, -2, 1.9, 3)
    addTree(scene, 11, -2, 1.6, 3)

    // Water stream (animated plane)
    const waterW = 3
    const waterL = 12
    const wSeg = 20
    const wGeo = new THREE.PlaneGeometry(waterW, waterL, wSeg, wSeg * 2)
    waterVerts = (wGeo.attributes.position as THREE.BufferAttribute).array as Float32Array
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x86efac, transparent: true, opacity: 0.45 })
    const waterMesh = new THREE.Mesh(wGeo, waterMat)
    waterMesh.rotation.x = -Math.PI / 2
    waterMesh.position.set(0, 0.01, 1)
    scene.add(waterMesh)
    objects.push(waterMesh)
    waterGeo = wGeo

    // Rocks along stream
    const rockPositions: [number, number, number][] = [
      [-1.8, 0.1, 0], [1.5, 0.08, -1], [-1, 0.12, 2], [1.2, 0.09, 3],
      [-1.5, 0.1, -2.5], [0.8, 0.1, -3.5],
    ]
    rockPositions.forEach(([rx, ry, rz]) => {
      const scale = 0.15 + Math.random() * 0.2
      const rGeo = new THREE.DodecahedronGeometry(scale, 0)
      const rMesh = new THREE.Mesh(rGeo, mat.clone())
      rMesh.position.set(rx, ry, rz)
      rMesh.rotation.set(Math.random(), Math.random(), Math.random())
      scene.add(rMesh)
      objects.push(rMesh)
    })

    // Clouds
    for (let c = 0; c < 6; c++) {
      const cg = addCloud(scene, (Math.random() - 0.5) * 20, 7 + Math.random() * 3, -8 - Math.random() * 6)
      cg.scale.set(1.2 + Math.random() * 0.8, 0.5 + Math.random() * 0.3, 0.8 + Math.random() * 0.4)
    }

    // Moon
    const moonGeo = new THREE.SphereGeometry(0.6, 12, 12)
    const moonMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x86efac, emissiveIntensity: 0.5 })
    const moonMesh = new THREE.Mesh(moonGeo, moonMat)
    moonMesh.position.set(6, 11, -14)
    scene.add(moonMesh)
    objects.push(moonMesh)

    // Moon glow
    const moonLight = new THREE.PointLight(0x86efac, 0.5, 30)
    moonLight.position.set(6, 11, -14)
    scene.add(moonLight)
    objects.push(moonLight)

    // Firefly particles
    for (let i = 0; i < 600; i++) {
      particlePos[i * 3 + 0] = (Math.random() - 0.5) * 18
      particlePos[i * 3 + 1] = 0.3 + Math.random() * 5
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3
      particleVel[i * 3 + 0] = (Math.random() - 0.5) * 0.4
      particleVel[i * 3 + 1] = (Math.random() - 0.5) * 0.15
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    }
    particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    const pMat = new THREE.PointsMaterial({ color: 0x86efac, size: 0.1, transparent: true, opacity: 0.7 })
    const pts = new THREE.Points(particleGeo, pMat)
    scene.add(pts)
    objects.push(pts)

    cam.position.set(0, 2.8, 11)
    cam.lookAt(0, 2, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !particleGeo) return

    // Camera breathes and drifts
    camera.position.y = 2.8 + Math.sin(time * 0.18) * 0.4
    camera.position.x = Math.sin(time * 0.08) * 1.2
    camera.lookAt(0, 2.2, -1)

    // Foliage sway
    foliageMeshes.forEach((mesh, i) => {
      mesh.rotation.z = Math.sin(time * 0.6 + i * 0.5) * 0.04
      mesh.rotation.x = Math.sin(time * 0.4 + i * 0.3) * 0.02
    })

    // Clouds drift
    clouds.forEach(({ mesh, speed }) => {
      const parent = mesh.parent as THREE.Group
      if (parent) {
        parent.position.x += speed * delta * 0.4
        if (parent.position.x > 15) parent.position.x = -15
      }
    })

    // Water ripples
    if (waterGeo && waterVerts) {
      const pos = waterGeo.attributes.position as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        const x = arr[i * 3 + 0]
        const z = arr[i * 3 + 2]
        arr[i * 3 + 1] = Math.sin(time * 2.5 + x * 2 + z * 1.5) * 0.06
      }
      pos.needsUpdate = true
      waterGeo.computeVertexNormals()
    }

    // Fireflies drift
    for (let i = 0; i < 600; i++) {
      particlePos[i * 3 + 0] += (particleVel[i * 3 + 0] + Math.sin(time * 0.8 + i * 0.4) * 0.008) * delta
      particlePos[i * 3 + 1] += (particleVel[i * 3 + 1] + Math.sin(time * 0.5 + i * 0.3) * 0.005) * delta
      particlePos[i * 3 + 2] += particleVel[i * 3 + 2] * delta

      if (Math.abs(particlePos[i * 3 + 0]) > 10) particleVel[i * 3 + 0] *= -1
      if (particlePos[i * 3 + 1] > 6) particleVel[i * 3 + 1] = -Math.abs(particleVel[i * 3 + 1])
      if (particlePos[i * 3 + 1] < 0.2) particleVel[i * 3 + 1] = Math.abs(particleVel[i * 3 + 1])
      if (Math.abs(particlePos[i * 3 + 2]) > 8) particleVel[i * 3 + 2] *= -1
    }
    ;(particleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    foliageMeshes.length = 0
    clouds.length = 0
    particleGeo = null
    waterGeo = null
    waterVerts = null
    camera = null
  }

  return { init, animate, dispose }
}
