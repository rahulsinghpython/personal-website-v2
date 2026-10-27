import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Raycaster, Vector2 } from 'three'
import type { PerspectiveCamera, Points, ShaderMaterial, Vector3, Vector4 } from 'three'
import { beats } from '../content/beats'
import { measure, progress, readScroll } from '../state/progress'
import { guessTier, tierBudget, type Tier } from '../state/tiers'
import { applyCamera } from './camera/camera'
import { cityMap } from './city/city'
import { buildEggs, watchEggs } from './city/eggs'
import { applyCity, layout, look, values, VOID } from './city/draw'
import {
  CITY_GRAINS,
  cityLift,
  cityPointsMaterial,
  sampleCity,
  sampleCityGrains,
} from './city/points'
import { cityFlow, cityStory, MOVES_FROM, seekCity, seekCityStill, mapShown } from './city/story'
import { mountPins, type Pins } from './city/pins'
import { buildScan, scanShown } from './city/scan'
import { watchWhole, type Whole } from './city/whole'
import { holdText, type HeldText } from './hold'
import { rubOut, sampleInk, type Ink } from './ink'

// The scene: the city as points, drawn behind the page and driven by how far it is scrolled
// (docs/DECISIONS.md, D38 and D44). This is the lazy entry. Nothing outside src/experience/ may
// import three.js, and the page reaches this file through one dynamic import
// (src/sections/Scene.tsx).

/**
 * Seconds for the scene to close about two thirds of the gap to the scroll position. Slower since
 * the scroll snaps (D47): a snap moves the scroll a whole beat at once, and this is the pace the
 * city takes it at.
 */
const CHASE = 0.4
/** A gap this small cannot be seen, so the scene is taken to have arrived and stops drawing. */
const ARRIVED = 0.0004
/** Frames a second while only the traffic, the river and the train are moving (D26). */
const AMBIENT_FPS = 30
/** Seconds for the torch to close about two thirds of the gap to the pointer, and to light. */
const TORCH_CHASE = 0.07
const TORCH_LIGHT = 0.3
/** The share of the city's points the opening line may take as grains. */
const GRAIN_SHARE = 0.03
/** A grain's width while it stands on its letter, in CSS pixels. */
const GRAIN_SIZE = 1.5
/** The heading that crumbles: the Found beat's line (src/sections/Story.tsx). */
const OPENING_LINE = 'found-title'
/** The map's lines, as the workbench draws them under the points. */
const MAP = '#4d4b47'

const LAST = beats.length - 1

/**
 * Moves the torch toward the pointer and says whether it has come to rest. The light follows the
 * pointer a moment behind, and comes up and goes down, not on and off. It lights the haze only,
 * so it goes out as the haze rains down.
 */
function lightTorch(
  material: ShaderMaterial,
  pointer: { x: number; y: number; on: boolean },
  width: number,
  height: number,
  dt: number,
) {
  const light = material.uniforms.uTorch!.value as Vector3
  const lit = pointer.on && cityStory.pour < 1 ? 1 : 0
  const x = (pointer.x / width) * 2 - 1
  const y = 1 - (pointer.y / height) * 2
  // Unlit, it has no place to travel from: it comes up where the pointer is.
  const near = light.z < 0.01 ? 1 : 1 - Math.exp(-dt / TORCH_CHASE)
  light.x += (x - light.x) * near
  light.y += (y - light.y) * near
  light.z += (lit - light.z) * (1 - Math.exp(-dt / TORCH_LIGHT))
  const held =
    Math.abs(lit - light.z) < 0.01 &&
    (lit === 0 || Math.abs(x - light.x) + Math.abs(y - light.y) < 0.002)
  if (held) light.z = lit
  material.uniforms.uAspect!.value = width / height
  return held
}

/**
 * Puts the grains on the opening line, wherever the page has scrolled it to, and rubs the line
 * out as far as it has crumbled. The grains are drawn until the haze starts to rain down.
 */
function crumbleLine(
  grains: Points | null,
  material: ShaderMaterial,
  ink: Ink | null,
  width: number,
  height: number,
) {
  if (!grains || !ink) return
  rubOut(ink, cityStory.crumble)
  grains.visible = cityStory.pour < 0.5
  if (!grains.visible) return
  const corner = ink.line.getBoundingClientRect()
  ;(material.uniforms.uLine!.value as Vector4).set(
    (corner.left / width) * 2 - 1,
    1 - (corner.top / height) * 2,
    2 / width,
    -2 / height,
  )
  material.uniforms.uCrumble!.value = cityStory.crumble
  material.uniforms.uAspect!.value = width / height
}

/** `?words=0` in the address leaves the opening line alone (D37); `?snap=0`, the scroll (D47). */
const wanted = (key: string) => new URLSearchParams(location.search).get(key) !== '0'

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
  const dpr = useThree((state) => state.viewport.dpr)
  const bufferHeight = useThree((state) => state.size.height) * dpr
  const count = Math.min(look.count, points)
  const scale = cityLift(look, count)

  const geometry = useMemo(() => sampleCity(layout, values, look, count), [count])
  const material = useMemo(() => cityPointsMaterial(layout), [])
  const map = useMemo(() => cityMap(layout, values), [])
  const mapLines = useRef<{ material: { opacity: number }; visible: boolean }>(null)
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => map.dispose(), [map])

  // The opening line crumbles into the haze on the first scroll: its letters are read off the
  // page, and again whenever the page lays them out differently. Not with reduced motion, where
  // there is no haze for it to crumble into.
  const [worded] = useState(() => wanted('words') && !still)
  const [ink, setInk] = useState<Ink | null>(null)
  const grainCount = Math.min(CITY_GRAINS, Math.round(count * GRAIN_SHARE))
  useEffect(() => {
    const line = worded ? document.getElementById(OPENING_LINE) : null
    if (!line) return
    let mounted = true
    const read = () => mounted && setInk(sampleInk(line, grainCount))
    const resized = new ResizeObserver(read)
    resized.observe(line)
    // A font that arrives late moves the letters without changing the size of the line.
    void document.fonts.ready.then(read)
    return () => {
      mounted = false
      resized.disconnect()
    }
  }, [worded, grainCount])
  // The line is left as the page drew it when its ink is read again, and when the scene goes.
  useEffect(() => () => void (ink && rubOut(ink, 0)), [ink])
  const grains = useMemo(() => ink && sampleCityGrains(geometry, ink), [geometry, ink])
  const grainMaterial = useMemo(() => cityPointsMaterial(layout, true), [])
  const grainPoints = useRef<Points>(null)
  useEffect(() => () => grains?.dispose(), [grains])
  useEffect(() => () => grainMaterial.dispose(), [grainMaterial])

  // The Scanner sweep: the rebuilt surface, its panels and the beam, sharing the sweep with the
  // city's points so the raw points give way where the surface comes in.
  const scan = useMemo(() => {
    const built = buildScan(layout, values)
    Object.assign(material.uniforms, built.uniforms)
    return built
  }, [material])
  useEffect(() => () => scan.dispose(), [scan])
  // The easter eggs: the Merlion's spout and BLK 2024's number, drawn over the city, and the
  // train and the band up BLK 2024, which are the city's own points.
  const eggs = useMemo(() => buildEggs(layout, values, material), [material])
  useEffect(() => () => eggs.dispose(), [eggs])
  const raycaster = useMemo(() => new Raycaster(), [])
  const ndc = useMemo(() => new Vector2(), [])

  // Each claim pinned to its proof in the city (D45), placed on every frame drawn below.
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

  // The beats' text held still on the window and swapped as the story moves, in time with the
  // pins (D46). Only while the scene runs: without it the text scrolls with the page. `?snap=0`
  // lets the scroll stop between beats (D47).
  const heldText = useRef<HeldText | null>(null)
  useEffect(() => {
    const text = holdText(wanted('snap'))
    heldText.current = text
    invalidate()
    return () => {
      heldText.current = null
      text.dispose()
    }
  }, [invalidate])

  // The page moving is the only thing that asks for a frame, besides the traffic below.
  useEffect(() => {
    const follow = () => {
      progress.target = readScroll()
      invalidate()
    }
    const remeasure = () => {
      measure()
      follow()
    }
    // The sections change height when the window does, and when the text reflows.
    const resized = new ResizeObserver(remeasure)
    resized.observe(document.body)
    addEventListener('scroll', follow, { passive: true })
    addEventListener('resize', remeasure)
    return () => {
      resized.disconnect()
      removeEventListener('scroll', follow)
      removeEventListener('resize', remeasure)
    }
  }, [invalidate])

  // The pointer torch: a mouse moving over the page lights the haze near it. There is none for
  // touch, where nothing hovers, and none on the low tier (docs/PERFORMANCE.md). It asks for
  // frames only while there is haze to light.
  const torch = useRef({ x: 0, y: 0, on: false })
  useEffect(() => {
    if (tier === 'low') return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      torch.current = { x: event.clientX, y: event.clientY, on: true }
      if (cityStory.pour < 1) invalidate()
    }
    const leave = () => {
      torch.current.on = false
      if (cityStory.pour < 1) invalidate()
    }
    addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [tier, invalidate])

  // What aims the Scanner's beam: a mouse over the page, or a finger on it. A finger drags it
  // across the building; the page still scrolls under a finger that moves up or down.
  const aim = useRef({ x: 0, y: 0, on: false })
  useEffect(() => {
    const atScanner = () => scanShown(progress.eased * LAST) > 0
    const point = (x: number, y: number) => {
      aim.current = { x, y, on: true }
      if (atScanner()) invalidate()
    }
    const off = () => {
      aim.current.on = false
      if (atScanner()) invalidate()
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') point(event.clientX, event.clientY)
    }
    const touch = (event: TouchEvent) => {
      const finger = event.touches[0]
      if (finger) point(finger.clientX, finger.clientY)
    }
    const root = document.documentElement
    addEventListener('pointermove', move, { passive: true })
    root.addEventListener('pointerleave', off)
    addEventListener('touchstart', touch, { passive: true })
    addEventListener('touchmove', touch, { passive: true })
    addEventListener('touchend', off, { passive: true })
    addEventListener('touchcancel', off, { passive: true })
    return () => {
      removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', off)
      removeEventListener('touchstart', touch)
      removeEventListener('touchmove', touch)
      removeEventListener('touchend', off)
      removeEventListener('touchcancel', off)
    }
  }, [invalidate])

  // Finding an egg (./city/eggs.ts), once the city has risen.
  const get = useThree((state) => state.get)
  useEffect(
    () => watchEggs(eggs, get, () => cityStory.rise > 0.95 && cityStory.pour >= 1, invalidate),
    [eggs, get, invalidate],
  )

  // The Whole beat: choosing a job opens its panel and glides the camera to its subject (D56).
  const whole = useRef<Whole | null>(null)
  useEffect(() => {
    const watched = watchWhole(layout, values, get, () => progress.eased * LAST, invalidate)
    whole.current = watched
    return () => {
      whole.current = null
      watched.dispose()
    }
  }, [get, invalidate])

  // The traffic, the river and the train move on their own only on a device with frames to
  // spare, only if motion is welcome, and only once the city has risen (D43). Their clock only
  // adds up while it runs, so pausing never makes them jump.
  const ambient = tier !== 'low' && !still
  const clock = useRef(0)
  const waiting = useRef(false)
  const tick = useCallback(() => {
    waiting.current = false
    invalidate()
  }, [invalidate])

  useFrame(({ camera, size }, delta) => {
    // A frame drawn after a rest reports all the time that passed. Count it as one frame.
    const dt = Math.min(delta, 0.05)
    const gap = progress.target - progress.eased
    const arrived = still || Math.abs(gap) < ARRIVED
    progress.eased = arrived ? progress.target : progress.eased + gap * (1 - Math.exp(-dt / CHASE))

    const beat = progress.eased * LAST
    if (still) seekCityStill(beat)
    else seekCity(beat)
    const moving = ambient && beat >= MOVES_FROM
    if (moving) clock.current += dt
    const flow = cityFlow(beat, clock.current)
    applyCity(material, flow)
    applyCity(grainMaterial, flow)
    crumbleLine(grainPoints.current, grainMaterial, ink, size.width, size.height)
    const gliding = whole.current?.step(dt, cityStory.camera, still) ?? false
    applyCamera(
      camera as PerspectiveCamera,
      cityStory.camera,
      size.width,
      size.height,
      cityStory.lens,
    )
    pins.current?.place(
      camera as PerspectiveCamera,
      size.width,
      size.height,
      beat,
      still,
      whole.current?.focus,
    )
    heldText.current?.place(beat, still)
    if (mapLines.current) {
      const shown = still ? 0 : mapShown(beat)
      mapLines.current.visible = shown > 0.01
      mapLines.current.material.opacity = shown
    }

    const held = lightTorch(material, torch.current, size.width, size.height, dt)

    // The sweep, drawn only near the Scanner beat, and rebuilt again from points each time it
    // is reached.
    const shown = scanShown(beat)
    let beam: number | null = null
    if (aim.current.on && shown > 0) {
      ndc.set((aim.current.x / size.width) * 2 - 1, 1 - (aim.current.y / size.height) * 2)
      raycaster.setFromCamera(ndc, camera)
      beam = scan.aim(raycaster)
    }
    const scanning = scan.step(dt, beam, shown, { settled: arrived, motion: ambient })

    const egging = eggs.step(dt, {
      height: size.height * dpr,
      beat,
      rise: cityStory.rise,
      train: flow[2],
      clock: clock.current,
      still,
    })

    if (!arrived || !held || scanning || egging || gliding) invalidate()
    else if (moving && !document.hidden && !waiting.current) {
      waiting.current = true
      setTimeout(tick, 1000 / AMBIENT_FPS)
    }
  })

  return (
    <>
      <lineSegments ref={mapLines as never} geometry={map} position-y={0.004} visible={false}>
        <lineBasicMaterial color={MAP} transparent opacity={0} />
      </lineSegments>
      <points geometry={geometry} frustumCulled={false}>
        <primitive
          object={material}
          attach="material"
          uniforms-uSize-value={look.size * scale}
          uniforms-uBrightness-value={look.brightness * scale}
          uniforms-uHeight-value={bufferHeight}
        />
      </points>
      <primitive object={scan.object} />
      <primitive object={eggs.object} />
      {grains && (
        <points ref={grainPoints} geometry={grains} frustumCulled={false}>
          <primitive
            object={grainMaterial}
            attach="material"
            uniforms-uHeight-value={bufferHeight}
            uniforms-uGrain-value-x={GRAIN_SIZE * dpr}
          />
        </points>
      )}
    </>
  )
}

/** `pins` is the layer over the page the claims' pins are drawn in (src/sections/Scene.tsx). */
export default function Experience({ pins }: { pins: HTMLElement | null }) {
  const [tier] = useState(guessTier)
  const [budget] = useState(() => tierBudget(tier))
  const [still] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  // Before the first frame, so a page that loads part-way down opens on the right picture.
  useState(() => {
    measure()
    progress.target = progress.eased = readScroll()
  })

  return (
    <Canvas
      flat
      frameloop="demand"
      dpr={Math.min(window.devicePixelRatio, budget.pixelRatioCap)}
      gl={{ antialias: false }}
      // The canvas is fixed to the window, so scrolling cannot move it: do not re-measure it on
      // every scroll event.
      resize={{ scroll: false }}
      camera={{ near: 0.05, far: 100 }}
    >
      <color attach="background" args={[VOID]} />
      <City tier={tier} points={budget.points} still={still} pinLayer={pins} />
    </Canvas>
  )
}
