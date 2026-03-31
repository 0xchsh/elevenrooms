import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createLibraryScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let dustGeo: THREE.BufferGeometry | null = null
  const dustPos = new Float32Array(400 * 3)
  const dustVel = new Float32Array(400 * 3)
  let lampLight: THREE.PointLight | null = null
  let camera: THREE.PerspectiveCamera | null = null

  function addBookshelf(scene: THREE.Scene, x: number, z: number, rotY: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const group = new THREE.Group()

    // Frame
    const frameGeo = new THREE.BoxGeometry(2.2, 3.5, 0.25)
    const frame = new THREE.Mesh(frameGeo, mat.clone())
    group.add(frame)

    // Shelves
    for (let s = 0; s < 5; s++) {
      const shelfGeo = new THREE.BoxGeometry(2.1, 0.06, 0.22)
      const shelf = new THREE.Mesh(shelfGeo, mat.clone())
      shelf.position.set(0, -1.5 + s * 0.65, 0)
      group.add(shelf)

      // Books on shelf
      let xOffset = -0.95
      while (xOffset < 0.9) {
        const bw = 0.06 + Math.random() * 0.1
        const bh = 0.28 + Math.random() * 0.2
        const bookGeo = new THREE.BoxGeometry(bw, bh, 0.18)
        const book = new THREE.Mesh(bookGeo, mat.clone())
        book.position.set(xOffset + bw / 2, -1.5 + s * 0.65 + 0.03 + bh / 2, 0)
        book.rotation.z = (Math.random() - 0.5) * 0.08
        group.add(book)
        xOffset += bw + 0.01
      }
    }

    group.position.set(x, 1.75, z)
    group.rotation.y = rotY
    scene.add(group)
    objects.push(group)
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    const ambient = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambient)

    lampLight = new THREE.PointLight(0xc8a97e, 2.5, 10)
    lampLight.position.set(0.8, 2.0, 1.5)
    scene.add(lampLight)
    objects.push(lampLight)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor
    const floorGeo = new THREE.PlaneGeometry(16, 14)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x0d0d0d }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(16, 14)
    const ceil = new THREE.Mesh(ceilGeo, new THREE.MeshLambertMaterial({ color: 0x080808 }))
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = 4
    scene.add(ceil)
    objects.push(ceil)

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(16, 4)
    const wall = new THREE.Mesh(wallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    wall.position.set(0, 2, -6.5)
    scene.add(wall)
    objects.push(wall)

    // Bookshelves along back wall
    addBookshelf(scene, -5, -5.5, 0)
    addBookshelf(scene, -2.5, -5.5, 0)
    addBookshelf(scene, 0, -5.5, 0)
    addBookshelf(scene, 2.5, -5.5, 0)
    addBookshelf(scene, 5, -5.5, 0)
    // Side shelves
    addBookshelf(scene, -6.8, -2, Math.PI / 2)
    addBookshelf(scene, -6.8, 1.5, Math.PI / 2)

    // Reading desk
    const deskParts = [
      { w: 2.0, h: 0.06, d: 0.9, x: 0.8, y: 0.78, z: 1.5 },
      { w: 0.06, h: 0.78, d: 0.9, x: -0.17, y: 0.39, z: 1.5 },
      { w: 0.06, h: 0.78, d: 0.9, x: 1.77, y: 0.39, z: 1.5 },
    ]
    deskParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Lamp on desk
    const lampBaseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.06, 10)
    const lampBase = new THREE.Mesh(lampBaseGeo, mat.clone())
    lampBase.position.set(0.8, 0.84, 1.5)
    scene.add(lampBase)
    objects.push(lampBase)

    const lampPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6)
    const lampPole = new THREE.Mesh(lampPoleGeo, mat.clone())
    lampPole.position.set(0.8, 1.32, 1.5)
    scene.add(lampPole)
    objects.push(lampPole)

    const lampShadeGeo = new THREE.ConeGeometry(0.22, 0.3, 12, 1, true)
    const lampShadeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xc8a97e, emissiveIntensity: 0.5, side: THREE.DoubleSide })
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat)
    lampShade.rotation.x = Math.PI
    lampShade.position.set(0.8, 1.65, 1.5)
    scene.add(lampShade)
    objects.push(lampShade)

    // Open book on desk
    const bookGeo = new THREE.BoxGeometry(0.5, 0.02, 0.35)
    const book = new THREE.Mesh(bookGeo, mat.clone())
    book.position.set(0.6, 0.82, 1.55)
    book.rotation.y = 0.2
    scene.add(book)
    objects.push(book)

    // Globe
    const globeGeo = new THREE.SphereGeometry(0.2, 12, 12)
    const globe = new THREE.Mesh(globeGeo, mat.clone())
    globe.position.set(1.5, 1.0, 1.4)
    scene.add(globe)
    objects.push(globe)

    const globeStandGeo = new THREE.CylinderGeometry(0.02, 0.08, 0.22, 8)
    const globeStand = new THREE.Mesh(globeStandGeo, mat.clone())
    globeStand.position.set(1.5, 0.89, 1.4)
    scene.add(globeStand)
    objects.push(globeStand)

    // Tall window light shaft
    const shaftGeo = new THREE.CylinderGeometry(0.01, 0.8, 3.5, 6, 1, true)
    const shaftMat = new THREE.MeshLambertMaterial({ color: 0xc8a97e, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
    const shaft = new THREE.Mesh(shaftGeo, shaftMat)
    shaft.position.set(-3, 2, 0)
    shaft.rotation.z = -0.3
    scene.add(shaft)
    objects.push(shaft)

    // Dust motes
    for (let i = 0; i < 400; i++) {
      dustPos[i * 3 + 0] = (Math.random() - 0.5) * 12
      dustPos[i * 3 + 1] = 0.3 + Math.random() * 3.5
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10
      dustVel[i * 3 + 0] = (Math.random() - 0.5) * 0.1
      dustVel[i * 3 + 1] = (Math.random() - 0.5) * 0.05
      dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }
    dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dustMat = new THREE.PointsMaterial({ color: 0xc8a97e, size: 0.04, transparent: true, opacity: 0.4 })
    const dustPts = new THREE.Points(dustGeo, dustMat)
    scene.add(dustPts)
    objects.push(dustPts)

    cam.position.set(-1, 1.8, 5)
    cam.lookAt(0, 1.5, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !dustGeo || !lampLight) return

    camera.position.x = Math.sin(time * 0.1) * 1.2
    camera.position.y = 1.8 + Math.sin(time * 0.07) * 0.15
    camera.lookAt(Math.sin(time * 0.08) * 0.5, 1.5, -1)

    // Lamp gentle flicker
    lampLight.intensity = 2.4 + Math.sin(time * 2.1) * 0.15

    // Dust drifts slowly
    for (let i = 0; i < 400; i++) {
      dustPos[i * 3 + 0] += (dustVel[i * 3 + 0] + Math.sin(time * 0.3 + i * 0.2) * 0.002) * delta
      dustPos[i * 3 + 1] += (dustVel[i * 3 + 1] + Math.cos(time * 0.2 + i * 0.15) * 0.001) * delta
      dustPos[i * 3 + 2] += dustVel[i * 3 + 2] * delta
      if (Math.abs(dustPos[i * 3 + 0]) > 7) dustVel[i * 3 + 0] *= -1
      if (dustPos[i * 3 + 1] > 3.8) dustVel[i * 3 + 1] = -Math.abs(dustVel[i * 3 + 1])
      if (dustPos[i * 3 + 1] < 0.2) dustVel[i * 3 + 1] = Math.abs(dustVel[i * 3 + 1])
      if (Math.abs(dustPos[i * 3 + 2]) > 6) dustVel[i * 3 + 2] *= -1
    }
    ;(dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    dustGeo = null
    lampLight = null
    camera = null
  }

  return { init, animate, dispose }
}
