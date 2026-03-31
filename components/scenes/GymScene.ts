import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createGymScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const fluorescentLights: THREE.PointLight[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function addTreadmill(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Base frame
    const baseGeo = new THREE.BoxGeometry(0.75, 0.22, 1.7)
    const base = new THREE.Mesh(baseGeo, mat.clone())
    base.position.set(x, 0.11, z)
    scene.add(base)
    objects.push(base)

    // Belt (slightly raised flat box)
    const beltGeo = new THREE.BoxGeometry(0.6, 0.04, 1.4)
    const belt = new THREE.Mesh(beltGeo, mat.clone())
    belt.position.set(x, 0.24, z)
    scene.add(belt)
    objects.push(belt)

    // Front roller
    const frontRollerGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.64, 12)
    const frontRoller = new THREE.Mesh(frontRollerGeo, mat.clone())
    frontRoller.rotation.z = Math.PI / 2
    frontRoller.position.set(x, 0.24, z - 0.68)
    scene.add(frontRoller)
    objects.push(frontRoller)

    // Back roller
    const backRoller = frontRoller.clone()
    backRoller.position.set(x, 0.24, z + 0.68)
    scene.add(backRoller)
    objects.push(backRoller)

    // Upright handles
    const uprightGeo = new THREE.BoxGeometry(0.05, 1.0, 0.06)
    const leftUpright = new THREE.Mesh(uprightGeo, mat.clone())
    leftUpright.position.set(x - 0.3, 0.75, z - 0.6)
    scene.add(leftUpright)
    objects.push(leftUpright)

    const rightUpright = leftUpright.clone()
    rightUpright.position.set(x + 0.3, 0.75, z - 0.6)
    scene.add(rightUpright)
    objects.push(rightUpright)

    // Handle bar connecting uprights
    const handleBarGeo = new THREE.BoxGeometry(0.65, 0.05, 0.06)
    const handleBar = new THREE.Mesh(handleBarGeo, mat.clone())
    handleBar.position.set(x, 1.22, z - 0.6)
    scene.add(handleBar)
    objects.push(handleBar)

    // Display screen on top
    const screenMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
    const screenGeo = new THREE.BoxGeometry(0.3, 0.22, 0.04)
    const screen = new THREE.Mesh(screenGeo, screenMat)
    screen.position.set(x, 1.38, z - 0.6)
    scene.add(screen)
    objects.push(screen)

    // Side rails
    for (let side = -1; side <= 1; side += 2) {
      const railGeo = new THREE.BoxGeometry(0.06, 0.05, 1.5)
      const rail = new THREE.Mesh(railGeo, mat.clone())
      rail.position.set(x + side * 0.34, 0.28, z)
      scene.add(rail)
      objects.push(rail)
    }
  }

  function addWeightRack(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Rack uprights
    for (let i = -1; i <= 1; i += 2) {
      const uprightGeo = new THREE.BoxGeometry(0.06, 1.4, 0.06)
      const upright = new THREE.Mesh(uprightGeo, mat.clone())
      upright.position.set(x + i * 1.2, 0.7, z)
      scene.add(upright)
      objects.push(upright)
    }

    // Horizontal bars (3 rows)
    for (let row = 0; row < 3; row++) {
      const barGeo = new THREE.BoxGeometry(2.5, 0.05, 0.06)
      const bar = new THREE.Mesh(barGeo, mat.clone())
      bar.position.set(x, 0.35 + row * 0.45, z)
      scene.add(bar)
      objects.push(bar)

      // Weight plates on each row (cylinder pairs)
      const weightPositions = [-0.9, -0.6, -0.3, 0.3, 0.6, 0.9]
      weightPositions.forEach((wx, wi) => {
        const r = 0.08 + (wi % 3) * 0.04
        const weightGeo = new THREE.CylinderGeometry(r, r, 0.06, 10)
        const weight = new THREE.Mesh(weightGeo, mat.clone())
        weight.rotation.z = Math.PI / 2
        weight.position.set(x + wx, 0.48 + row * 0.45, z)
        scene.add(weight)
        objects.push(weight)
      })
    }
  }

  function addDumbbell(scene: THREE.Scene, x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8)
    const handle = new THREE.Mesh(handleGeo, mat.clone())
    handle.rotation.z = Math.PI / 2
    handle.position.set(x, 0.06, z)
    scene.add(handle)
    objects.push(handle)

    // Two end weights
    for (let side = -1; side <= 1; side += 2) {
      const endGeo = new THREE.SphereGeometry(0.06, 8, 8)
      const end = new THREE.Mesh(endGeo, mat.clone())
      end.position.set(x + side * 0.18, 0.06, z)
      scene.add(end)
      objects.push(end)
    }
  }

  function addPoster(scene: THREE.Scene, x: number, y: number, z: number, rotY: number, w: number, h: number) {
    // Frame
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const frameGeo = new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.04)
    const frame = new THREE.Mesh(frameGeo, frameMat)
    frame.position.set(x, y, z)
    frame.rotation.y = rotY
    scene.add(frame)
    objects.push(frame)

    // Poster surface
    const posterMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2 })
    const posterGeo = new THREE.PlaneGeometry(w, h)
    const poster = new THREE.Mesh(posterGeo, posterMat)
    const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY)
    poster.position.set(x + fwd.x * 0.03, y, z + fwd.z * 0.03)
    poster.rotation.y = rotY
    scene.add(poster)
    objects.push(poster)
  }

  function addFluorescentFixture(scene: THREE.Scene, x: number, z: number) {
    // Housing box
    const housingGeo = new THREE.BoxGeometry(0.15, 0.08, 1.5)
    const housingMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 })
    const housing = new THREE.Mesh(housingGeo, housingMat)
    housing.position.set(x, 4.9, z)
    scene.add(housing)
    objects.push(housing)

    // Light
    const light = new THREE.PointLight(0xf0f8ff, 2.2, 12)
    light.position.set(x, 4.7, z)
    scene.add(light)
    objects.push(light)
    fluorescentLights.push(light)
  }

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.04)

    const ambient = new THREE.AmbientLight(0xffffff, 0.35)
    scene.add(ambient)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor — large rubberized gym floor
    const floorGeo = new THREE.PlaneGeometry(40, 30)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x0d0d0d }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Floor lane stripe lines
    for (let i = -3; i <= 3; i++) {
      const stripeGeo = new THREE.PlaneGeometry(0.06, 28)
      const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshLambertMaterial({ color: 0x1a1a1a }))
      stripe.rotation.x = -Math.PI / 2
      stripe.position.set(i * 3.2, 0.002, 0)
      scene.add(stripe)
      objects.push(stripe)
    }

    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(22, 6)
    const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0e }))
    backWall.position.set(0, 3, -8)
    scene.add(backWall)
    objects.push(backWall)

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(20, 6)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x0c0c0e }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-10, 3, 0)
    scene.add(leftWall)
    objects.push(leftWall)

    const rightWallMesh = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x0c0c0e }))
    rightWallMesh.rotation.y = -Math.PI / 2
    rightWallMesh.position.set(10, 3, 0)
    scene.add(rightWallMesh)
    objects.push(rightWallMesh)

    // Mirror wall (back, large emissive plane)
    const mirrorGeo = new THREE.PlaneGeometry(14, 3.8)
    const mirrorMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.07 })
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat)
    mirror.position.set(0, 2.2, -7.9)
    scene.add(mirror)
    objects.push(mirror)

    // Mirror frame
    const mFrameGeo = new THREE.BoxGeometry(14.2, 0.08, 0.05)
    for (let my = 0; my <= 1; my++) {
      const mFrame = new THREE.Mesh(mFrameGeo.clone(), mat.clone())
      mFrame.position.set(0, 0.3 + my * 3.8, -7.88)
      scene.add(mFrame)
      objects.push(mFrame)
    }

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(22, 20)
    const ceil = new THREE.Mesh(ceilGeo, new THREE.MeshLambertMaterial({ color: 0x080809 }))
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, 5, 0)
    scene.add(ceil)
    objects.push(ceil)

    // Row of treadmills
    for (let i = 0; i < 5; i++) {
      addTreadmill(scene, -8 + i * 4, -5)
    }

    // Weight rack
    addWeightRack(scene, 0, -7.2)

    // Bench press bench (box + bar)
    const benchGeo = new THREE.BoxGeometry(0.4, 0.12, 1.4)
    const bench = new THREE.Mesh(benchGeo, mat.clone())
    bench.position.set(-6, 0.46, 3)
    scene.add(bench)
    objects.push(bench)

    // Bench legs
    for (let bl = -1; bl <= 1; bl += 2) {
      const bLegGeo = new THREE.BoxGeometry(0.06, 0.4, 0.06)
      const bLeg = new THREE.Mesh(bLegGeo, mat.clone())
      bLeg.position.set(-6, 0.2, 3 + bl * 0.55)
      scene.add(bLeg)
      objects.push(bLeg)
    }

    // Barbell rack uprights
    for (let side = -1; side <= 1; side += 2) {
      const bbRackGeo = new THREE.BoxGeometry(0.05, 1.1, 0.05)
      const bbRack = new THREE.Mesh(bbRackGeo, mat.clone())
      bbRack.position.set(-6 + side * 0.25, 0.75, 3 - 0.65)
      scene.add(bbRack)
      objects.push(bbRack)

      // J-hook
      const hookGeo = new THREE.BoxGeometry(0.1, 0.06, 0.12)
      const hook = new THREE.Mesh(hookGeo, mat.clone())
      hook.position.set(-6 + side * 0.25, 1.1, 3 - 0.65)
      scene.add(hook)
      objects.push(hook)
    }

    // Barbell on rack
    const bbGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8)
    const bb = new THREE.Mesh(bbGeo, mat.clone())
    bb.rotation.z = Math.PI / 2
    bb.position.set(-6, 1.16, 3 - 0.65)
    scene.add(bb)
    objects.push(bb)

    // Plates on barbell ends
    for (let side = -1; side <= 1; side += 2) {
      const plateGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12)
      const plate = new THREE.Mesh(plateGeo, mat.clone())
      plate.rotation.z = Math.PI / 2
      plate.position.set(-6 + side * 0.6, 1.16, 3 - 0.65)
      scene.add(plate)
      objects.push(plate)
    }

    // Cable machine tower (right side)
    const towerGeo = new THREE.BoxGeometry(0.4, 2.5, 0.4)
    const tower = new THREE.Mesh(towerGeo, mat.clone())
    tower.position.set(7, 1.25, 1)
    scene.add(tower)
    objects.push(tower)

    const cablePulleyGeo = new THREE.TorusGeometry(0.12, 0.03, 6, 14)
    const pulley = new THREE.Mesh(cablePulleyGeo, mat.clone())
    pulley.position.set(7, 2.6, 1.22)
    scene.add(pulley)
    objects.push(pulley)

    const cableBarGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6)
    const cableBar = new THREE.Mesh(cableBarGeo, mat.clone())
    cableBar.rotation.z = Math.PI / 2
    cableBar.position.set(7, 1.1, 1.22)
    scene.add(cableBar)
    objects.push(cableBar)

    // Dumbbells on floor
    const dumbPositions: [number, number][] = [[-4, 2], [-3, 2.4], [-2, 2], [-1, 2.3], [2, 2], [3, 2.5], [4.5, 1.8]]
    dumbPositions.forEach(([dx, dz]) => addDumbbell(scene, dx, dz))

    // Dumbbell rack (small horizontal shelf)
    const dRackGeo = new THREE.BoxGeometry(5, 0.06, 0.4)
    const dRack = new THREE.Mesh(dRackGeo, mat.clone())
    dRack.position.set(0, 0.3, 1.4)
    scene.add(dRack)
    objects.push(dRack)

    // Motivational posters on back wall
    addPoster(scene, -5.5, 2.5, -7.85, 0, 1.1, 1.5)
    addPoster(scene, -2.5, 3.2, -7.85, 0, 0.8, 1.0)
    addPoster(scene, 6, 2.8, -7.85, 0, 1.0, 1.6)

    // Posters on right wall
    addPoster(scene, 9.85, 2.5, -3, -Math.PI / 2, 1.2, 1.4)
    addPoster(scene, 9.85, 2.5, 2, -Math.PI / 2, 0.9, 1.2)

    // Fluorescent light fixtures
    for (let fi = -3; fi <= 3; fi += 2) {
      addFluorescentFixture(scene, fi * 2.5, -6)
      addFluorescentFixture(scene, fi * 2.5, 0)
      addFluorescentFixture(scene, fi * 2.5, 5)
    }

    // Wall-mounted TV/screen on left wall
    const tvGeo = new THREE.BoxGeometry(0.06, 0.7, 1.2)
    const tvMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4 })
    const tv = new THREE.Mesh(tvGeo, tvMat)
    tv.position.set(-9.85, 3.2, -3)
    scene.add(tv)
    objects.push(tv)

    // Second TV on back wall (emissive)
    const tv2Geo = new THREE.BoxGeometry(1.8, 1.0, 0.06)
    const tv2 = new THREE.Mesh(tv2Geo, new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x0a1a2a, emissiveIntensity: 0.9 }))
    tv2.position.set(5, 3.8, -7.92)
    scene.add(tv2)
    objects.push(tv2)

    // Spin bike row (center area, z=3 to 6)
    for (let i = 0; i < 4; i++) {
      const bx = -4.5 + i * 3
      const bz = 4.5

      // Frame body
      const bikeBodyGeo = new THREE.BoxGeometry(0.1, 0.7, 0.85)
      const bikeMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const bikeBody = new THREE.Mesh(bikeBodyGeo, bikeMat.clone())
      bikeBody.position.set(bx, 0.55, bz)
      scene.add(bikeBody); objects.push(bikeBody)

      // Flywheel
      const flywheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 14)
      const flywheel = new THREE.Mesh(flywheelGeo, bikeMat.clone())
      flywheel.rotation.z = Math.PI / 2
      flywheel.position.set(bx, 0.55, bz - 0.38)
      scene.add(flywheel); objects.push(flywheel)

      // Seat post
      const seatPostGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6)
      const seatPost = new THREE.Mesh(seatPostGeo, bikeMat.clone())
      seatPost.position.set(bx, 0.88, bz + 0.3)
      scene.add(seatPost); objects.push(seatPost)

      // Seat
      const seatGeo = new THREE.BoxGeometry(0.18, 0.05, 0.28)
      const seat = new THREE.Mesh(seatGeo, bikeMat.clone())
      seat.position.set(bx, 1.14, bz + 0.3)
      scene.add(seat); objects.push(seat)

      // Handlebar post
      const hbPostGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6)
      const hbPost = new THREE.Mesh(hbPostGeo, bikeMat.clone())
      hbPost.position.set(bx, 0.92, bz - 0.22)
      scene.add(hbPost); objects.push(hbPost)

      // Handlebar
      const hbGeo = new THREE.BoxGeometry(0.5, 0.04, 0.12)
      const hb = new THREE.Mesh(hbGeo, bikeMat.clone())
      hb.position.set(bx, 1.22, bz - 0.22)
      scene.add(hb); objects.push(hb)

      // Screen on handlebar
      const bScreenGeo = new THREE.BoxGeometry(0.16, 0.12, 0.03)
      const bScreenMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 })
      const bScreen = new THREE.Mesh(bScreenGeo, bScreenMat)
      bScreen.position.set(bx, 1.36, bz - 0.22)
      scene.add(bScreen); objects.push(bScreen)
    }

    // Rowing machine row (z=6.5)
    for (let i = 0; i < 3; i++) {
      const rx = -3 + i * 3.2
      const rz = 6.8

      // Rail
      const railGeo = new THREE.BoxGeometry(0.08, 0.06, 2.0)
      const rMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const rail = new THREE.Mesh(railGeo, rMat.clone())
      rail.position.set(rx, 0.18, rz)
      scene.add(rail); objects.push(rail)

      // Flywheel / resistance unit
      const rFlywheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 12)
      const rFlywheel = new THREE.Mesh(rFlywheelGeo, rMat.clone())
      rFlywheel.rotation.z = Math.PI / 2
      rFlywheel.position.set(rx, 0.28, rz - 0.85)
      scene.add(rFlywheel); objects.push(rFlywheel)

      // Seat
      const rSeatGeo = new THREE.BoxGeometry(0.22, 0.06, 0.2)
      const rSeat = new THREE.Mesh(rSeatGeo, rMat.clone())
      rSeat.position.set(rx, 0.24, rz + 0.2)
      scene.add(rSeat); objects.push(rSeat)

      // Handle
      const rHandleGeo = new THREE.BoxGeometry(0.3, 0.04, 0.04)
      const rHandle = new THREE.Mesh(rHandleGeo, rMat.clone())
      rHandle.position.set(rx, 0.42, rz - 0.7)
      scene.add(rHandle); objects.push(rHandle)

      // Foot rests
      for (let fs = -1; fs <= 1; fs += 2) {
        const footGeo = new THREE.BoxGeometry(0.1, 0.06, 0.18)
        const foot = new THREE.Mesh(footGeo, rMat.clone())
        foot.position.set(rx + fs * 0.14, 0.22, rz - 0.15)
        scene.add(foot); objects.push(foot)
      }
    }

    // Pull-up rig / squat rack center (more dominant mid-scene piece)
    const rigBaseY = 0
    const rigX = 5
    const rigZ = 2

    // Upright posts (4 corner)
    for (let px = -1; px <= 1; px += 2) {
      for (let pz = -1; pz <= 1; pz += 2) {
        const rigPostGeo = new THREE.BoxGeometry(0.08, 3.2, 0.08)
        const rigPost = new THREE.Mesh(rigPostGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
        rigPost.position.set(rigX + px * 0.7, rigBaseY + 1.6, rigZ + pz * 0.5)
        scene.add(rigPost); objects.push(rigPost)
      }
    }
    // Top bars
    for (let pz = -1; pz <= 1; pz += 2) {
      const topBarGeo = new THREE.BoxGeometry(1.6, 0.07, 0.07)
      const topBar = new THREE.Mesh(topBarGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
      topBar.position.set(rigX, rigBaseY + 3.2, rigZ + pz * 0.5)
      scene.add(topBar); objects.push(topBar)
    }
    // Pull-up bar
    const pullBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8)
    const pullBar = new THREE.Mesh(pullBarGeo, new THREE.MeshLambertMaterial({ color: 0xdddddd }))
    pullBar.rotation.z = Math.PI / 2
    pullBar.position.set(rigX, rigBaseY + 3.0, rigZ)
    scene.add(pullBar); objects.push(pullBar)

    // Weight plates hanging on rig side
    for (let wp = 0; wp < 4; wp++) {
      const wpGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12)
      const wpMesh = new THREE.Mesh(wpGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
      wpMesh.position.set(rigX + 0.85, rigBaseY + 1.0 + wp * 0.26, rigZ - 0.5)
      scene.add(wpMesh); objects.push(wpMesh)
    }

    // Gym mats on floor (visible rectangles)
    const matPositions: [number, number, number][] = [
      [-2, 0, 1.5], [1, 0, 1.5], [4, 0, 1.5],
      [-2, 0.003, 3.0], [1, 0.003, 3.0]
    ]
    matPositions.forEach(([mx, my, mz]) => {
      const gymMatGeo = new THREE.BoxGeometry(1.6, 0.03, 0.8)
      const gymMat = new THREE.Mesh(gymMatGeo, new THREE.MeshLambertMaterial({ color: 0x111111 }))
      gymMat.position.set(mx, my, mz)
      scene.add(gymMat); objects.push(gymMat)
    })

    // Kettlebell rack (left front)
    const kbRackGeo = new THREE.BoxGeometry(2.2, 0.7, 0.5)
    const kbRack = new THREE.Mesh(kbRackGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
    kbRack.position.set(-7.5, 0.35, 2)
    scene.add(kbRack); objects.push(kbRack)

    for (let kb = 0; kb < 5; kb++) {
      const kbBodyGeo = new THREE.SphereGeometry(0.1 + kb * 0.012, 8, 8)
      const kbBody = new THREE.Mesh(kbBodyGeo, new THREE.MeshLambertMaterial({ color: 0xdddddd }))
      kbBody.position.set(-8.4 + kb * 0.44, 0.82, 2)
      scene.add(kbBody); objects.push(kbBody)

      const kbHandleGeo = new THREE.TorusGeometry(0.065, 0.018, 6, 12, Math.PI)
      const kbHandle = new THREE.Mesh(kbHandleGeo, new THREE.MeshLambertMaterial({ color: 0xdddddd }))
      kbHandle.position.set(-8.4 + kb * 0.44, 0.96, 2)
      scene.add(kbHandle); objects.push(kbHandle)
    }

    // Water dispenser / cooler near wall
    const dispenserBodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.1, 10)
    const dispenserBody = new THREE.Mesh(dispenserBodyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }))
    dispenserBody.position.set(8.5, 0.55, 6)
    scene.add(dispenserBody); objects.push(dispenserBody)

    const dispenserJugGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.38, 10)
    const dispenserJug = new THREE.Mesh(dispenserJugGeo, new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x001122, emissiveIntensity: 0.4, transparent: true, opacity: 0.75 }))
    dispenserJug.position.set(8.5, 1.29, 6)
    scene.add(dispenserJug); objects.push(dispenserJug)

    cam.position.set(0, 1.6, 9)
    cam.lookAt(0, 1.2, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera) return

    // Gentle camera drift
    camera.position.x = Math.sin(time * 0.11) * 1.5
    camera.position.y = 1.6 + Math.sin(time * 0.17) * 0.08
    camera.lookAt(Math.sin(time * 0.09) * 0.8, 1.2, 0)

    // Fluorescent lights subtle hum flicker
    fluorescentLights.forEach((light, i) => {
      light.intensity = 2.1 + Math.sin(time * 9.5 + i * 1.1) * 0.12
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
    fluorescentLights.length = 0
    camera = null
  }

  return { init, animate, dispose }
}
