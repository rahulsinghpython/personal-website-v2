import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import {
  DoubleSide,
  MathUtils,
  PerspectiveCamera,
  type DirectionalLight,
  type ShaderMaterial,
  type Vector4,
} from 'three'
import { beats } from '../src/content/beats'
import { applyCamera } from '../src/experience/camera/camera'
import {
  buildPart,
  type MachineDef,
  type MachineValues,
  type PartDef,
} from '../src/experience/machine/part'
import { linesMaterial, sampleLines } from '../src/experience/machine/lines'
import { dustLook, lift, pointsMaterial, samplePoints } from '../src/experience/machine/points'
import { applyStory, seek, story } from '../src/experience/timeline'
import { TIERS } from '../src/state/tiers'
import { useCloud } from './cloud'
import { announcePose, onPose, pose, poseToUrl } from './camera'
import { connect, measuredRender, timeBuild } from './stats'
import { useWorkbench } from './store'

const GREY = '#9c9c9c'
/** The parts that are not the one being looked at. */
const DIM = '#2e2e2e'
const FOV = 30

function Part({ machine, part }: { machine: string; part: PartDef }) {
  // Every part's values, not only this one's: where a part sits depends on its neighbours.
  const values = useWorkbench((state) => state.params[machine]!) as MachineValues
  const shading = useWorkbench((state) => state.shading)
  const focus = useWorkbench((state) => state.focus)
  const colour = focus === 'all' || focus === part.id ? GREY : DIM
  const geometry = useMemo(() => timeBuild(() => buildPart(part, values)), [part, values])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      {shading === 'flat' ? (
        <meshBasicMaterial color={colour} side={DoubleSide} />
      ) : (
        <meshLambertMaterial color={colour} side={DoubleSide} flatShading />
      )}
    </mesh>
  )
}

/** Puts the timeline at a beat on the scrubber: 0 is Found and the last is Contact. */
const seekBeat = (beat: number) => seek(beat / (beats.length - 1))

/** The Machine outside the story: whole and dormant, as rounds 2 to 4 saw it. */
function showWhole(material: ShaderMaterial) {
  const uniforms = material.uniforms
  ;(uniforms.uGather!.value as Vector4).setScalar(1)
  ;(uniforms.uLock!.value as Vector4).setScalar(1)
  ;(uniforms.uWake!.value as Vector4).setScalar(0)
  uniforms.uTurn!.value = 0
  uniforms.uDrift!.value = 0
}

/** Round 4: the Machine as a cloud of points sampled from the solid shape. */
function Cloud({ machine }: { machine: MachineDef }) {
  const values = useWorkbench((state) => state.params[machine.id]!) as MachineValues
  const tier = useWorkbench((state) => state.tier)
  const beat = useWorkbench((state) => state.beat)
  const invalidate = useThree((state) => state.invalidate)
  const { density, weights, size, brightness, boost, thin } = useCloud()
  const bufferHeight = useThree((state) => state.size.height * state.viewport.dpr)
  const count = Math.round(TIERS[tier].points * density)
  const scale = lift(count, boost)
  const dust = dustLook(count, boost)

  const geometry = useMemo(
    () => timeBuild(() => samplePoints(machine, values, count, weights, thin)),
    [machine, values, count, weights, thin],
  )
  const material = useMemo(() => pointsMaterial(), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])
  const lines = useMemo(() => sampleLines(machine, values), [machine, values])
  const lineMaterial = useMemo(() => linesMaterial(), [])
  useEffect(() => () => lines.dispose(), [lines])
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial])

  // Round 6: the scrubber sets the story by hand. The beads do not drift here.
  useEffect(() => {
    for (const each of [material, lineMaterial]) {
      if (beat === null) showWhole(each)
      else {
        seekBeat(beat)
        applyStory(each)
      }
    }
    invalidate()
  }, [beat, material, lineMaterial, invalidate])

  return (
    <>
      <points geometry={geometry} frustumCulled={false}>
        <primitive
          object={material}
          attach="material"
          uniforms-uSize-value={size * scale}
          uniforms-uBrightness-value={brightness * scale}
          uniforms-uHeight-value={bufferHeight}
          uniforms-uDustShare-value={dust.share}
          uniforms-uDustLift-value={dust.lift}
        />
      </points>
      <lineSegments geometry={lines} material={lineMaterial} frustumCulled={false} />
    </>
  )
}

/** Orbit camera that follows, and feeds, the pose shared by every viewport. */
function Rig() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const aspect = useThree((state) => state.size.width / state.size.height)
  // An identity, so a viewport can ignore the pose changes it announced itself.
  const [self] = useState(() => ({}))
  const applying = useRef(false)

  useEffect(() => {
    const apply = () => {
      applying.current = true
      camera.position.copy(pose.position)
      controls.current?.target.copy(pose.target)
      controls.current?.update()
      applying.current = false
      invalidate()
    }
    apply()
    return onPose((from) => {
      if (from !== self) apply()
    })
  }, [camera, invalidate, self])

  // The field of view is fixed across the viewport's shorter side, so a narrow viewport (side by
  // side, or a phone) shows as much of the Machine as a wide one instead of cropping it.
  const get = useThree((state) => state.get)
  useEffect(() => {
    const { camera, invalidate } = get()
    if (!(camera instanceof PerspectiveCamera)) return
    const half = Math.tan(MathUtils.degToRad(FOV / 2))
    camera.fov = MathUtils.radToDeg(2 * Math.atan(aspect < 1 ? half / aspect : half))
    camera.updateProjectionMatrix()
    invalidate()
  }, [get, aspect])

  return (
    <OrbitControls
      ref={controls}
      dampingFactor={0.15}
      onChange={() => {
        if (applying.current || !controls.current) return
        pose.position.copy(camera.position)
        pose.target.copy(controls.current.target)
        announcePose(self)
      }}
      onEnd={() => {
        poseToUrl()
        useWorkbench.setState({ view: 'free' })
      }}
    />
  )
}

/** The camera the visitor gets: where the timeline puts it at the scrubber's beat. */
function StoryCamera() {
  const beat = useWorkbench((state) => state.beat) ?? 0
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    seekBeat(beat)
    applyCamera(camera, story.camera, size.width, size.height)
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

/**
 * Greybox lighting, so the form inside the outline can be read from any angle. The key light
 * rides above and beside the camera. The real Machine is unlit points; see docs/PERFORMANCE.md.
 */
function Headlight() {
  const light = useRef<DirectionalLight>(null)
  useFrame(({ camera }) => light.current?.position.set(4, 5, 2).applyMatrix4(camera.matrixWorld))
  return (
    <>
      <hemisphereLight args={['#ffffff', '#101010', 1.3]} />
      <directionalLight ref={light} intensity={5} />
    </>
  )
}

/** Takes over rendering in the main viewport so each frame can be measured. */
function Probe() {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(
    () => connect(() => invalidate(), gl.getContext() as WebGL2RenderingContext),
    [gl, invalidate],
  )
  useFrame(({ gl, scene, camera }) => measuredRender(gl, scene, camera), 1)
  return null
}

export function Viewport({ machine, main }: { machine: MachineDef; main: boolean }) {
  const tier = useWorkbench((state) => state.tier)
  const capDpr = useWorkbench((state) => state.capDpr)
  const shading = useWorkbench((state) => state.shading)
  const draw = useCloud((state) => state.draw)
  const view = useWorkbench((state) => state.view)
  const cap = TIERS[tier].pixelRatioCap

  return (
    <figure className="viewport" data-main={main}>
      <Canvas
        flat
        frameloop="demand"
        dpr={capDpr ? cap : Math.min(window.devicePixelRatio, cap)}
        camera={{ fov: FOV, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#0a0a0a']} />
        {draw === 'points' ? (
          <Cloud machine={machine} />
        ) : (
          <>
            {shading === 'shaded' && <Headlight />}
            {machine.parts.map((part) => (
              <Part key={part.id} machine={machine.id} part={part} />
            ))}
          </>
        )}
        {view === 'story' ? <StoryCamera /> : <Rig />}
        {main && <Probe />}
      </Canvas>
      <figcaption>
        {machine.id} <span>{machine.label}</span>
      </figcaption>
    </figure>
  )
}
