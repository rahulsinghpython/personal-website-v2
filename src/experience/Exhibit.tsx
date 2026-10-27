import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, type PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { beats } from '../content/beats'
import { guessTier, tierBudget, type Tier } from '../state/tiers'
import { applyCamera, frame, type Lens } from './camera/camera'
import { applyCity, layout, look, values, VOID } from './city/draw'
import { buildEggs, watchEggs } from './city/eggs'
import { mountPins, type Pins } from './city/pins'
import { cityLift, cityPointsMaterial, sampleCity } from './city/points'
import { cityFlow, CITY_POSES, seekCity } from './city/story'

// The exhibit (docs/DECISIONS.md, D48): the city on its own, whole and lit as the story leaves
// it at Whole, for the visitor to look round. The second lazy entry, beside ./Experience.tsx; it
// draws the same city with the same code, and only the camera is new. Nothing here moves by
// itself but the traffic, the river and the train (D26, D43): the camera moves when the visitor
// drags, and comes to rest a moment after they stop. The easter eggs are here too, for the finding
// (D53).

const WHOLE = beats.indexOf('whole')
/** Centred: there is no band of text at the side to keep clear of. */
const LENS: Lens = { fov: 40, right: 0, up: 0 }
/**
 * The view the exhibit opens on: Whole's, from a little higher and farther back, so the whole map
 * is in the window with nothing beside it, the Science Centre in front included.
 */
const OPENING = { ...CITY_POSES.whole, z: 0.3, elevation: 40, distance: 7.6 }
/** How close and how far the visitor can come, in the city's units. */
const NEAREST = 1
const FARTHEST = 9
/** How high the camera can go, from straight down, and how low: never under the ground. */
const HIGHEST = 8
const LOWEST = 84
/** How far the place looked at can be moved from the middle of the bay: the edge of the map. */
const REACH = 0.85
const AMBIENT_FPS = 30

function City({
  tier,
  points,
  still,
  pinLayer,
}: {
  tier: Tier
  points: number
  still: boolean
  pinLayer: HTMLElement | null
}) {
  const invalidate = useThree((state) => state.invalidate)
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const canvas = useThree((state) => state.gl.domElement)
  const size = useThree((state) => state.size)
  const dpr = useThree((state) => state.viewport.dpr)
  const count = Math.min(look.count, points)
  const scale = cityLift(look, count)

  const geometry = useMemo(() => sampleCity(layout, values, look, count), [count])
  const material = useMemo(() => cityPointsMaterial(layout), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  // The look round. Turning about the place looked at, coming closer to where the pointer is, and
  // a right drag or two fingers to move along the ground, all kept over the map.
  const controls = useMemo(() => {
    const made = new OrbitControls(camera, canvas)
    made.enableDamping = !still
    made.dampingFactor = 0.08
    made.rotateSpeed = 0.6
    made.zoomToCursor = true
    made.screenSpacePanning = false
    made.minDistance = NEAREST
    made.maxDistance = FARTHEST
    made.minPolarAngle = MathUtils.degToRad(HIGHEST)
    made.maxPolarAngle = MathUtils.degToRad(LOWEST)
    return made
  }, [camera, canvas, still])
  useEffect(() => {
    const reach = layout.extent * REACH
    const moved = () => {
      const target = controls.target
      target.x = MathUtils.clamp(target.x, -reach, reach)
      target.z = MathUtils.clamp(target.z, -reach, reach)
      target.y = MathUtils.clamp(target.y, 0, 1.5)
      invalidate()
    }
    // Connected here as well as when made, so a second mount in development still has its input.
    controls.connect(canvas)
    controls.addEventListener('change', moved)
    return () => {
      controls.removeEventListener('change', moved)
      controls.disconnect()
    }
  }, [controls, canvas, invalidate])

  // Opens on the view, once, before the first frame. After that the camera is the visitor's.
  useState(() => {
    applyCamera(camera, OPENING, size.width, size.height, LENS)
    controls.target.set(OPENING.x, OPENING.y, OPENING.z)
    controls.update()
  })

  // The city as the story leaves it at Whole: risen, and everything Rahul's work touched lit.
  useState(() => seekCity(WHOLE))

  // One tag a job at its subject, as at Whole (D45).
  const pins = useRef<Pins | null>(null)
  useEffect(() => {
    if (!pinLayer) return
    const mounted = mountPins(pinLayer, layout, values)
    pins.current = mounted
    invalidate()
    return () => {
      pins.current = null
      mounted.dispose()
    }
  }, [pinLayer, invalidate])

  // The easter eggs, as on the home page; a drag that turns the city plays none.
  const eggs = useMemo(() => buildEggs(layout, values, material), [material])
  useEffect(() => () => eggs.dispose(), [eggs])
  const get = useThree((state) => state.get)
  useEffect(() => watchEggs(eggs, get, () => true, invalidate), [eggs, get, invalidate])

  // The traffic, the river and the train, as on the home page (D43), and on the same terms.
  const ambient = tier !== 'low' && !still
  const clock = useRef(0)
  const waiting = useRef(false)
  const tick = useCallback(() => {
    waiting.current = false
    invalidate()
  }, [invalidate])
  useEffect(() => {
    // A hidden tab stops asking for frames; coming back starts it again.
    const shown = () => !document.hidden && invalidate()
    document.addEventListener('visibilitychange', shown)
    return () => document.removeEventListener('visibilitychange', shown)
  }, [invalidate])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    // True while the camera is still gliding to rest after a drag.
    const gliding = controls.update(dt)
    frame(camera, size.width, size.height, LENS)
    if (ambient) clock.current += dt
    const flow = cityFlow(WHOLE, clock.current)
    applyCity(material, flow, camera.position.distanceTo(controls.target))
    pins.current?.place(camera, size.width, size.height, WHOLE, true)

    const egging = eggs.step(dt, {
      height: size.height * dpr,
      beat: WHOLE,
      rise: 1,
      train: flow[2],
      clock: clock.current,
      still,
    })

    if (gliding || egging) invalidate()
    else if (ambient && !document.hidden && !waiting.current) {
      waiting.current = true
      setTimeout(tick, 1000 / AMBIENT_FPS)
    }
  })

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <primitive
          object={material}
          attach="material"
          uniforms-uSize-value={look.size * scale}
          uniforms-uBrightness-value={look.brightness * scale}
          uniforms-uHeight-value={size.height * dpr}
        />
      </points>
      <primitive object={eggs.object} />
    </>
  )
}

/** `pins` is the layer over the page the jobs' tags are drawn in (src/sections/Exhibit.tsx). */
export default function Exhibit({ pins }: { pins: HTMLElement | null }) {
  const [tier] = useState(guessTier)
  const [budget] = useState(() => tierBudget(tier))
  const [still] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)

  return (
    <Canvas
      flat
      frameloop="demand"
      dpr={Math.min(window.devicePixelRatio, budget.pixelRatioCap)}
      gl={{ antialias: false }}
      resize={{ scroll: false }}
      camera={{ near: 0.05, far: 100 }}
    >
      <color attach="background" args={[VOID]} />
      <City tier={tier} points={budget.points} still={still} pinLayer={pins} />
    </Canvas>
  )
}
