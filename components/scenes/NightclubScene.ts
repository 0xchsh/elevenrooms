import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createNightclubScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let smokeGeo: THREE.BufferGeometry | null = null
  const smokePos = new Float32Array(200 * 3)
  const smokeVel = new Float32Array(200 * 3)
  const colorLights: THREE.PointLight[] = []
  const crowdGroups: THREE.Group[] = []
  const laserBeams: THREE.Mesh[] = []
  let mirrorBall: THREE.Mesh | null = null
  let camera: THREE.PerspectiveCamera | null = null

  function addPersonSilhouette(scene: THREE.Scene, x: number, z: number, scale: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const group = new THREE.Group()

    // Body (cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.7 * scale, 8)
    const body = new THREE.Mesh(bodyGeo, mat.clone())
    body.position.y = 0.35 * scale
    group.add(body)

    // Head (sphere)
    const headGeo = new THREE.SphereGeometry(0.16 * scale, 10, 8)
    const head = new THREE.Mesh(headGeo, mat.clone())
    head.position.y = 0.88 * scale
    group.add(head)

    // Arms raised (cylinders angled out)
    const armGeo = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.5 * scale, 6)
    const leftArm = new THREE.Mesh(armGeo, mat.clone())
    leftArm.position.set(-0.32 * scale, 0.55 * scale, 0)
    leftArm.rotation.z = Math.PI / 4
    group.add(leftArm)

    const rightArm = new THREE.Mesh(armGeo, mat.clone())
    rightArm.position.set(0.32 * scale, 0.55 * scale, 0)
    rightArm.rotation.z = -Math.PI / 4
    group.add(rightArm)

    group.position.set(x, 0, z)
    group.userData = { baseY: 0, phase: Math.random() * Math.PI * 2, bobSpeed: 1.5 + Math.random() * 1.5 }
    scene.add(group)
    objects.push(group)
    crowdGroups.push(group)
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x050508, 0.04)

    const ambient = new THREE.AmbientLight(0x0a0a14, 0.3)
    scene.add(ambient)

    // 4 colored party lights that will cycle hues
    const lightPositions = [
      { x: -4, y: 5, z: -4 },
      { x: 4, y: 5, z: -4 },
      { x: -4, y: 5, z: 4 },
      { x: 4, y: 5, z: 4 },
    ]
    lightPositions.forEach(lp => {
      const light = new THREE.PointLight(0xff0080, 2.5, 20)
      light.position.set(lp.x, lp.y, lp.z)
      scene.add(light)
      objects.push(light)
      colorLights.push(light)
    })

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor (large)
    const floorGeo = new THREE.PlaneGeometry(60, 50)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x080810 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Dance floor tile grid (5x5)
    const tileColors = [0x111118, 0x181820, 0x0e0e1a]
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const tileGeo = new THREE.BoxGeometry(1.8, 0.06, 1.8)
        const isEmissive = (row + col) % 3 === 0
        const tileMat = isEmissive
          ? new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x220033, emissiveIntensity: 0.6 })
          : new THREE.MeshLambertMaterial({ color: tileColors[(row + col) % tileColors.length] })
        const tile = new THREE.Mesh(tileGeo, tileMat)
        tile.position.set((col - 2) * 2.0, 0.03, (row - 2) * 2.0)
        scene.add(tile)
        objects.push(tile)
      }
    }

    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(22, 9)
    const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshLambertMaterial({ color: 0x050508 }))
    backWall.position.set(0, 4.5, -8)
    scene.add(backWall)
    objects.push(backWall)

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(20, 9)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x040408 }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-10, 4.5, -1)
    scene.add(leftWall)
    objects.push(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x040408 }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(10, 4.5, -1)
    scene.add(rightWall)
    objects.push(rightWall)

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(22, 20)
    const ceiling = new THREE.Mesh(ceilingGeo, new THREE.MeshLambertMaterial({ color: 0x040408 }))
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(0, 9, -1)
    scene.add(ceiling)
    objects.push(ceiling)

    // Mirror ball at ceiling
    const mirrorBallGeo = new THREE.SphereGeometry(0.55, 16, 14)
    const mirrorBallMat = new THREE.MeshLambertMaterial({
      color: 0xffffff, emissive: 0xaaaaaa, emissiveIntensity: 0.4
    })
    mirrorBall = new THREE.Mesh(mirrorBallGeo, mirrorBallMat)
    mirrorBall.position.set(0, 8.2, -2)
    scene.add(mirrorBall)
    objects.push(mirrorBall)

    // Mirror ball mount pole
    const ballPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6)
    const ballPole = new THREE.Mesh(ballPoleGeo, mat.clone())
    ballPole.position.set(0, 8.8, -2)
    scene.add(ballPole)
    objects.push(ballPole)

    // DJ booth at far end
    const boothBaseGeo = new THREE.BoxGeometry(3.5, 0.9, 1.0)
    const boothBase = new THREE.Mesh(boothBaseGeo, mat.clone())
    boothBase.position.set(0, 0.45, -7)
    scene.add(boothBase)
    objects.push(boothBase)

    // DJ equipment on booth: mixer boxes
    const mixerData = [
      { w: 1.2, h: 0.2, d: 0.7, x: 0, y: 1.0, z: -7 },
      { w: 0.5, h: 0.3, d: 0.5, x: -1.0, y: 1.05, z: -7 },
      { w: 0.5, h: 0.3, d: 0.5, x: 1.0, y: 1.05, z: -7 },
    ]
    mixerData.forEach(m => {
      const geo = new THREE.BoxGeometry(m.w, m.h, m.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(m.x, m.y, m.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // DJ monitor screen (emissive)
    const screenGeo = new THREE.PlaneGeometry(1.4, 0.85)
    const screenMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x002244, emissiveIntensity: 1.0 })
    const screen = new THREE.Mesh(screenGeo, screenMat)
    screen.position.set(0, 1.6, -7.4)
    scene.add(screen)
    objects.push(screen)

    // Turntable circles
    const turntablePositions = [{ x: -0.9 }, { x: 0.9 }]
    turntablePositions.forEach(t => {
      const ttGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.06, 16)
      const tt = new THREE.Mesh(ttGeo, mat.clone())
      tt.position.set(t.x, 0.96, -7)
      scene.add(tt)
      objects.push(tt)

      // Record groove ring
      const grooveGeo = new THREE.TorusGeometry(0.2, 0.03, 6, 24)
      const groove = new THREE.Mesh(grooveGeo, mat.clone())
      groove.rotation.x = Math.PI / 2
      groove.position.set(t.x, 1.0, -7)
      scene.add(groove)
      objects.push(groove)
    })

    // Laser beam cylinders from ceiling (thin, long, angled)
    const laserAngles = [
      { x: -5, z: -3, rx: -0.3, rz: 0.4 },
      { x: 5, z: -3, rx: -0.3, rz: -0.4 },
      { x: -3, z: 2, rx: 0.2, rz: 0.5 },
      { x: 3, z: 2, rx: 0.2, rz: -0.5 },
      { x: 0, z: -5, rx: -0.5, rz: 0 },
      { x: -6, z: -6, rx: -0.4, rz: 0.3 },
    ]
    laserAngles.forEach(la => {
      const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 9, 4)
      const laserMat = new THREE.MeshLambertMaterial({
        color: 0xffffff, emissive: 0xff00ff, emissiveIntensity: 1.0,
        transparent: true, opacity: 0.55
      })
      const laser = new THREE.Mesh(laserGeo, laserMat)
      laser.position.set(la.x, 4.5, la.z)
      laser.rotation.x = la.rx
      laser.rotation.z = la.rz
      scene.add(laser)
      objects.push(laser)
      laserBeams.push(laser)
    })

    // Speakers on stands (left and right of DJ booth)
    const speakerData = [{ x: -2.5, z: -6.8 }, { x: 2.5, z: -6.8 }]
    speakerData.forEach(s => {
      const standGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 8)
      const stand = new THREE.Mesh(standGeo, mat.clone())
      stand.position.set(s.x, 0.75, s.z)
      scene.add(stand)
      objects.push(stand)

      const speakerGeo = new THREE.BoxGeometry(0.45, 0.7, 0.35)
      const speaker = new THREE.Mesh(speakerGeo, mat.clone())
      speaker.position.set(s.x, 1.85, s.z)
      scene.add(speaker)
      objects.push(speaker)
    })

    // Crowd silhouettes — 3 rows
    const crowdRows = [
      { z: 7, count: 10, spread: 18 },
      { z: 5.5, count: 8, spread: 14 },
      { z: 4.0, count: 6, spread: 10 },
    ]
    crowdRows.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        const x = (i / (row.count - 1) - 0.5) * row.spread
        addPersonSilhouette(scene, x, row.z, 0.7 + Math.random() * 0.3)
      }
    })

    // Smoke particles
    for (let i = 0; i < 200; i++) {
      smokePos[i * 3 + 0] = (Math.random() - 0.5) * 9
      smokePos[i * 3 + 1] = Math.random() * 4
      smokePos[i * 3 + 2] = (Math.random() - 0.5) * 8
      smokeVel[i * 3 + 0] = (Math.random() - 0.5) * 0.3
      smokeVel[i * 3 + 1] = 0.2 + Math.random() * 0.4
      smokeVel[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }
    smokeGeo = new THREE.BufferGeometry()
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3))
    const smokeMat = new THREE.PointsMaterial({ color: 0x444460, size: 0.22, transparent: true, opacity: 0.35 })
    const smoke = new THREE.Points(smokeGeo, smokeMat)
    scene.add(smoke)
    objects.push(smoke)

    cam.position.set(0, 3, 12)
    cam.lookAt(0, 1, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera || !smokeGeo || !mirrorBall) return

    // Camera slowly orbits and looks toward dance floor
    camera.position.x = Math.sin(time * 0.07) * 2.5
    camera.position.y = 3 + Math.sin(time * 0.05) * 0.4
    camera.lookAt(0, 1, 0)

    // Color lights cycle hues with time
    colorLights.forEach((light, i) => {
      const hue = ((time * 0.15 + i * 0.25) % 1)
      const color = new THREE.Color()
      color.setHSL(hue, 1.0, 0.5)
      light.color.set(color)
      light.intensity = 2.0 + Math.sin(time * 3.5 + i * 1.2) * 0.8
    })

    // Mirror ball slow rotation
    mirrorBall.rotation.y = time * 0.4

    // Laser beams pulse color
    laserBeams.forEach((laser, i) => {
      const hue = ((time * 0.2 + i * 0.18) % 1)
      const color = new THREE.Color()
      color.setHSL(hue, 1.0, 0.5)
      ;(laser.material as THREE.MeshLambertMaterial).emissive.set(color)
    })

    // Crowd bobs to beat
    crowdGroups.forEach(group => {
      const { phase, bobSpeed } = group.userData
      group.position.y = Math.abs(Math.sin(time * bobSpeed + phase)) * 0.12
      group.rotation.y = Math.sin(time * bobSpeed * 0.5 + phase) * 0.15
    })

    // Smoke rises, drifts, resets
    for (let i = 0; i < 200; i++) {
      smokePos[i * 3 + 0] += (smokeVel[i * 3 + 0] + Math.sin(time * 0.6 + i * 0.4) * 0.006) * delta
      smokePos[i * 3 + 1] += smokeVel[i * 3 + 1] * delta
      smokePos[i * 3 + 2] += smokeVel[i * 3 + 2] * delta
      if (smokePos[i * 3 + 1] > 8) {
        smokePos[i * 3 + 0] = (Math.random() - 0.5) * 9
        smokePos[i * 3 + 1] = 0
        smokePos[i * 3 + 2] = (Math.random() - 0.5) * 8
      }
    }
    ;(smokeGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    colorLights.length = 0
    crowdGroups.length = 0
    laserBeams.length = 0
    smokeGeo = null
    mirrorBall = null
    camera = null
  }

  return { init, animate, dispose }
}
