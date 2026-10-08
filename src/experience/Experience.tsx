import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PerspectiveCamera, Points, ShaderMaterial, Vector3, Vector4 } from 'three'
import { measure, progress, readScroll } from '../state/progress'
import { guessTier, tierBudget, type Tier } from '../state/tiers'
import { applyCamera } from './camera/camera'
import { rubOut, sampleInk, type Ink } from './ink'
import { machine } from './machine/machine'
import { machineDefaults } from './machine/part'
import { linesMaterial, sampleLines } from './machine/lines'
import {
  dustLook,
  lift,
  POINT_LOOK,
  pointsMaterial,
  sampleGrains,
  samplePoints,
} from './machine/points'
import { applyStory, seek, seekStill, story } from './timeline'

// The scene: the Machine as points, drawn behind the page and driven by how far it is scrolled.
// This is the lazy entry. Nothing outside src/experience/ may import three.js, and the page
// reaches this file through one dynamic import (src/sections/Scene.tsx).

/** Seconds for the scene to close about two thirds of the gap to the scroll position. */
const CHASE = 0.22
/** A gap this small cannot be seen, so the scene is taken to have arrived and stops drawing. */
const ARRIVED = 0.0004
/** Frames a second while only the beads are moving (D26). */
const AMBIENT_FPS = 30
/** Seconds for the torch to close about two thirds of the gap to the pointer, and to light. */
const TORCH_CHASE = 0.07
const TORCH_LIGHT = 0.3
/** The most grains the opening line is given, and the share of the cloud's points it may take. */
const GRAINS = 5000
const GRAIN_SHARE = 0.03
/** A grain's width while it stands on its letter, in CSS pixels. */
const GRAIN_SIZE = 1.5
/** The heading that crumbles: the Found beat's line (src/sections/Story.tsx). */
const OPENING_LINE = 'found-title'
/** The page's background (--color-void), so the canvas can be opaque. */
const VOID = '#0a0a0a'

const values = machineDefaults(machine)

/**
 * Moves the torch toward the pointer and says whether it has come to rest. The light follows the
 * pointer a moment behind, and comes up and goes down, not on and off.
 */
function lightTorch(
  material: ShaderMaterial,
  pointer: { x: number; y: number; on: boolean },
  width: number,
  height: number,
  dt: number,
) {
  const light = material.uniforms.uTorch!.value as Vector3
  const lit = pointer.on && story.gather.lens < 1 ? 1 : 0
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
 * out as far as it has crumbled. A grain is drawn until the point it is a copy of is, which is
 * by the time the last part has gathered.
 */
function crumbleLine(
  grains: Points | null,
  material: ShaderMaterial,
  ink: Ink | null,
  width: number,
  height: number,
) {
  if (!grains || !ink) return
  rubOut(ink, story.crumble)
  grains.visible = story.crumble < 1 || story.gather.lens < 1
  if (!grains.visible) return
  const corner = ink.line.getBoundingClientRect()
  ;(material.uniforms.uLine!.value as Vector4).set(
    (corner.left / width) * 2 - 1,
    1 - (corner.top / height) * 2,
    2 / width,
    -2 / height,
  )
  material.uniforms.uCrumble!.value = story.crumble
  material.uniforms.uAspect!.value = width / height
}

/**
 * `?lines=0` and `?depth=0` in the address turn off the drawn lines and the fade with depth, to
 * compare the Machine with and without them (docs/DECISIONS.md, D34). `?words=0` leaves the
 * opening line alone (D37).
 */
const wanted = (key: string) => new URLSearchParams(location.search).get(key) !== '0'

function Machine({ tier, points, still }: { tier: Tier; points: number; still: boolean }) {
  const invalidate = useThree((state) => state.invalidate)
  const dpr = useThree((state) => state.viewport.dpr)
  const bufferHeight = useThree((state) => state.size.height) * dpr
  const count = Math.round(points * POINT_LOOK.density)
  const scale = lift(count, POINT_LOOK.boost)
  const dust = dustLook(count, POINT_LOOK.boost)

  const geometry = useMemo(
    () => samplePoints(machine, values, count, POINT_LOOK.weights, POINT_LOOK.thin),
    [count],
  )
  const material = useMemo(() => pointsMaterial(), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  const [drawn] = useState(() => wanted('lines'))
  const [depth] = useState(() => (wanted('depth') ? undefined : 0))
  const lines = useMemo(() => sampleLines(machine, values), [])
  const lineMaterial = useMemo(() => linesMaterial(), [])
  useEffect(() => () => lines.dispose(), [lines])
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial])

  // The opening line crumbles into the dust on the first scroll (D37): its letters are read off
  // the page, and again whenever the page lays them out differently. Not with reduced motion,
  // where there is no dust for it to crumble into.
  const [worded] = useState(() => wanted('words') && !still)
  const [ink, setInk] = useState<Ink | null>(null)
  const grainCount = Math.min(GRAINS, Math.round(count * GRAIN_SHARE))
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
  const grains = useMemo(() => ink && sampleGrains(geometry, ink.grains), [geometry, ink])
  const grainMaterial = useMemo(() => pointsMaterial(true), [])
  const grainPoints = useRef<Points>(null)
  useEffect(() => () => grains?.dispose(), [grains])
  useEffect(() => () => grainMaterial.dispose(), [grainMaterial])

  // The page moving is the only thing that asks for a frame.
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

  // The pointer torch: a mouse moving over the page lights the dust near it. There is none for
  // touch, where nothing hovers, and none on the low tier (docs/PERFORMANCE.md). It asks for
  // frames only while there is dust to light, which is until every part has gathered.
  const torch = useRef({ x: 0, y: 0, on: false })
  useEffect(() => {
    if (tier === 'low') return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      torch.current = { x: event.clientX, y: event.clientY, on: true }
      if (story.gather.lens < 1) invalidate()
    }
    const leave = () => {
      torch.current.on = false
      if (story.gather.lens < 1) invalidate()
    }
    addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [tier, invalidate])

  // The beads drift only on a device with frames to spare, and only if motion is welcome.
  const ambient = tier !== 'low' && !still
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

    if (still) seekStill(progress.eased)
    else seek(progress.eased)
    const drifting = ambient && story.wake.rings > 0
    if (drifting) story.drift += dt * story.wake.rings
    applyStory(material)
    applyStory(lineMaterial)
    applyStory(grainMaterial)
    crumbleLine(grainPoints.current, grainMaterial, ink, size.width, size.height)
    applyCamera(camera as PerspectiveCamera, story.camera, size.width, size.height)

    const held = lightTorch(material, torch.current, size.width, size.height, dt)

    if (!arrived || !held) invalidate()
    else if (drifting && !waiting.current) {
      waiting.current = true
      setTimeout(tick, 1000 / AMBIENT_FPS)
    }
  })

  // What both the cloud and the grains of the opening line are drawn with.
  const look = {
    'uniforms-uSize-value': POINT_LOOK.size * scale,
    'uniforms-uBrightness-value': POINT_LOOK.brightness * scale,
    'uniforms-uHeight-value': bufferHeight,
    'uniforms-uDustShare-value': dust.share,
    'uniforms-uDustLift-value': dust.lift,
    ...(depth === 0 && { 'uniforms-uDepth-value': 0 }),
  }

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <primitive object={material} attach="material" {...look} />
      </points>
      {grains && (
        <points ref={grainPoints} geometry={grains} frustumCulled={false}>
          <primitive
            object={grainMaterial}
            attach="material"
            {...look}
            uniforms-uGrain-value-x={GRAIN_SIZE * dpr}
          />
        </points>
      )}
      {drawn && (
        <lineSegments geometry={lines} frustumCulled={false}>
          <primitive
            object={lineMaterial}
            attach="material"
            {...(depth === 0 && { 'uniforms-uDepth-value': 0 })}
          />
        </lineSegments>
      )}
    </>
  )
}

export default function Experience() {
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
      camera={{ near: 0.1, far: 100 }}
    >
      <color attach="background" args={[VOID]} />
      <Machine tier={tier} points={budget.points} still={still} />
    </Canvas>
  )
}
