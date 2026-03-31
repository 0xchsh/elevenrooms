import * as THREE from 'three'
import type { SceneModule } from '@/lib/three/types'

export function createRecordingStudioScene(): SceneModule {
  const objects: THREE.Object3D[] = []
  const vuBars: THREE.Mesh[] = []
  let camera: THREE.PerspectiveCamera | null = null

  function init(scene: THREE.Scene, cam: THREE.PerspectiveCamera) {
    camera = cam

    scene.fog = new THREE.FogExp2(0x070708, 0.055)

    const ambient = new THREE.AmbientLight(0x1a1a20, 0.4)
    scene.add(ambient)

    // Dim overhead spot on console
    const spotConsole = new THREE.PointLight(0xfff5e0, 1.8, 12)
    spotConsole.position.set(0, 4, 1.5)
    scene.add(spotConsole)
    objects.push(spotConsole)

    // Soft fill from screen glow
    const screenGlow = new THREE.PointLight(0x1a44aa, 0.8, 8)
    screenGlow.position.set(0, 2.2, 0.5)
    scene.add(screenGlow)
    objects.push(screenGlow)

    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    // Floor (large, dark wood-ish)
    const floorGeo = new THREE.PlaneGeometry(60, 50)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: 0x0d0c0a }))
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)
    objects.push(floor)

    // Back wall
    const backWallGeo = new THREE.PlaneGeometry(16, 8)
    const backWall = new THREE.Mesh(backWallGeo, new THREE.MeshLambertMaterial({ color: 0x0a0a0c }))
    backWall.position.set(0, 4, -6)
    scene.add(backWall)
    objects.push(backWall)

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(14, 8)
    const leftWall = new THREE.Mesh(sideWallGeo, new THREE.MeshLambertMaterial({ color: 0x090909 }))
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-7, 4, 0)
    scene.add(leftWall)
    objects.push(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeo.clone(), new THREE.MeshLambertMaterial({ color: 0x090909 }))
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(7, 4, 0)
    scene.add(rightWall)
    objects.push(rightWall)

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(16, 14)
    const ceiling = new THREE.Mesh(ceilingGeo, new THREE.MeshLambertMaterial({ color: 0x070708 }))
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.set(0, 8, 0)
    scene.add(ceiling)
    objects.push(ceiling)

    // Acoustic foam panels on back wall — grid of small box bumps
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const foamGeo = new THREE.BoxGeometry(0.38, 0.38, 0.12)
        const foamMat = new THREE.MeshLambertMaterial({ color: 0x111114 })
        const foam = new THREE.Mesh(foamGeo, foamMat)
        foam.position.set(
          (col - 4.5) * 0.45,
          2.2 + row * 0.45,
          -5.94
        )
        scene.add(foam)
        objects.push(foam)
      }
    }

    // Acoustic foam on left wall
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        const foamGeo = new THREE.BoxGeometry(0.12, 0.38, 0.38)
        const foamMat = new THREE.MeshLambertMaterial({ color: 0x0f0f12 })
        const foam = new THREE.Mesh(foamGeo, foamMat)
        foam.position.set(-6.94, 2.2 + row * 0.45, -1.4 + col * 0.5)
        scene.add(foam)
        objects.push(foam)
      }
    }

    // Sound baffles on right wall (angled panels)
    const baffleAngles = [-0.3, -0.15, 0.1, 0.25]
    baffleAngles.forEach((angle, i) => {
      const baffleGeo = new THREE.BoxGeometry(0.08, 1.8, 0.9)
      const baffleMat = new THREE.MeshLambertMaterial({ color: 0x161618 })
      const baffle = new THREE.Mesh(baffleGeo, baffleMat)
      baffle.position.set(6.6, 2.0 + i * 0.2, -2 + i * 1.1)
      baffle.rotation.z = angle
      baffle.rotation.y = angle * 0.5
      scene.add(baffle)
      objects.push(baffle)
    })

    // Main mixing console (large box desk)
    const consoleDeskGeo = new THREE.BoxGeometry(5.5, 0.12, 1.4)
    const consoleDesk = new THREE.Mesh(consoleDeskGeo, mat.clone())
    consoleDesk.position.set(0, 1.02, 0.5)
    scene.add(consoleDesk)
    objects.push(consoleDesk)

    // Console angled top surface
    const consoleTopGeo = new THREE.BoxGeometry(5.5, 0.08, 1.0)
    const consoleTop = new THREE.Mesh(consoleTopGeo, mat.clone())
    consoleTop.position.set(0, 1.15, 0.0)
    consoleTop.rotation.x = 0.25
    scene.add(consoleTop)
    objects.push(consoleTop)

    // Console body (front panel)
    const consoleFrontGeo = new THREE.BoxGeometry(5.5, 0.95, 0.12)
    const consoleFront = new THREE.Mesh(consoleFrontGeo, mat.clone())
    consoleFront.position.set(0, 0.56, 1.22)
    scene.add(consoleFront)
    objects.push(consoleFront)

    // Console legs
    const legPositions: [number, number][] = [[-2.5, 1.2], [2.5, 1.2], [0, 1.2]]
    legPositions.forEach(([lx, lz]) => {
      const legGeo = new THREE.BoxGeometry(0.08, 1.0, 0.08)
      const leg = new THREE.Mesh(legGeo, mat.clone())
      leg.position.set(lx, 0.5, lz)
      scene.add(leg)
      objects.push(leg)
    })

    // Faders on console (rows of small thin boxes)
    for (let col = 0; col < 22; col++) {
      const faderTrackGeo = new THREE.BoxGeometry(0.055, 0.28, 0.06)
      const faderTrack = new THREE.Mesh(faderTrackGeo, new THREE.MeshLambertMaterial({ color: 0x222228 }))
      faderTrack.position.set(-5.0 + col * 0.46, 1.18, 0.12)
      faderTrack.rotation.x = 0.25
      scene.add(faderTrack)
      objects.push(faderTrack)

      const faderKnobGeo = new THREE.BoxGeometry(0.07, 0.055, 0.06)
      const faderKnob = new THREE.Mesh(faderKnobGeo, mat.clone())
      faderKnob.position.set(-5.0 + col * 0.46, 1.2 + Math.random() * 0.18, 0.12)
      faderKnob.rotation.x = 0.25
      scene.add(faderKnob)
      objects.push(faderKnob)
    }

    // Buttons/knobs grid on angled console surface
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 16; col++) {
        const knobGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8)
        const knobMat = new THREE.MeshLambertMaterial({ color: 0x303035 })
        const knob = new THREE.Mesh(knobGeo, knobMat)
        knob.position.set(-3.4 + col * 0.46, 1.14 + row * 0.14, 0.05 - row * 0.12)
        knob.rotation.x = 0.25
        scene.add(knob)
        objects.push(knob)
      }
    }

    // VU meters — vertical bars that will animate
    const vuMeterCount = 16
    for (let i = 0; i < vuMeterCount; i++) {
      const vuBarGeo = new THREE.BoxGeometry(0.055, 0.22, 0.04)
      const vuBarMat = new THREE.MeshLambertMaterial({
        color: 0xffffff, emissive: 0x004400, emissiveIntensity: 0.8
      })
      const vuBar = new THREE.Mesh(vuBarGeo, vuBarMat)
      vuBar.position.set(-3.5 + i * 0.47, 1.35, -0.12)
      vuBar.rotation.x = 0.25
      vuBar.userData = { baseY: 1.35, phase: i * 0.4, col: i }
      scene.add(vuBar)
      objects.push(vuBar)
      vuBars.push(vuBar)
    }

    // Computer screen (emissive glow)
    const screenGeo = new THREE.PlaneGeometry(1.6, 1.0)
    const screenMat = new THREE.MeshLambertMaterial({
      color: 0xffffff, emissive: 0x0a1a44, emissiveIntensity: 1.0
    })
    const computerScreen = new THREE.Mesh(screenGeo, screenMat)
    computerScreen.position.set(0, 2.0, -0.5)
    computerScreen.rotation.x = -0.15
    scene.add(computerScreen)
    objects.push(computerScreen)

    // Screen bezel
    const bezelGeo = new THREE.BoxGeometry(1.72, 1.1, 0.06)
    const bezel = new THREE.Mesh(bezelGeo, mat.clone())
    bezel.position.set(0, 2.0, -0.53)
    bezel.rotation.x = -0.15
    scene.add(bezel)
    objects.push(bezel)

    // Monitor stand for screen
    const screenStandGeo = new THREE.BoxGeometry(0.12, 0.45, 0.12)
    const screenStand = new THREE.Mesh(screenStandGeo, mat.clone())
    screenStand.position.set(0, 1.29, -0.3)
    scene.add(screenStand)
    objects.push(screenStand)

    // Studio monitor speakers (left and right, on stands)
    const monitorData = [{ x: -3.5 }, { x: 3.5 }]
    monitorData.forEach(m => {
      const speakerGeo = new THREE.BoxGeometry(0.55, 0.75, 0.45)
      const speaker = new THREE.Mesh(speakerGeo, mat.clone())
      speaker.position.set(m.x, 1.8, -1.2)
      scene.add(speaker)
      objects.push(speaker)

      // Woofer cone circle
      const wooferGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 14)
      const woofer = new THREE.Mesh(wooferGeo, new THREE.MeshLambertMaterial({ color: 0x1a1a1a }))
      woofer.rotation.x = Math.PI / 2
      woofer.position.set(m.x, 1.75, -0.97)
      scene.add(woofer)
      objects.push(woofer)

      // Tweeter circle
      const tweeterGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 10)
      const tweeter = new THREE.Mesh(tweeterGeo, new THREE.MeshLambertMaterial({ color: 0x151518 }))
      tweeter.rotation.x = Math.PI / 2
      tweeter.position.set(m.x, 2.1, -0.97)
      scene.add(tweeter)
      objects.push(tweeter)

      // Speaker stand
      const speakerStandGeo = new THREE.CylinderGeometry(0.04, 0.07, 1.2, 8)
      const speakerStand = new THREE.Mesh(speakerStandGeo, mat.clone())
      speakerStand.position.set(m.x, 0.8, -1.2)
      scene.add(speakerStand)
      objects.push(speakerStand)

      // Stand base
      const standBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12)
      const standBase = new THREE.Mesh(standBaseGeo, mat.clone())
      standBase.position.set(m.x, 0.03, -1.2)
      scene.add(standBase)
      objects.push(standBase)
    })

    // Microphone on boom stand (center, slightly left)
    const micBaseGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.06, 10)
    const micBase = new THREE.Mesh(micBaseGeo, mat.clone())
    micBase.position.set(-1.5, 0.03, 2.8)
    scene.add(micBase)
    objects.push(micBase)

    const micPoleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8)
    const micPole = new THREE.Mesh(micPoleGeo, mat.clone())
    micPole.position.set(-1.5, 0.93, 2.8)
    scene.add(micPole)
    objects.push(micPole)

    // Boom arm (angled horizontal pole)
    const boomGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8)
    const boom = new THREE.Mesh(boomGeo, mat.clone())
    boom.position.set(-1.2, 1.78, 2.8)
    boom.rotation.z = Math.PI / 2 - 0.3
    scene.add(boom)
    objects.push(boom)

    // Mic head (sphere)
    const micHeadGeo = new THREE.SphereGeometry(0.1, 12, 10)
    const micHeadMat = new THREE.MeshLambertMaterial({ color: 0xdddddd })
    const micHead = new THREE.Mesh(micHeadGeo, micHeadMat)
    micHead.position.set(-0.75, 1.9, 2.8)
    scene.add(micHead)
    objects.push(micHead)

    // Mic windscreen (slightly larger sphere, transparent)
    const windscreenGeo = new THREE.SphereGeometry(0.14, 12, 10)
    const windscreenMat = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.7 })
    const windscreen = new THREE.Mesh(windscreenGeo, windscreenMat)
    windscreen.position.set(-0.75, 1.9, 2.8)
    scene.add(windscreen)
    objects.push(windscreen)

    // Headphone stand on console
    const hpStandGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8)
    const hpStand = new THREE.Mesh(hpStandGeo, mat.clone())
    hpStand.position.set(2.0, 1.23, 0.7)
    scene.add(hpStand)
    objects.push(hpStand)

    const hpArcGeo = new THREE.TorusGeometry(0.12, 0.025, 6, 16, Math.PI)
    const hpArc = new THREE.Mesh(hpArcGeo, mat.clone())
    hpArc.position.set(2.0, 1.58, 0.7)
    scene.add(hpArc)
    objects.push(hpArc)

    // Coffee mug on console corner
    const mugGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.14, 10)
    const mug = new THREE.Mesh(mugGeo, mat.clone())
    mug.position.set(-2.5, 1.1, 0.9)
    scene.add(mug)
    objects.push(mug)

    const mugHandleGeo = new THREE.TorusGeometry(0.04, 0.012, 6, 10, Math.PI)
    const mugHandle = new THREE.Mesh(mugHandleGeo, mat.clone())
    mugHandle.rotation.y = Math.PI / 2
    mugHandle.position.set(-2.44, 1.1, 0.9)
    scene.add(mugHandle)
    objects.push(mugHandle)

    // Keyboard on console far right
    const keyboardGeo = new THREE.BoxGeometry(0.8, 0.04, 0.3)
    const keyboard = new THREE.Mesh(keyboardGeo, mat.clone())
    keyboard.position.set(2.1, 1.08, 0.8)
    scene.add(keyboard)
    objects.push(keyboard)

    // Notebook/paper stack
    const notebookGeo = new THREE.BoxGeometry(0.3, 0.04, 0.22)
    const notebook = new THREE.Mesh(notebookGeo, mat.clone())
    notebook.position.set(-1.8, 1.08, 0.95)
    notebook.rotation.y = 0.2
    scene.add(notebook)
    objects.push(notebook)

    cam.position.set(0, 1.8, 7)
    cam.lookAt(0, 1.2, 0)
  }

  function animate(delta: number, time: number) {
    if (!camera) return

    // Camera gentle drift
    camera.position.x = Math.sin(time * 0.1) * 0.5
    camera.position.y = 1.8 + Math.sin(time * 0.07) * 0.08
    camera.lookAt(0, 1.2, 0)

    // VU meters animate up/down with staggered sin waves
    vuBars.forEach((bar, i) => {
      const { phase } = bar.userData
      const level = 0.5 + Math.abs(Math.sin(time * 2.8 + phase)) * 0.5
        + Math.abs(Math.sin(time * 1.3 + phase * 1.7)) * 0.3
      const clampedLevel = Math.min(level, 1.0)
      bar.scale.y = 0.3 + clampedLevel * 2.2
      // Shift color: green to yellow to red based on level
      const mat = bar.material as THREE.MeshLambertMaterial
      if (clampedLevel > 0.8) {
        mat.emissive.setHex(0x440000)
      } else if (clampedLevel > 0.55) {
        mat.emissive.setHex(0x333300)
      } else {
        mat.emissive.setHex(0x004400)
      }
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
    vuBars.length = 0
    camera = null
  }

  return { init, animate, dispose }
}
