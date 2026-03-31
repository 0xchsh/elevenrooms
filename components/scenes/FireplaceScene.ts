import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createFireplaceScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let fireGeo: THREE.BufferGeometry | null = null
  let emberGeo: THREE.BufferGeometry | null = null
  const firePos = new Float32Array(300 * 3)
  const fireVel = new Float32Array(300 * 3)
  const fireAge = new Float32Array(300)
  const emberPos = new Float32Array(80 * 3)
  const emberVel = new Float32Array(80 * 3)
  const emberAge = new Float32Array(80)
  let flickerLight: THREE.PointLight | null = null
  let camera: THREE.PerspectiveCamera | null = null

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.06)

    const ambient = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambient)

    flickerLight = new THREE.PointLight(0xfb923c, 3, 12)
    flickerLight.position.set(0, 1.2, -1.5)
    scene.add(flickerLight)
    objects.push(flickerLight)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor
    const floorGeo = new THREE.PlaneGeometry(12, 10)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x111111 }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(12, 6)
    const wall = new THREE.Mesh(wallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0c }))
    wall.position.set(0, 3, -4.5)
    scene.add(wall)
    objects.push(wall)

    // Fireplace surround (brick frame)
    const surroundParts = [
      { w: 3.4, h: 0.2, d: 0.3, x: 0, y: 0.1, z: -1.8 },   // hearth floor
      { w: 0.3, h: 2.2, d: 0.3, x: -1.55, y: 1.1, z: -1.8 }, // left pillar
      { w: 0.3, h: 2.2, d: 0.3, x: 1.55, y: 1.1, z: -1.8 },  // right pillar
      { w: 3.4, h: 0.3, d: 0.3, x: 0, y: 2.35, z: -1.8 },    // lintel (top beam)
      { w: 3.0, h: 0.15, d: 0.25, x: 0, y: 2.6, z: -1.78 },  // mantel shelf
    ]
    surroundParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Logs in fireplace
    const logMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const logPositions: [number, number, number, number][] = [
      [-0.35, 0.17, -2.1, 0.3], [0.3, 0.17, -2.0, -0.25], [0, 0.28, -2.05, 0.1]
    ]
    logPositions.forEach(([lx, ly, lz, rot]) => {
      const logGeo = new THREE.CylinderGeometry(0.07, 0.09, 1.1, 7)
      const log = new THREE.Mesh(logGeo, logMat.clone())
      log.rotation.z = Math.PI / 2
      log.rotation.y = rot
      log.position.set(lx, ly, lz)
      scene.add(log)
      objects.push(log)
    })

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(10, 6)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x0e0e0e }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-5.5, 3, -0.5)
    scene.add(leftWall); objects.push(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x0e0e0e }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(5.5, 3, -0.5)
    scene.add(rightWall); objects.push(rightWall)

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(12, 10)
    const ceil = new THREE.Mesh(ceilGeo, new THREE.MeshLambertMaterial({ color: 0x080808 }))
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, 6, -0.5)
    scene.add(ceil); objects.push(ceil)

    // Rug in front of fireplace
    const rugGeo = new THREE.BoxGeometry(3.6, 0.018, 2.4)
    const rugMesh = new THREE.Mesh(rugGeo, new THREE.MeshLambertMaterial({ color: 0x1a1010 }))
    rugMesh.position.set(0, 0.009, 0.8)
    scene.add(rugMesh); objects.push(rugMesh)

    // Rug border stripes
    for (let rb = 0; rb < 2; rb++) {
      const borderGeo = new THREE.BoxGeometry(3.2 - rb * 0.3, 0.02, 0.06)
      const border = new THREE.Mesh(borderGeo, new THREE.MeshLambertMaterial({ color: 0x2a1a10 }))
      border.position.set(0, 0.01, 0.22 + rb * 0.12)
      scene.add(border); objects.push(border)
    }

    // Coffee table
    const ctTopGeo = new THREE.BoxGeometry(1.4, 0.06, 0.7)
    const ctTop = new THREE.Mesh(ctTopGeo, mat.clone())
    ctTop.position.set(0, 0.46, 1.5)
    scene.add(ctTop); objects.push(ctTop)

    for (let cx = -1; cx <= 1; cx += 2) {
      for (let cz = -1; cz <= 1; cz += 2) {
        const legGeo = new THREE.BoxGeometry(0.05, 0.44, 0.05)
        const leg = new THREE.Mesh(legGeo, mat.clone())
        leg.position.set(cx * 0.62, 0.22, 1.5 + cz * 0.28)
        scene.add(leg); objects.push(leg)
      }
    }

    // Items on coffee table
    const bookGeo = new THREE.BoxGeometry(0.28, 0.04, 0.2)
    const book = new THREE.Mesh(bookGeo, mat.clone())
    book.position.set(-0.3, 0.51, 1.5)
    book.rotation.y = 0.3
    scene.add(book); objects.push(book)

    const mugCTGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.1, 8)
    const mugCT = new THREE.Mesh(mugCTGeo, mat.clone())
    mugCT.position.set(0.3, 0.51, 1.48)
    scene.add(mugCT); objects.push(mugCT)

    // Bookshelf on left wall
    const shelfBaseGeo = new THREE.BoxGeometry(0.22, 2.4, 1.6)
    const shelfBase = new THREE.Mesh(shelfBaseGeo, mat.clone())
    shelfBase.position.set(-5.3, 1.2, -1.5)
    scene.add(shelfBase); objects.push(shelfBase)

    for (let shelf = 0; shelf < 4; shelf++) {
      const shelfGeo = new THREE.BoxGeometry(0.22, 0.04, 1.5)
      const shelfMesh = new THREE.Mesh(shelfGeo, mat.clone())
      shelfMesh.position.set(-5.3, 0.3 + shelf * 0.6, -1.5)
      scene.add(shelfMesh); objects.push(shelfMesh)

      // Books on each shelf
      let bookX = -0.62
      while (bookX < 0.62) {
        const bw = 0.06 + Math.random() * 0.06
        const bh = 0.22 + Math.random() * 0.18
        const bGeo = new THREE.BoxGeometry(0.22, bh, bw)
        const bMesh = new THREE.Mesh(bGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
        bMesh.position.set(-5.3, 0.32 + shelf * 0.6 + bh / 2, -1.5 + bookX)
        scene.add(bMesh); objects.push(bMesh)
        bookX += bw + 0.01
      }
    }

    // Framed painting above mantel
    const frameGeo = new THREE.BoxGeometry(1.4, 1.0, 0.06)
    const frame = new THREE.Mesh(frameGeo, mat.clone())
    frame.position.set(0, 3.4, -1.78)
    scene.add(frame); objects.push(frame)

    const paintingGeo = new THREE.PlaneGeometry(1.2, 0.82)
    const paintingMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x110808, emissiveIntensity: 0.8 })
    const painting = new THREE.Mesh(paintingGeo, paintingMat)
    painting.position.set(0, 3.4, -1.74)
    scene.add(painting); objects.push(painting)

    // Floor lamp in right corner
    const lampBaseGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.06, 10)
    const lampBase = new THREE.Mesh(lampBaseGeo, mat.clone())
    lampBase.position.set(3.8, 0.03, 0.5)
    scene.add(lampBase); objects.push(lampBase)

    const lampPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.7, 6)
    const lampPole = new THREE.Mesh(lampPoleGeo, mat.clone())
    lampPole.position.set(3.8, 0.88, 0.5)
    scene.add(lampPole); objects.push(lampPole)

    const lampShadeGeo = new THREE.CylinderGeometry(0.06, 0.28, 0.32, 10)
    const lampShadeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffd080, emissiveIntensity: 0.5 })
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat)
    lampShade.position.set(3.8, 1.9, 0.5)
    scene.add(lampShade); objects.push(lampShade)

    const lampLight = new THREE.PointLight(0xffd080, 1.2, 6)
    lampLight.position.set(3.8, 1.75, 0.5)
    scene.add(lampLight); objects.push(lampLight)

    // Decorative picture frame on right wall
    const wallFrameGeo = new THREE.BoxGeometry(0.06, 1.1, 0.8)
    const wallFrame = new THREE.Mesh(wallFrameGeo, mat.clone())
    wallFrame.position.set(5.3, 2.5, -2.0)
    scene.add(wallFrame); objects.push(wallFrame)

    const wallArtGeo = new THREE.PlaneGeometry(0.64, 0.92)
    const wallArtMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x080810, emissiveIntensity: 0.5 })
    const wallArt = new THREE.Mesh(wallArtGeo, wallArtMat)
    wallArt.rotation.y = -Math.PI / 2
    wallArt.position.set(5.27, 2.5, -2.0)
    scene.add(wallArt); objects.push(wallArt)

    // Throw blanket draped over couch arm
    const blanketGeo = new THREE.BoxGeometry(0.35, 0.6, 0.55)
    const blanket = new THREE.Mesh(blanketGeo, mat.clone())
    blanket.position.set(-1.45, 0.62, 2.1)
    blanket.rotation.z = 0.15
    scene.add(blanket); objects.push(blanket)

    // Second candle on mantel (other side)
    const candle2Geo = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 8)
    const candle2 = new THREE.Mesh(candle2Geo, mat.clone())
    candle2.position.set(-0.6, 2.69, -1.66)
    scene.add(candle2); objects.push(candle2)

    const candleLight2 = new THREE.PointLight(0xfb923c, 0.4, 3)
    candleLight2.position.set(-0.6, 2.82, -1.66)
    scene.add(candleLight2); objects.push(candleLight2)

    // Fireplace tools (poker set) — right of fireplace
    const toolStandGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.06, 10)
    const toolStand = new THREE.Mesh(toolStandGeo, mat.clone())
    toolStand.position.set(1.85, 0.03, -1.75)
    scene.add(toolStand); objects.push(toolStand)

    const toolHandleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6)
    const toolHandle = new THREE.Mesh(toolHandleGeo, mat.clone())
    toolHandle.position.set(1.85, 0.43, -1.75)
    scene.add(toolHandle); objects.push(toolHandle)

    for (let ti = 0; ti < 3; ti++) {
      const toolGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5)
      const tool = new THREE.Mesh(toolGeo, mat.clone())
      tool.position.set(1.78 + ti * 0.07, 0.38, -1.72)
      tool.rotation.z = (ti - 1) * 0.15
      scene.add(tool); objects.push(tool)
    }

    // Wood pile left of fireplace
    const woodPilePositions: [number, number, number, number][] = [
      [-2.2, 0.08, -1.8, 0], [-2.0, 0.08, -1.75, 0.4],
      [-2.1, 0.08, -1.85, -0.3], [-2.15, 0.2, -1.8, 0.15],
      [-2.0, 0.2, -1.75, -0.2],
    ]
    woodPilePositions.forEach(([wx, wy, wz, wr]) => {
      const wGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.55, 6)
      const w = new THREE.Mesh(wGeo, mat.clone())
      w.rotation.z = Math.PI / 2
      w.rotation.y = wr
      w.position.set(wx, wy, wz)
      scene.add(w); objects.push(w)
    })

    // Armchair — left of couch, angled toward fireplace
    const acSeatGeo = new THREE.BoxGeometry(0.85, 0.3, 0.75)
    const acSeat = new THREE.Mesh(acSeatGeo, mat.clone())
    acSeat.position.set(-3.0, 0.35, 1.5)
    acSeat.rotation.y = 0.4
    scene.add(acSeat); objects.push(acSeat)

    const acBackGeo = new THREE.BoxGeometry(0.85, 0.65, 0.15)
    const acBack = new THREE.Mesh(acBackGeo, mat.clone())
    acBack.position.set(-3.0, 0.73, 1.78)
    acBack.rotation.y = 0.4
    scene.add(acBack); objects.push(acBack)

    for (let arm = -1; arm <= 1; arm += 2) {
      const acArmGeo = new THREE.BoxGeometry(0.15, 0.4, 0.75)
      const acArm = new THREE.Mesh(acArmGeo, mat.clone())
      acArm.position.set(-3.0 + arm * 0.35, 0.5, 1.5)
      acArm.rotation.y = 0.4
      scene.add(acArm); objects.push(acArm)
    }

    // Plant in corner
    const potGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.28, 10)
    const pot = new THREE.Mesh(potGeo, mat.clone())
    pot.position.set(4.5, 0.14, -2.5)
    scene.add(pot); objects.push(pot)

    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5)
    const stem = new THREE.Mesh(stemGeo, mat.clone())
    stem.position.set(4.5, 0.53, -2.5)
    scene.add(stem); objects.push(stem)

    for (let branch = 0; branch < 7; branch++) {
      const angle = (branch / 7) * Math.PI * 2
      const r = 0.06 + Math.random() * 0.18
      const leafGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 5, 4)
      const leaf = new THREE.Mesh(leafGeo, mat.clone())
      leaf.position.set(4.5 + Math.cos(angle) * r, 0.55 + Math.random() * 0.4, -2.5 + Math.sin(angle) * r)
      scene.add(leaf); objects.push(leaf)
    }

    // Window on right wall with curtains
    const windowFrameGeo = new THREE.BoxGeometry(0.06, 1.6, 1.2)
    const windowFrame = new THREE.Mesh(windowFrameGeo, mat.clone())
    windowFrame.position.set(5.42, 2.0, 0.5)
    scene.add(windowFrame); objects.push(windowFrame)

    const glassGeo = new THREE.PlaneGeometry(1.0, 1.4)
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x080c14, emissiveIntensity: 0.5, transparent: true, opacity: 0.5 })
    const glass = new THREE.Mesh(glassGeo, glassMat)
    glass.rotation.y = -Math.PI / 2
    glass.position.set(5.38, 2.0, 0.5)
    scene.add(glass); objects.push(glass)

    const moonGlow = new THREE.PointLight(0x8899cc, 0.6, 5)
    moonGlow.position.set(4.8, 2.0, 0.5)
    scene.add(moonGlow); objects.push(moonGlow)

    for (let cs = -1; cs <= 1; cs += 2) {
      const curtainGeo = new THREE.BoxGeometry(0.06, 1.8, 0.35)
      const curtain = new THREE.Mesh(curtainGeo, mat.clone())
      curtain.position.set(5.42, 2.0, 0.5 + cs * 0.72)
      scene.add(curtain); objects.push(curtain)
    }

    // Chandelier
    const crodGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6)
    const crod = new THREE.Mesh(crodGeo, mat.clone())
    crod.position.set(0, 4.65, -0.5)
    scene.add(crod); objects.push(crod)

    const cbaseGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.12, 12)
    const cbase = new THREE.Mesh(cbaseGeo, mat.clone())
    cbase.position.set(0, 4.24, -0.5)
    scene.add(cbase); objects.push(cbase)

    for (let ca = 0; ca < 6; ca++) {
      const angle = (ca / 6) * Math.PI * 2
      const armOutGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.38, 5)
      const armOut = new THREE.Mesh(armOutGeo, mat.clone())
      armOut.rotation.z = Math.PI / 2
      armOut.position.set(Math.cos(angle) * 0.19, 4.22, -0.5 + Math.sin(angle) * 0.19)
      scene.add(armOut); objects.push(armOut)

      const cCandleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6)
      const cCandle = new THREE.Mesh(cCandleGeo, mat.clone())
      cCandle.position.set(Math.cos(angle) * 0.34, 4.18, -0.5 + Math.sin(angle) * 0.34)
      scene.add(cCandle); objects.push(cCandle)
    }

    const chandelierLight = new THREE.PointLight(0xffd080, 0.8, 8)
    chandelierLight.position.set(0, 4.1, -0.5)
    scene.add(chandelierLight); objects.push(chandelierLight)

    // Wine glass on coffee table
    const wineGeo = new THREE.CylinderGeometry(0.045, 0.01, 0.18, 8)
    const wine = new THREE.Mesh(wineGeo, mat.clone())
    wine.position.set(0.2, 0.55, 1.55)
    scene.add(wine); objects.push(wine)

    const wineBowlGeo = new THREE.SphereGeometry(0.055, 8, 6)
    const wineBowl = new THREE.Mesh(wineBowlGeo, mat.clone())
    wineBowl.position.set(0.2, 0.66, 1.55)
    scene.add(wineBowl); objects.push(wineBowl)

    // Couch silhouette
    const couchParts = [
      { w: 3.2, h: 0.4, d: 1.0, x: 0, y: 0.2, z: 2.2 },    // seat
      { w: 3.2, h: 0.8, d: 0.25, x: 0, y: 0.7, z: 2.7 },   // backrest
      { w: 0.25, h: 0.8, d: 1.0, x: -1.6, y: 0.4, z: 2.2 }, // left arm
      { w: 0.25, h: 0.8, d: 1.0, x: 1.6, y: 0.4, z: 2.2 },  // right arm
    ]
    couchParts.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, mat.clone())
      mesh.position.set(p.x, p.y, p.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Small side table with candle
    const tableGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 14)
    const table = new THREE.Mesh(tableGeo, mat.clone())
    table.position.set(2.2, 0.55, 1.4)
    scene.add(table)
    objects.push(table)

    const tableLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6)
    const tableLeg = new THREE.Mesh(tableLegGeo, mat.clone())
    tableLeg.position.set(2.2, 0.275, 1.4)
    scene.add(tableLeg)
    objects.push(tableLeg)

    // Candle
    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8)
    const candle = new THREE.Mesh(candleGeo, mat.clone())
    candle.position.set(2.2, 0.69, 1.4)
    scene.add(candle)
    objects.push(candle)

    const candleLight = new THREE.PointLight(0xfb923c, 0.6, 4)
    candleLight.position.set(2.2, 0.85, 1.4)
    scene.add(candleLight)
    objects.push(candleLight)

    // Mantel items
    const mantelItems = [
      { x: -0.9, type: 'box', w: 0.12, h: 0.35, d: 0.08 },
      { x: -0.65, type: 'box', w: 0.08, h: 0.28, d: 0.06 },
      { x: -0.5, type: 'box', w: 0.14, h: 0.4, d: 0.08 },
      { x: 0.6, type: 'cyl', r: 0.08, h: 0.25 },
      { x: 0.9, type: 'box', w: 0.1, h: 0.32, d: 0.1 },
    ] as const
    mantelItems.forEach(item => {
      const geo = item.type === 'box'
        ? new THREE.BoxGeometry(item.w, item.h, item.d)
        : new THREE.CylinderGeometry((item as any).r, (item as any).r, (item as any).h, 8)
      const mesh = new THREE.Mesh(geo, mat.clone())
      const yOff = item.type === 'box' ? item.h / 2 : (item as any).h / 2
      mesh.position.set(item.x, 2.6 + yOff, -1.66)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Fire particles
    for (let i = 0; i < 300; i++) {
      firePos[i * 3 + 0] = (Math.random() - 0.5) * 0.8
      firePos[i * 3 + 1] = 0.3 + Math.random() * 1.2
      firePos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.3
      fireVel[i * 3 + 0] = (Math.random() - 0.5) * 0.3
      fireVel[i * 3 + 1] = 0.8 + Math.random() * 1.2
      fireVel[i * 3 + 2] = (Math.random() - 0.5) * 0.1
      fireAge[i] = Math.random()
    }
    fireGeo = new THREE.BufferGeometry()
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3))
    const fireMat = new THREE.PointsMaterial({ color: 0xfb923c, size: 0.12, transparent: true, opacity: 0.85 })
    scene.add(new THREE.Points(fireGeo, fireMat))
    objects.push(new THREE.Points(fireGeo, fireMat))

    // Embers
    for (let i = 0; i < 80; i++) {
      emberPos[i * 3 + 0] = (Math.random() - 0.5) * 1.0
      emberPos[i * 3 + 1] = 0.22
      emberPos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.4
      emberVel[i * 3 + 0] = (Math.random() - 0.5) * 0.8
      emberVel[i * 3 + 1] = 0.1 + Math.random() * 0.4
      emberVel[i * 3 + 2] = (Math.random() - 0.5) * 0.3
      emberAge[i] = Math.random()
    }
    emberGeo = new THREE.BufferGeometry()
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3))
    const emberMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.06, transparent: true, opacity: 0.9 })
    const emberPts = new THREE.Points(emberGeo, emberMat)
    scene.add(emberPts)
    objects.push(emberPts)

    cam.position.set(0, 1.4, 4.5)
    cam.lookAt(0, 1.2, -1)
  }

  function animate(delta: number, time: number) {
    if (!camera || !fireGeo || !emberGeo || !flickerLight) return

    // Camera gentle sway
    camera.position.x = Math.sin(time * 0.12) * 0.4
    camera.position.y = 1.4 + Math.sin(time * 0.08) * 0.1
    camera.lookAt(0, 1.2, -1)

    // Flickering firelight
    flickerLight.intensity = 2.5 + Math.sin(time * 8.3) * 0.6 + Math.sin(time * 13.7) * 0.4
    flickerLight.color.setHex(Math.random() > 0.95 ? 0xfde68a : 0xfb923c)

    // Fire particles
    for (let i = 0; i < 300; i++) {
      fireAge[i] += delta * 1.1
      firePos[i * 3 + 0] += (fireVel[i * 3 + 0] + Math.sin(time * 3 + i * 0.4) * 0.04) * delta
      firePos[i * 3 + 1] += fireVel[i * 3 + 1] * delta
      if (fireAge[i] > 1 || firePos[i * 3 + 1] > 2.2) {
        firePos[i * 3 + 0] = (Math.random() - 0.5) * 0.8
        firePos[i * 3 + 1] = 0.3
        firePos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.3
        fireAge[i] = 0
      }
    }
    ;(fireGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true

    // Embers drift and die
    for (let i = 0; i < 80; i++) {
      emberAge[i] += delta * 0.7
      emberPos[i * 3 + 0] += emberVel[i * 3 + 0] * delta * 0.4
      emberPos[i * 3 + 1] += emberVel[i * 3 + 1] * delta * 0.3
      if (emberAge[i] > 1) {
        emberPos[i * 3 + 0] = (Math.random() - 0.5) * 0.9
        emberPos[i * 3 + 1] = 0.22
        emberPos[i * 3 + 2] = -2.05 + (Math.random() - 0.5) * 0.4
        emberAge[i] = 0
      }
    }
    ;(emberGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
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
    fireGeo = null
    emberGeo = null
    flickerLight = null
    camera = null
  }

  return { init, animate, dispose }
}
