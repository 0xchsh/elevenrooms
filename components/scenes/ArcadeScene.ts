import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createArcadeScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let coinGeo: THREE.BufferGeometry | null = null
  const coinPos = new Float32Array(200 * 3)
  const coinVel = new Float32Array(200 * 3)
  const coinAge = new Float32Array(200)
  const neonLights: THREE.PointLight[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function addCabinet(scene: THREE.Scene, x: number, z: number, rotY: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Cabinet body
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.9, 0.6)
    const body = new THREE.Mesh(bodyGeo, mat.clone())
    body.position.set(x, 0.95, z)
    body.rotation.y = rotY
    scene.add(body)
    objects.push(body)

    // Screen bezel (slightly inset, emissive)
    const screenMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
    const screenGeo = new THREE.BoxGeometry(0.52, 0.38, 0.05)
    const screen = new THREE.Mesh(screenGeo, screenMat)
    const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY)
    screen.position.set(x + fwd.x * 0.31, 1.35, z + fwd.z * 0.31)
    screen.rotation.y = rotY
    scene.add(screen)
    objects.push(screen)

    // Control panel (angled top box)
    const panelGeo = new THREE.BoxGeometry(0.75, 0.08, 0.35)
    const panel = new THREE.Mesh(panelGeo, mat.clone())
    panel.position.set(x + fwd.x * 0.18, 1.08, z + fwd.z * 0.18)
    panel.rotation.y = rotY
    panel.rotation.x = -0.35
    scene.add(panel)
    objects.push(panel)

    // Joystick
    const stickBaseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8)
    const stickBase = new THREE.Mesh(stickBaseGeo, mat.clone())
    stickBase.position.set(x + fwd.x * 0.16 - 0.12, 1.16, z + fwd.z * 0.16)
    stickBase.rotation.y = rotY
    scene.add(stickBase)
    objects.push(stickBase)

    const stickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6)
    const stick = new THREE.Mesh(stickGeo, mat.clone())
    stick.position.set(x + fwd.x * 0.16 - 0.12, 1.24, z + fwd.z * 0.16)
    stick.rotation.y = rotY
    scene.add(stick)
    objects.push(stick)

    // Buttons (3 small spheres)
    for (let b = 0; b < 3; b++) {
      const btnGeo = new THREE.SphereGeometry(0.03, 6, 6)
      const btn = new THREE.Mesh(btnGeo, mat.clone())
      btn.position.set(x + fwd.x * 0.2 + 0.05 + b * 0.08, 1.16, z + fwd.z * 0.2)
      btn.rotation.y = rotY
      scene.add(btn)
      objects.push(btn)
    }

    // Cabinet top marquee
    const marqueeGeo = new THREE.BoxGeometry(0.82, 0.28, 0.08)
    const marqueeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4 })
    const marquee = new THREE.Mesh(marqueeGeo, marqueeMat)
    marquee.position.set(x + fwd.x * 0.28, 1.97, z + fwd.z * 0.28)
    marquee.rotation.y = rotY
    scene.add(marquee)
    objects.push(marquee)

    // Legs (2 front, 2 back)
    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 6)
    const legOffsets = [-0.28, 0.28]
    legOffsets.forEach(ox => {
      const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY)
      const leg = new THREE.Mesh(legGeo, mat.clone())
      leg.position.set(x + side.x * ox, 0.06, z + side.z * ox)
      scene.add(leg)
      objects.push(leg)
    })
  }

  function addScorePanel(scene: THREE.Scene, x: number, y: number, z: number, rotY: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35 })
    const panelGeo = new THREE.BoxGeometry(1.2, 0.7, 0.06)
    const panel = new THREE.Mesh(panelGeo, mat)
    panel.position.set(x, y, z)
    panel.rotation.y = rotY
    scene.add(panel)
    objects.push(panel)

    // Divider lines
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.BoxGeometry(1.1, 0.03, 0.07)
      const line = new THREE.Mesh(lineGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
      line.position.set(x, y - 0.22 + i * 0.22, z)
      line.rotation.y = rotY
      scene.add(line)
      objects.push(line)
    }
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x050508, 0.055)

    const ambient = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambient)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor — large with tile pattern (alternating planes)
    const floorGeo = new THREE.PlaneGeometry(40, 30)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x111118 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Tile lines on floor (grid of thin planes)
    for (let tx = -9; tx <= 9; tx += 2) {
      const tileLineGeo = new THREE.PlaneGeometry(0.04, 30)
      const tileLine = new THREE.Mesh(tileLineGeo, new THREE.MeshLambertMaterial({ color: 0x222230 }))
      tileLine.rotation.x = -Math.PI / 2
      tileLine.position.set(tx, 0.002, 0)
      scene.add(tileLine)
      objects.push(tileLine)
    }
    for (let tz = -7; tz <= 7; tz += 2) {
      const tileLineGeo = new THREE.PlaneGeometry(40, 0.04)
      const tileLine = new THREE.Mesh(tileLineGeo, new THREE.MeshLambertMaterial({ color: 0x222230 }))
      tileLine.rotation.x = -Math.PI / 2
      tileLine.position.set(0, 0.002, tz)
      scene.add(tileLine)
      objects.push(tileLine)
    }

    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(22, 7)
    const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshLambertMaterial({ color: 0x080810 }))
    backWall.position.set(0, 3.5, -9)
    scene.add(backWall)
    objects.push(backWall)

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(22, 7)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x080810 }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-11, 3.5, 1)
    scene.add(leftWall)
    objects.push(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x080810 }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(11, 3.5, 1)
    scene.add(rightWall)
    objects.push(rightWall)

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(22, 22)
    const ceil = new THREE.Mesh(ceilGeo, new THREE.MeshLambertMaterial({ color: 0x050508 }))
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, 7, 0)
    scene.add(ceil)
    objects.push(ceil)

    // Left aisle of cabinets (facing inward)
    for (let i = 0; i < 5; i++) {
      addCabinet(scene, -4.2, -6 + i * 2.8, 0)
    }
    // Right aisle
    for (let i = 0; i < 5; i++) {
      addCabinet(scene, 4.2, -6 + i * 2.8, Math.PI)
    }
    // Far back row
    for (let i = 0; i < 4; i++) {
      addCabinet(scene, -4.5 + i * 3, -8, -Math.PI / 2)
    }

    // Overhead neon strip lights
    const neonPositions: [number, number, number][] = [
      [-4.2, 6.5, -4], [0, 6.5, -4], [4.2, 6.5, -4],
      [-4.2, 6.5, 0], [0, 6.5, 0], [4.2, 6.5, 0],
      [-4.2, 6.5, 4], [0, 6.5, 4], [4.2, 6.5, 4],
    ]
    neonPositions.forEach(([nx, ny, nz]) => {
      // Strip fixture (long box)
      const fixtureGeo = new THREE.BoxGeometry(0.12, 0.08, 1.8)
      const fixtureMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 })
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat)
      fixture.position.set(nx, ny, nz)
      scene.add(fixture)
      objects.push(fixture)

      const neonLight = new THREE.PointLight(0xffffff, 1.8, 10)
      neonLight.position.set(nx, ny - 0.1, nz)
      scene.add(neonLight)
      objects.push(neonLight)
      neonLights.push(neonLight)
    })

    // Colored neon accent lights near cabinets
    const accentColors = [0xff00ff, 0x00ffff, 0xff4400, 0x44ff00]
    accentColors.forEach((col, i) => {
      const aLight = new THREE.PointLight(col, 2.5, 6)
      aLight.position.set(-5 + i * 3.5, 1.8, -5 + i * 1.5)
      scene.add(aLight)
      objects.push(aLight)
      neonLights.push(aLight)
    })

    // Score display panels on back wall
    for (let i = 0; i < 4; i++) {
      addScorePanel(scene, -4.5 + i * 3, 4.5, -8.8, 0)
    }

    // Coin/button particle system
    for (let i = 0; i < 200; i++) {
      coinPos[i * 3 + 0] = (Math.random() - 0.5) * 9
      coinPos[i * 3 + 1] = 0.2 + Math.random() * 1.4
      coinPos[i * 3 + 2] = -8 + Math.random() * 10
      coinVel[i * 3 + 0] = (Math.random() - 0.5) * 0.3
      coinVel[i * 3 + 1] = 0.1 + Math.random() * 0.4
      coinVel[i * 3 + 2] = (Math.random() - 0.5) * 0.2
      coinAge[i] = Math.random()
    }
    coinGeo = new THREE.BufferGeometry()
    coinGeo.setAttribute('position', new THREE.BufferAttribute(coinPos, 3))
    const coinMat = new THREE.PointsMaterial({ color: 0xffd700, size: 0.06, transparent: true, opacity: 0.75 })
    const coinPts = new THREE.Points(coinGeo, coinMat)
    scene.add(coinPts)
    objects.push(coinPts)

    // Ceiling trim strip along aisle edges
    for (let side = -1; side <= 1; side += 2) {
      const trimGeo = new THREE.BoxGeometry(0.06, 0.06, 18)
      const trimMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
      const trim = new THREE.Mesh(trimGeo, trimMat)
      trim.position.set(side * 2.5, 6.9, -1)
      scene.add(trim)
      objects.push(trim)
    }

    // Barrier rope posts (small cylinders) at entrance
    for (let i = -1; i <= 1; i += 2) {
      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8)
      const post = new THREE.Mesh(postGeo, mat.clone())
      post.position.set(i * 2.5, 0.5, 7)
      scene.add(post)
      objects.push(post)

      const topGeo = new THREE.SphereGeometry(0.07, 8, 8)
      const top = new THREE.Mesh(topGeo, mat.clone())
      top.position.set(i * 2.5, 1.05, 7)
      scene.add(top)
      objects.push(top)
    }
    const ropeGeo = new THREE.CylinderGeometry(0.015, 0.015, 5, 6)
    const rope = new THREE.Mesh(ropeGeo, mat.clone())
    rope.rotation.z = Math.PI / 2
    rope.position.set(0, 0.9, 7)
    scene.add(rope)
    objects.push(rope)

    cam.position.set(0, 1.8, 8)
    cam.lookAt(0, 1.2, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !coinGeo) return

    // Camera drifts down the aisle with gentle sway and bob
    camera.position.x = Math.sin(time * 0.14) * 1.2
    camera.position.y = 1.8 + Math.sin(time * 0.22) * 0.12
    camera.lookAt(Math.sin(time * 0.1) * 0.4, 1.2, 0)

    // Neon flicker on accent lights
    neonLights.forEach((light, i) => {
      if (i >= 9) {
        // Accent lights pulse
        light.intensity = 2.0 + Math.sin(time * 3.5 + i * 1.3) * 0.8 + (Math.random() > 0.97 ? 1.5 : 0)
      } else {
        // Strip lights subtle flicker
        light.intensity = 1.7 + Math.sin(time * 7 + i * 0.9) * 0.15
      }
    })

    // Coin/button particles float upward near cabinets
    for (let i = 0; i < 200; i++) {
      coinAge[i] += delta * 0.6
      coinPos[i * 3 + 0] += coinVel[i * 3 + 0] * delta * 0.5
      coinPos[i * 3 + 1] += coinVel[i * 3 + 1] * delta
      coinPos[i * 3 + 2] += coinVel[i * 3 + 2] * delta * 0.3
      if (coinAge[i] > 1 || coinPos[i * 3 + 1] > 2.0) {
        coinPos[i * 3 + 0] = (Math.random() - 0.5) * 9
        coinPos[i * 3 + 1] = 0.2 + Math.random() * 0.2
        coinPos[i * 3 + 2] = -8 + Math.random() * 10
        coinAge[i] = 0
      }
    }
    ;(coinGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    neonLights.length = 0
    coinGeo = null
    camera = null
  }

  return { init, animate, dispose }
}
