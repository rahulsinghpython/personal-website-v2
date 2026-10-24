import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  DoubleSide,
  type BufferGeometry,
  type PerspectiveCamera,
  type ShaderMaterial,
  type Vector3,
  type WebGLProgramParametersWithUniforms,
} from 'three'
import { applyCamera } from '../src/experience/camera/camera'
import { buildCity, disposeCity, GROUPS, type Piece } from '../src/experience/city/city'
import type { Layout } from '../src/experience/city/layouts'
import { cityLift, cityPointsMaterial, sampleCity } from '../src/experience/city/points'
import { cityFlow, cityStory, MOVES_FROM, RISE_SPAN, seekCity } from '../src/experience/city/story'
import { TIERS } from '../src/state/tiers'
import { pose } from './camera'
import { SHOWN, useCity } from './city'
import { useCloud } from './cloud'
import { timeBuild } from './stats'
import { useWorkbench } from './store'
import { Headlight } from './Viewport'

const GREY = '#9c9c9c'
/** The pieces that are not the ones being looked at. */
const DIM = '#2e2e2e'
const GROUND = '#161616'
/** The water is the background showing through, as it is black at night. */
const WATER = '#0a0a0a'
const WATER_SHOWN = '#4a4a4a'
const MAP = '#6b6b6b'
/** The map under the points: fainter, as the sketch drew it. */
const MAP_POINTS = '#4d4b47'

const PIECES: Piece[] = ['cbd', 'lens', 'heartland', 'rings', 'landmarks', 'science', 'mrt']

/**
 * Each building rises out of its footprint in its own turn: its height is scaled by how far the
 * city has risen, starting when the building's `aRise` says. Done in the shader, as the real city
 * will do it, so scrubbing the rise costs no rebuild.
 */
function riseShader(rise: { value: number }) {
  return (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uRise = rise
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'attribute float aRise;\nuniform float uRise;\nvoid main() {')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float start = aRise * ${(1 - RISE_SPAN).toFixed(3)};
        transformed.y *= smoothstep(start, start + ${RISE_SPAN.toFixed(3)}, uRise);`,
      )
  }
}

/** How far the city has risen, shared by every viewport, as they all show one moment. */
const RISE = { value: 1 }
const onBeforeCompile = riseShader(RISE)

/** 1 at `beat`, fading to nothing `width` beats either side. As the sketch drew the map. */
const near = (beat: number, at: number, width: number) => {
  const t = Math.min(1, Math.abs(beat - at) / width)
  return 1 - t * t * (3 - 2 * t)
}

/**
 * The layout greybox (Phase 3b): the tile of map, the water, and every building as a grey solid
 * risen from its footprint, for judging the layout and the camera. With `draw` at points it is the
 * city as points in the given look, the points round. With the story on, the city lands and rises
 * as the sketch did.
 */
export function CityScene({ layout, look }: { layout: Layout; look?: string }) {
  const values = useCity((state) => state.params[layout.id]!)
  const show = useCity((state) => state.show)
  const risen = useCity((state) => state.rise)
  const map = useCity((state) => state.map)
  const shading = useWorkbench((state) => state.shading)
  const draw = useCloud((state) => state.draw)
  const beat = useWorkbench((state) => state.beat)
  const view = useWorkbench((state) => state.view)
  const invalidate = useThree((state) => state.invalidate)
  const model = useMemo(() => timeBuild(() => buildCity(layout, values)), [layout, values])
  useEffect(() => () => disposeCity(model), [model])

  if (beat !== null) seekCity(beat)
  const rise = beat === null ? risen : cityStory.rise
  const land = beat === null ? 1 : cityStory.land
  // In the story the map shows while the city is flat, and goes as it rises.
  const lines = beat === null ? (map ? 1 : 0) : near(beat, 1.5, 0.32)
  useEffect(() => {
    RISE.value = rise
    invalidate()
  }, [rise, invalidate])

  const colour = (piece: Piece) =>
    show === 'all' || (show !== 'water' && SHOWN[show].includes(piece)) ? GREY : DIM
  const waterShown = show === 'water' || show === 'subjects'

  if (draw === 'points')
    return (
      <>
        {view === 'story' && <StoryCamera />}
        {lines > 0.01 && (
          <lineSegments geometry={model.map} position-y={0.004}>
            <lineBasicMaterial color={MAP_POINTS} transparent opacity={lines} />
          </lineSegments>
        )}
        <CityPoints layout={layout} look={look} rise={rise} land={land} />
      </>
    )

  return (
    <>
      {shading === 'shaded' && <Headlight />}
      {view === 'story' && <StoryCamera />}
      {land > 0 && (
        <>
          <mesh geometry={model.ground}>
            <meshBasicMaterial color={GROUND} transparent opacity={land} />
          </mesh>
          <mesh geometry={model.water} position-y={0.002}>
            <meshBasicMaterial
              color={waterShown ? WATER_SHOWN : WATER}
              side={DoubleSide}
              transparent
              opacity={land}
            />
          </mesh>
        </>
      )}
      {lines > 0.01 && (
        <lineSegments geometry={model.map} position-y={0.004}>
          <lineBasicMaterial color={MAP} transparent opacity={lines} />
        </lineSegments>
      )}
      {rise > 0 &&
        PIECES.map((piece) => (
          <mesh key={piece} geometry={model.solids[piece]}>
            {shading === 'flat' ? (
              <meshBasicMaterial
                color={colour(piece)}
                side={DoubleSide}
                onBeforeCompile={onBeforeCompile}
              />
            ) : (
              <meshLambertMaterial
                color={colour(piece)}
                side={DoubleSide}
                flatShading
                onBeforeCompile={onBeforeCompile}
              />
            )}
          </mesh>
        ))}
    </>
  )
}

/** Sets the story's moment on the points: risen, landed, and what is lit. Null is at rest. */
function lightCity(material: ShaderMaterial, rise: number, land: number, beat: number | null) {
  const uniforms = material.uniforms
  uniforms.uRise!.value = rise
  uniforms.uLand!.value = land
  if (beat !== null) seekCity(beat)
  uniforms.uLit!.value = beat === null ? GROUPS.map(() => 0) : [...cityStory.lit]
  uniforms.uGain!.value = beat === null ? GROUPS.map(() => 1) : [...cityStory.gain]
  uniforms.uWindows!.value = beat === null ? 0 : cityStory.windows
}

/** What changes every frame: how far the camera is from its subject, and how far things have moved. */
function focusCity(material: ShaderMaterial, distance: number, flow: [number, number, number]) {
  material.uniforms.uFocus!.value = distance
  ;(material.uniforms.uFlow!.value as Vector3).set(...flow)
}

/**
 * The city as points, in one look. Outside the story every group is at rest and cold; in it,
 * the beat lights and dims them as ./story.ts says.
 */
function CityPoints({
  layout,
  look: lookId,
  rise,
  land,
}: {
  layout: Layout
  look?: string
  rise: number
  land: number
}) {
  const values = useCity((state) => state.params[layout.id]!)
  const look = useCity((state) => state.looks[lookId ?? state.look]!)
  const tier = useWorkbench((state) => state.tier)
  const beat = useWorkbench((state) => state.beat)
  const view = useWorkbench((state) => state.view)
  const invalidate = useThree((state) => state.invalidate)
  const bufferHeight = useThree((state) => state.size.height * state.viewport.dpr)
  const count = Math.round(Math.min(look.count, TIERS[tier].points))
  const lift = cityLift(look, count)

  const geometry: BufferGeometry = useMemo(
    () => timeBuild(() => sampleCity(layout, values, look, count)),
    [layout, values, look, count],
  )
  const material = useMemo(() => cityPointsMaterial(layout), [layout])
  const motion = useCity((state) => state.motion)
  // The city's own clock: it runs only while something may move on its own (D26), at most 30
  // frames a second, and only adds up while it runs, so pausing it never makes the traffic jump.
  const clock = useRef(0)
  const ambient =
    motion &&
    tier !== 'low' &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    (beat === null || beat >= MOVES_FROM)
  useEffect(() => {
    if (!ambient) return
    let last = performance.now()
    const tick = setInterval(() => {
      const now = performance.now()
      if (!document.hidden) clock.current += Math.min(0.1, (now - last) / 1000)
      last = now
      if (!document.hidden) invalidate()
    }, 1000 / 30)
    return () => clearInterval(tick)
  }, [ambient, invalidate])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    lightCity(material, rise, land, beat)
    invalidate()
  }, [material, rise, land, beat, invalidate])

  // Near and far are measured from what the camera looks at: the story's subject, or the orbit's
  // target.
  useFrame(({ camera }) =>
    focusCity(
      material,
      view === 'story' ? cityStory.camera.distance : camera.position.distanceTo(pose.target),
      cityFlow(beat ?? 0, clock.current),
    ),
  )

  return (
    <points geometry={geometry} frustumCulled={false}>
      <primitive
        object={material}
        attach="material"
        uniforms-uSize-value={look.size * lift}
        uniforms-uBrightness-value={look.brightness * lift}
        uniforms-uHeight-value={bufferHeight}
      />
    </points>
  )
}

/** The camera the visitor gets: the sketch's pose at the scrubber's beat. */
function StoryCamera() {
  const beat = useWorkbench((state) => state.beat) ?? 0
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    seekCity(beat)
    applyCamera(camera, cityStory.camera, size.width, size.height, cityStory.lens)
    invalidate()
  }, [beat, camera, size, invalidate])
  // Hand the lens back as the free camera expects it.
  useEffect(
    () => () => {
      camera.clearViewOffset()
      camera.userData = {}
    },
    [camera],
  )
  return null
}
