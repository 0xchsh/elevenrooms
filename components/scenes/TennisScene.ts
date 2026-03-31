import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createTennisScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  let orbitAngle = 0
  let camera: THREE.PerspectiveCamera | null = null

  function addLightPole(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 7, 8)
    const pole = new THREE.Mesh(poleGeo, mat.clone())
    pole.position.set(x, 3.5, z)
    scene.add(pole)
    objects.push(pole)

    // Arm
    const armGeo = new THREE.BoxGeometry(0.06, 0.06, 1.0)
    const arm = new THREE.Mesh(armGeo, mat.clone())
    arm.position.set(x, 7.1, z + 0.5)
    scene.add(arm)
    objects.push(arm)

    // Light housing
    const housingGeo = new THREE.BoxGeometry(0.25, 0.14, 0.4)
    const housingMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 })
    const housing = new THREE.Mesh(housingGeo, housingMat)
    housing.position.set(x, 6.96, z + 0.95)
    scene.add(housing)
    objects.push(housing)

    const light = new THREE.PointLight(0xfff5e0, 2.5, 18)
    light.position.set(x, 6.7, z + 0.95)
    scene.add(light)
    objects.push(light)
  }

  function addBleacherRow(scene: THREE.Scene, side: number, startZ: number, rows: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    for (let r = 0; r < rows; r++) {
      // Step riser
      const riserGeo = new THREE.BoxGeometry(0.4, 0.38 + r * 0.05, 12)
      const riser = new THREE.Mesh(riserGeo, mat.clone())
      riser.position.set(side * (9.5 + r * 0.42), (0.19 + r * 0.38) / 2 + r * 0.38 / 2, startZ)
      scene.add(riser)
      objects.push(riser)

      // Seat plank
      const plankGeo = new THREE.BoxGeometry(0.5, 0.07, 12)
      const plank = new THREE.Mesh(plankGeo, mat.clone())
      plank.position.set(side * (9.5 + r * 0.42 + 0.25), 0.41 + r * 0.38, startZ)
      scene.add(plank)
      objects.push(plank)
    }

    // Support posts under bleachers
    for (let r = 0; r < rows; r += 2) {
      for (let pz = startZ - 5; pz <= startZ + 5; pz += 4) {
        const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.38 + r * 0.38, 6)
        const post = new THREE.Mesh(postGeo, mat.clone())
        post.position.set(side * (9.5 + r * 0.42), (0.38 + r * 0.38) / 2, pz)
        scene.add(post)
        objects.push(post)
      }
    }
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x080c10, 0.025)

    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // ---- COURT FLOOR ----
    const courtGeo = new THREE.PlaneGeometry(48, 34)
    const court = new THREE.Mesh(courtGeo, new THREE.MeshLambertMaterial({ color: 0x0a1208 }))
    court.rotation.x = -Math.PI / 2
    scene.add(court)
    objects.push(court)

    // Court playing surface (smaller inset rectangle)
    const surfaceGeo = new THREE.PlaneGeometry(23.77, 10.97)
    const surface = new THREE.Mesh(surfaceGeo, new THREE.MeshLambertMaterial({ color: 0x0e1a0c }))
    surface.rotation.x = -Math.PI / 2
    surface.position.set(0, 0.003, 0)
    scene.add(surface)
    objects.push(surface)

    // ---- COURT LINES ----
    const lineMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const lineThickness = 0.05

    // Baseline (both ends)
    const baseLineData = [
      { w: 23.77, d: lineThickness, x: 0, z: -5.485 },
      { w: 23.77, d: lineThickness, x: 0, z: 5.485 },
    ]
    baseLineData.forEach(l => {
      const geo = new THREE.PlaneGeometry(l.w, l.d)
      const mesh = new THREE.Mesh(geo, lineMat.clone())
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(l.x, 0.005, l.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Sidelines
    const sideLineData = [
      { w: lineThickness, d: 10.97, x: -11.885, z: 0 },
      { w: lineThickness, d: 10.97, x: 11.885, z: 0 },
    ]
    sideLineData.forEach(l => {
      const geo = new THREE.PlaneGeometry(l.w, l.d)
      const mesh = new THREE.Mesh(geo, lineMat.clone())
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(l.x, 0.005, l.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Service boxes — inner sidelines
    const innerSideData = [
      { w: lineThickness, d: 10.97, x: -8.23, z: 0 },
      { w: lineThickness, d: 10.97, x: 8.23, z: 0 },
    ]
    innerSideData.forEach(l => {
      const geo = new THREE.PlaneGeometry(l.w, l.d)
      const mesh = new THREE.Mesh(geo, lineMat.clone())
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(l.x, 0.005, l.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Center service line
    const centerSvcGeo = new THREE.PlaneGeometry(lineThickness, 10.97)
    const centerSvc = new THREE.Mesh(centerSvcGeo, lineMat.clone())
    centerSvc.rotation.x = -Math.PI / 2
    centerSvc.position.set(0, 0.005, 0)
    scene.add(centerSvc)
    objects.push(centerSvc)

    // Center mark on baselines
    for (let side = -1; side <= 1; side += 2) {
      const cMarkGeo = new THREE.PlaneGeometry(lineThickness, 0.2)
      const cMark = new THREE.Mesh(cMarkGeo, lineMat.clone())
      cMark.rotation.x = -Math.PI / 2
      cMark.position.set(0, 0.005, side * 5.485)
      scene.add(cMark)
      objects.push(cMark)
    }

    // Service lines
    const svcLineData = [
      { w: 16.46, d: lineThickness, x: 0, z: -3.2 },
      { w: 16.46, d: lineThickness, x: 0, z: 3.2 },
    ]
    svcLineData.forEach(l => {
      const geo = new THREE.PlaneGeometry(l.w, l.d)
      const mesh = new THREE.Mesh(geo, lineMat.clone())
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(l.x, 0.005, l.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // ---- NET ----
    // Net posts
    for (let side = -1; side <= 1; side += 2) {
      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8)
      const post = new THREE.Mesh(postGeo, mat.clone())
      post.position.set(side * 5.03, 0.5, 0)
      scene.add(post)
      objects.push(post)
    }

    // Net strap (center support)
    const strapGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.91, 6)
    const strap = new THREE.Mesh(strapGeo, mat.clone())
    strap.position.set(0, 0.455, 0)
    scene.add(strap)
    objects.push(strap)

    // Net mesh body (thin boxes as horizontal bands)
    for (let band = 0; band < 5; band++) {
      const bandGeo = new THREE.BoxGeometry(10.06, 0.04, 0.02)
      const bandMesh = new THREE.Mesh(bandGeo, mat.clone())
      bandMesh.position.set(0, 0.1 + band * 0.16, 0)
      scene.add(bandMesh)
      objects.push(bandMesh)
    }

    // Net top cable
    const topCableGeo = new THREE.BoxGeometry(10.06, 0.05, 0.03)
    const topCable = new THREE.Mesh(topCableGeo, mat.clone())
    topCable.position.set(0, 0.91, 0)
    scene.add(topCable)
    objects.push(topCable)

    // ---- SKY DOME ----
    const skyGeo = new THREE.SphereGeometry(45, 18, 12)
    const skyMat = new THREE.MeshLambertMaterial({ color: 0x060c14, side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    sky.position.set(0, 0, 0)
    scene.add(sky)
    objects.push(sky)

    // ---- BLEACHERS ----
    addBleacherRow(scene, 1, 0, 4)   // right side
    addBleacherRow(scene, -1, 0, 4)  // left side

    // Small bleachers at each end
    for (let end = -1; end <= 1; end += 2) {
      for (let r = 0; r < 3; r++) {
        const endBleacherGeo = new THREE.BoxGeometry(7, 0.35 + r * 0.1, 0.45)
        const endBleacher = new THREE.Mesh(endBleacherGeo, mat.clone())
        endBleacher.position.set(0, 0.18 + r * 0.38, end * (7.5 + r * 0.45))
        scene.add(endBleacher)
        objects.push(endBleacher)
      }
    }

    // ---- LIGHT POLES ----
    addLightPole(scene, -11, -4.5)
    addLightPole(scene, -11, 4.5)
    addLightPole(scene, 11, -4.5)
    addLightPole(scene, 11, 4.5)

    // ---- UMPIRE CHAIR ----
    const chairPostGeo = new THREE.CylinderGeometry(0.07, 0.1, 1.6, 8)
    const chairPost = new THREE.Mesh(chairPostGeo, mat.clone())
    chairPost.position.set(6, 0.8, 0.05)
    scene.add(chairPost)
    objects.push(chairPost)

    const chairSeatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.45)
    const chairSeat = new THREE.Mesh(chairSeatGeo, mat.clone())
    chairSeat.position.set(6, 1.64, 0.05)
    scene.add(chairSeat)
    objects.push(chairSeat)

    const chairBackGeo = new THREE.BoxGeometry(0.5, 0.5, 0.06)
    const chairBack = new THREE.Mesh(chairBackGeo, mat.clone())
    chairBack.position.set(6, 1.93, -0.18)
    scene.add(chairBack)
    objects.push(chairBack)

    // Scoreboard on back wall (large box)
    const scoreBoardGeo = new THREE.BoxGeometry(4, 1.8, 0.2)
    const scoreBoardMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 })
    const scoreBoard = new THREE.Mesh(scoreBoardGeo, scoreBoardMat)
    scoreBoard.position.set(0, 5.5, -14)
    scene.add(scoreBoard)
    objects.push(scoreBoard)

    // Scoreboard dividers
    for (let div = 0; div < 5; div++) {
      const divGeo = new THREE.BoxGeometry(0.05, 1.7, 0.22)
      const divMesh = new THREE.Mesh(divGeo, mat.clone())
      divMesh.position.set(-1.8 + div * 0.9, 5.5, -14)
      scene.add(divMesh)
      objects.push(divMesh)
    }

    // ---- ADVERTISING BOARDS along sidelines ----
    const boardColors = [0x111111, 0x0a0a0a, 0x0d0d0d]
    for (let side = -1; side <= 1; side += 2) {
      for (let bi = 0; bi < 6; bi++) {
        const boardGeo = new THREE.BoxGeometry(0.12, 0.9, 3.2)
        const boardMat = new THREE.MeshLambertMaterial({
          color: boardColors[bi % 3], emissive: 0xffffff, emissiveIntensity: 0.06
        })
        const board = new THREE.Mesh(boardGeo, boardMat)
        board.position.set(side * 8.6, 0.45, -7.5 + bi * 3.0)
        scene.add(board); objects.push(board)
      }
    }

    // ---- PLAYER BENCHES at each end ----
    for (let end = -1; end <= 1; end += 2) {
      const benchGeo = new THREE.BoxGeometry(1.2, 0.06, 0.45)
      const bench = new THREE.Mesh(benchGeo, mat.clone())
      bench.position.set(end * 13.5, 0.44, 0)
      scene.add(bench); objects.push(bench)

      for (let bl = -1; bl <= 1; bl += 2) {
        const bLegGeo = new THREE.BoxGeometry(0.05, 0.42, 0.05)
        const bLeg = new THREE.Mesh(bLegGeo, mat.clone())
        bLeg.position.set(end * 13.5 + bl * 0.52, 0.21, 0)
        scene.add(bLeg); objects.push(bLeg)
      }

      // Player bag next to bench
      const bagGeo = new THREE.BoxGeometry(0.25, 0.22, 0.55)
      const bag = new THREE.Mesh(bagGeo, mat.clone())
      bag.position.set(end * 13.5, 0.11, 0.5)
      scene.add(bag); objects.push(bag)

      // Water bottle on bench
      const bottleGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.2, 8)
      const bottle = new THREE.Mesh(bottleGeo, mat.clone())
      bottle.position.set(end * 13.5, 0.51, -0.1)
      scene.add(bottle); objects.push(bottle)
    }

    // ---- BALL KIDS at net corners ----
    const ballKidPositions: [number, number][] = [[-5.5, -0.8], [5.5, -0.8], [-5.5, 0.8], [5.5, 0.8]]
    ballKidPositions.forEach(([bkx, bkz]) => {
      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6)
      const body = new THREE.Mesh(bodyGeo, mat.clone())
      body.position.set(bkx, 0.5, bkz)
      scene.add(body); objects.push(body)
      // Head
      const headGeo = new THREE.SphereGeometry(0.1, 6, 6)
      const head = new THREE.Mesh(headGeo, mat.clone())
      head.position.set(bkx, 0.9, bkz)
      scene.add(head); objects.push(head)
    })

    // ---- CROWD SILHOUETTES in bleachers ----
    for (let side = -1; side <= 1; side += 2) {
      for (let row = 0; row < 3; row++) {
        for (let seat = -5; seat <= 5; seat++) {
          if (Math.random() < 0.75) {
            const headGeo = new THREE.SphereGeometry(0.09 + Math.random() * 0.03, 5, 5)
            const head = new THREE.Mesh(headGeo, mat.clone())
            head.position.set(
              side * (9.8 + row * 0.42),
              0.72 + row * 0.38,
              seat * 1.05
            )
            scene.add(head); objects.push(head)

            const torsoGeo = new THREE.BoxGeometry(0.22, 0.28, 0.18)
            const torso = new THREE.Mesh(torsoGeo, mat.clone())
            torso.position.set(
              side * (9.8 + row * 0.42),
              0.48 + row * 0.38,
              seat * 1.05
            )
            scene.add(torso); objects.push(torso)
          }
        }
      }
    }

    // ---- TV CAMERA RIG at corner ----
    const rigGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12)
    const rig = new THREE.Mesh(rigGeo, mat.clone())
    rig.position.set(-12, 1.1, -6)
    scene.add(rig); objects.push(rig)

    const camBodyGeo = new THREE.BoxGeometry(0.35, 0.2, 0.55)
    const camBody = new THREE.Mesh(camBodyGeo, mat.clone())
    camBody.position.set(-12, 2.3, -5.8)
    scene.add(camBody); objects.push(camBody)

    const lensGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8)
    const lens = new THREE.Mesh(lensGeo, new THREE.MeshLambertMaterial({ color: 0x1a1a1a }))
    lens.rotation.x = Math.PI / 2
    lens.position.set(-12, 2.3, -5.45)
    scene.add(lens); objects.push(lens)

    // ---- STARS in sky ----
    const starCount = 400
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.45
      const r = 42
      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      starPos[i * 3 + 1] = r * Math.cos(phi) + 5
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars); objects.push(stars)

    // ---- FLAGPOLES at court ends ----
    for (let side = -1; side <= 1; side += 2) {
      const flagPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.5, 6)
      const flagPole = new THREE.Mesh(flagPoleGeo, mat.clone())
      flagPole.position.set(side * 12.5, 1.75, -8)
      scene.add(flagPole); objects.push(flagPole)

      const flagGeo = new THREE.BoxGeometry(0.8, 0.5, 0.03)
      const flagMesh = new THREE.Mesh(flagGeo, mat.clone())
      flagMesh.position.set(side * 12.5 + side * 0.4, 3.3, -8)
      scene.add(flagMesh); objects.push(flagMesh)
    }

    orbitAngle = 0
    cam.position.set(0, 3, 14)
    cam.lookAt(0, 0.5, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera) return

    // Camera slowly orbits the court
    orbitAngle += delta * 0.12
    const orbitR = 15
    camera.position.x = Math.sin(orbitAngle) * orbitR * 0.6
    camera.position.y = 3 + Math.sin(time * 0.08) * 0.3
    camera.position.z = Math.cos(orbitAngle) * orbitR
    camera.lookAt(0, 0.5, 0)
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
    camera = null
  }

  return { init, animate, dispose }
}
