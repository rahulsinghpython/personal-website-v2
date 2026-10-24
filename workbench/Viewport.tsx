import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react'
import { MathUtils, PerspectiveCamera, type DirectionalLight } from 'three'
import { beats } from '../src/content/beats'
import { TIERS } from '../src/state/tiers'
import { announcePose, onPose, pose, poseToUrl } from './camera'
import { connect, measuredRender } from './stats'
import { useWorkbench } from './store'

// One canvas with the shared camera, and what every viewport has: the orbit, the greybox's
// light, the wheel that scrubs the story, and the probe that measures frames. What it shows is
// the city (./CityScene.tsx).

const FOV = 30

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
  // side, or a phone) shows as much of the city as a wide one instead of cropping it.
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

/**
 * Greybox lighting, so the form inside the outline can be read from any angle. The key light
 * rides above and beside the camera. The real scene is unlit points; see docs/PERFORMANCE.md.
 */
export function Headlight() {
  const light = useRef<DirectionalLight>(null)
  useFrame(({ camera }) => light.current?.position.set(4, 5, 2).applyMatrix4(camera.matrixWorld))
  return (
    <>
      <hemisphereLight args={['#ffffff', '#101010', 1.3]} />
      <directionalLight ref={light} intensity={5} />
    </>
  )
}

/** How many beats one notch of a mouse wheel (100 pixels of scroll) moves the story. */
const BEATS_PER_NOTCH = 0.12

/**
 * In the story view the camera is the visitor's, so it does not orbit. The wheel scrolls the
 * story instead, as the page will: down moves on, up goes back.
 */
function ScrollToScrub() {
  const element = useThree((state) => state.gl.domElement)
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const last = beats.length - 1
      const beat = useWorkbench.getState().beat ?? 0
      const next = Math.min(last, Math.max(0, beat + (event.deltaY / 100) * BEATS_PER_NOTCH))
      useWorkbench.setState({ beat: +next.toFixed(3) })
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [element])
  return null
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

/** One canvas with the shared camera, showing whatever it is given. */
export function Viewport({
  main,
  id,
  label,
  children,
}: {
  main: boolean
  id: string
  label: string
  children: ReactNode
}) {
  const tier = useWorkbench((state) => state.tier)
  const capDpr = useWorkbench((state) => state.capDpr)
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
        {children}
        {/* In the story view the scene places the camera itself (CityScene.tsx). */}
        {view !== 'story' && <Rig />}
        {view === 'story' && <ScrollToScrub />}
        {main && <Probe />}
      </Canvas>
      <figcaption>
        {id} <span>{label}</span>
      </figcaption>
    </figure>
  )
}
