import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createBarbershopScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let poleAngle = 0
  const poleMeshes: THREE.Mesh[] = []
  const poleStripes: { mesh: THREE.Mesh; baseY: number; poleX: number; poleZ: number }[] = []
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
    // Spiral stripes (torus rings, animated)
    for (let i = 0; i < 8; i++) {
      const stripeGeo = new THREE.TorusGeometry(0.05, 0.018, 6, 12)
      const stripe = new THREE.Mesh(stripeGeo, mat.clone())
      const baseY = 0.2 + i * 0.26
      stripe.position.set(x, baseY, z)
      scene.add(stripe)
      objects.push(stripe)
      poleStripes.push({ mesh: stripe, baseY, poleX: x, poleZ: z })
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

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(10, 4.5)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-6.5, 2.25, -0.5)
    scene.add(leftWall); objects.push(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(6.5, 2.25, -0.5)
    scene.add(rightWall); objects.push(rightWall)

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(14, 10)
    const ceil = new THREE.Mesh(ceilGeo, new THREE.MeshLambertMaterial({ color: 0x080808 }))
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, 4.0, -0.5)
    scene.add(ceil); objects.push(ceil)

    // Wainscoting (lower wall panel strip)
    const wainGeo = new THREE.BoxGeometry(14, 0.06, 0.04)
    const wain = new THREE.Mesh(wainGeo, mat.clone())
    wain.position.set(0, 0.9, -4.46)
    scene.add(wain); objects.push(wain)

    // 3 barber chairs
    addBarberChair(scene, -2.5, 0)
    addBarberChair(scene, 0, 0)
    addBarberChair(scene, 2.5, 0)

    // Customers in chairs (seated silhouettes)
    const customerPositions = [-2.5, 0, 2.5]
    customerPositions.forEach(cx => {
      // Torso
      const torsoGeo = new THREE.BoxGeometry(0.42, 0.55, 0.3)
      const torso = new THREE.Mesh(torsoGeo, mat.clone())
      torso.position.set(cx, 1.05, 0.05)
      scene.add(torso); objects.push(torso)
      // Head
      const headGeo = new THREE.SphereGeometry(0.16, 8, 8)
      const head = new THREE.Mesh(headGeo, mat.clone())
      head.position.set(cx, 1.48, 0.05)
      scene.add(head); objects.push(head)
      // Cape draping over chair
      const capeGeo = new THREE.BoxGeometry(0.56, 0.7, 0.38)
      const cape = new THREE.Mesh(capeGeo, new THREE.MeshLambertMaterial({ color: 0x111111 }))
      cape.position.set(cx, 0.92, 0.05)
      scene.add(cape); objects.push(cape)
    })

    // Barbers standing behind chairs
    customerPositions.forEach(cx => {
      const bTorsoGeo = new THREE.BoxGeometry(0.38, 0.65, 0.25)
      const bTorso = new THREE.Mesh(bTorsoGeo, mat.clone())
      bTorso.position.set(cx, 1.2, 0.55)
      scene.add(bTorso); objects.push(bTorso)
      const bHeadGeo = new THREE.SphereGeometry(0.14, 8, 8)
      const bHead = new THREE.Mesh(bHeadGeo, mat.clone())
      bHead.position.set(cx, 1.65, 0.55)
      scene.add(bHead); objects.push(bHead)
      // Arms extended toward customer
      const armGeo = new THREE.BoxGeometry(0.08, 0.06, 0.5)
      for (let arm = -1; arm <= 1; arm += 2) {
        const a = new THREE.Mesh(armGeo, mat.clone())
        a.position.set(cx + arm * 0.22, 1.25, 0.28)
        scene.add(a); objects.push(a)
      }
    })

    // Waiting chairs along side wall (expanded)
    const waitPositions = [[-5.5, -2.5], [-5.5, -1.5], [-5.5, -0.5], [-5.5, 0.5]] as const
    waitPositions.forEach(([wx, wz]) => {
      const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5)
      const s = new THREE.Mesh(seatGeo, mat.clone())
      s.position.set(wx, 0.44, wz)
      scene.add(s); objects.push(s)
      const backrGeo = new THREE.BoxGeometry(0.5, 0.5, 0.06)
      const br = new THREE.Mesh(backrGeo, mat.clone())
      br.position.set(wx, 0.7, wz + 0.23)
      scene.add(br); objects.push(br)
    })

    // Magazine table beside waiting area
    const magTableGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 10)
    const magTable = new THREE.Mesh(magTableGeo, mat.clone())
    magTable.position.set(-5.5, 0.5, 1.3)
    scene.add(magTable); objects.push(magTable)

    const magTableLegGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6)
    const magTableLeg = new THREE.Mesh(magTableLegGeo, mat.clone())
    magTableLeg.position.set(-5.5, 0.25, 1.3)
    scene.add(magTableLeg); objects.push(magTableLeg)

    // Magazines fanned on table
    for (let mg = 0; mg < 4; mg++) {
      const mgGeo = new THREE.BoxGeometry(0.22, 0.015, 0.3)
      const mgMesh = new THREE.Mesh(mgGeo, mat.clone())
      mgMesh.position.set(-5.5, 0.535, 1.3)
      mgMesh.rotation.y = mg * 0.4
      scene.add(mgMesh); objects.push(mgMesh)
    }

    // Waiting customer on chair
    const wcTorsoGeo = new THREE.BoxGeometry(0.38, 0.5, 0.22)
    const wcTorso = new THREE.Mesh(wcTorsoGeo, mat.clone())
    wcTorso.position.set(-5.5, 0.75, -1.5)
    scene.add(wcTorso); objects.push(wcTorso)
    const wcHeadGeo = new THREE.SphereGeometry(0.13, 7, 7)
    const wcHead = new THREE.Mesh(wcHeadGeo, mat.clone())
    wcHead.position.set(-5.5, 1.12, -1.5)
    scene.add(wcHead); objects.push(wcHead)

    // Sink / wash station on right side wall
    const sinkBaseGeo = new THREE.BoxGeometry(1.0, 0.9, 0.5)
    const sinkBase = new THREE.Mesh(sinkBaseGeo, mat.clone())
    sinkBase.position.set(5.5, 0.45, -1.2)
    scene.add(sinkBase); objects.push(sinkBase)

    const sinkBasinGeo = new THREE.BoxGeometry(0.6, 0.08, 0.38)
    const sinkBasin = new THREE.Mesh(sinkBasinGeo, new THREE.MeshLambertMaterial({ color: 0x1a1a1a }))
    sinkBasin.position.set(5.5, 0.92, -1.2)
    scene.add(sinkBasin); objects.push(sinkBasin)

    const faucetGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6)
    const faucet = new THREE.Mesh(faucetGeo, mat.clone())
    faucet.position.set(5.5, 1.08, -1.05)
    scene.add(faucet); objects.push(faucet)

    const faucetArmGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.18, 6)
    const faucetArm = new THREE.Mesh(faucetArmGeo, mat.clone())
    faucetArm.rotation.x = Math.PI / 2
    faucetArm.position.set(5.5, 1.18, -1.12)
    scene.add(faucetArm); objects.push(faucetArm)

    // Shampoo bottles on sink counter
    for (let sb = 0; sb < 3; sb++) {
      const sbGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.18 + sb * 0.05, 7)
      const sbMesh = new THREE.Mesh(sbGeo, mat.clone())
      sbMesh.position.set(5.2 + sb * 0.16, 1.0, -0.98)
      scene.add(sbMesh); objects.push(sbMesh)
    }

    // Wall-mounted TV above waiting area
    const tvGeo = new THREE.BoxGeometry(1.4, 0.82, 0.07)
    const tvMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x050810, emissiveIntensity: 0.7 })
    const tv = new THREE.Mesh(tvGeo, tvMat)
    tv.rotation.y = Math.PI / 2
    tv.position.set(-6.42, 2.5, -1.0)
    scene.add(tv); objects.push(tv)

    const tvFrameGeo = new THREE.BoxGeometry(1.5, 0.9, 0.06)
    const tvFrame = new THREE.Mesh(tvFrameGeo, mat.clone())
    tvFrame.rotation.y = Math.PI / 2
    tvFrame.position.set(-6.44, 2.5, -1.0)
    scene.add(tvFrame); objects.push(tvFrame)

    const tvLight = new THREE.PointLight(0x1133aa, 0.4, 3)
    tvLight.position.set(-5.8, 2.5, -1.0)
    scene.add(tvLight); objects.push(tvLight)

    // Hairstyle posters on back wall
    const posterData = [{ x: -4.5, w: 0.7, h: 1.1 }, { x: 3.8, w: 0.7, h: 1.1 }]
    posterData.forEach(p => {
      const fGeo = new THREE.BoxGeometry(p.w + 0.06, p.h + 0.06, 0.04)
      const pFrame = new THREE.Mesh(fGeo, mat.clone())
      pFrame.position.set(p.x, 1.9, -4.44)
      scene.add(pFrame); objects.push(pFrame)

      const pGeo = new THREE.PlaneGeometry(p.w, p.h)
      const pMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.12 })
      const poster = new THREE.Mesh(pGeo, pMat)
      poster.position.set(p.x, 1.9, -4.41)
      scene.add(poster); objects.push(poster)
    })

    // Clock on back wall
    const clockGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16)
    const clockMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.15 })
    const clock = new THREE.Mesh(clockGeo, clockMat)
    clock.rotation.x = Math.PI / 2
    clock.position.set(0, 3.2, -4.43)
    scene.add(clock); objects.push(clock)

    const clockRimGeo = new THREE.TorusGeometry(0.22, 0.025, 6, 20)
    const clockRim = new THREE.Mesh(clockRimGeo, mat.clone())
    clockRim.position.set(0, 3.2, -4.41)
    scene.add(clockRim); objects.push(clockRim)

    // Reception desk near entrance
    const receptionGeo = new THREE.BoxGeometry(1.8, 1.0, 0.55)
    const reception = new THREE.Mesh(receptionGeo, mat.clone())
    reception.position.set(4.5, 0.5, 2.8)
    scene.add(reception); objects.push(reception)

    const receptionTopGeo = new THREE.BoxGeometry(1.9, 0.06, 0.65)
    const receptionTop = new THREE.Mesh(receptionTopGeo, mat.clone())
    receptionTop.position.set(4.5, 1.03, 2.8)
    scene.add(receptionTop); objects.push(receptionTop)

    // Computer monitor on reception
    const monGeo = new THREE.BoxGeometry(0.55, 0.38, 0.04)
    const monMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x0a1520, emissiveIntensity: 0.8 })
    const mon = new THREE.Mesh(monGeo, monMat)
    mon.position.set(4.5, 1.37, 2.58)
    mon.rotation.y = 0.2
    scene.add(mon); objects.push(mon)

    // Plant near reception
    const plantPotGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.22, 10)
    const plantPot = new THREE.Mesh(plantPotGeo, mat.clone())
    plantPot.position.set(5.8, 0.11, 2.5)
    scene.add(plantPot); objects.push(plantPot)

    for (let lf = 0; lf < 6; lf++) {
      const angle = (lf / 6) * Math.PI * 2
      const leafGeo = new THREE.BoxGeometry(0.06, 0.35, 0.04)
      const leaf = new THREE.Mesh(leafGeo, mat.clone())
      leaf.position.set(5.8 + Math.cos(angle) * 0.1, 0.55, 2.5 + Math.sin(angle) * 0.1)
      leaf.rotation.y = angle
      leaf.rotation.z = -0.5
      scene.add(leaf); objects.push(leaf)
    }

    // Towel rack on right wall
    const tRackGeo = new THREE.BoxGeometry(0.04, 0.04, 0.7)
    const tRack = new THREE.Mesh(tRackGeo, mat.clone())
    tRack.rotation.y = Math.PI / 2
    tRack.position.set(6.42, 1.5, -2.5)
    scene.add(tRack); objects.push(tRack)

    for (let tw = 0; tw < 3; tw++) {
      const towelGeo = new THREE.BoxGeometry(0.06, 0.28, 0.16)
      const towel = new THREE.Mesh(towelGeo, mat.clone())
      towel.position.set(6.4, 1.38, -2.6 + tw * 0.22)
      scene.add(towel); objects.push(towel)
    }

    // Coat hooks near entrance (right wall)
    for (let hook = 0; hook < 3; hook++) {
      const hookBaseGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04)
      const hookBase = new THREE.Mesh(hookBaseGeo, mat.clone())
      hookBase.position.set(6.42, 2.1, 1.5 + hook * 0.45)
      scene.add(hookBase); objects.push(hookBase)

      const hookArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 5)
      const hookArm = new THREE.Mesh(hookArmGeo, mat.clone())
      hookArm.rotation.x = Math.PI / 2
      hookArm.position.set(6.38, 2.08, 1.5 + hook * 0.45)
      scene.add(hookArm); objects.push(hookArm)

      // Jacket/coat hanging
      if (hook < 2) {
        const coatGeo = new THREE.BoxGeometry(0.04, 0.5, 0.35)
        const coat = new THREE.Mesh(coatGeo, mat.clone())
        coat.position.set(6.35, 1.83, 1.5 + hook * 0.45)
        scene.add(coat); objects.push(coat)
      }
    }

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

    // Barber pole spin — stripes scroll upward in a helix
    poleAngle += delta * 0.8
    poleMeshes.forEach(p => { p.rotation.y = poleAngle })
    poleStripes.forEach(({ mesh, baseY, poleX, poleZ }, i) => {
      const totalHeight = 8 * 0.26
      const scrollY = (baseY + poleAngle * 0.18) % totalHeight
      mesh.position.set(poleX, 0.2 + scrollY, poleZ)
      mesh.rotation.y = poleAngle + i * 0.8
    })

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
    poleStripes.length = 0
    overheadLights.length = 0
    camera = null
  }

  return { init, animate, dispose }
}
