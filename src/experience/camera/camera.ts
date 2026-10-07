import { MathUtils, type PerspectiveCamera } from 'three'
import type { BeatId } from '../../content/beats'

// Where the camera is at each beat. Between beats the timeline moves it from one pose to the
// next, so the camera is a function of progress like everything else in the scene.

/** The camera circles a point on the Machine: which point, from where, and how far back. */
export type Pose = {
  /** The point it looks at, in the Machine's units. */
  x: number
  y: number
  z: number
  /** Degrees round the Machine's axis. 0 looks at the Machine from the front. */
  azimuth: number
  /** Degrees above level. */
  elevation: number
  distance: number
}

/**
 * The path Rahul picked by scrolling it, in round 6 of docs/DESIGN-PROCESS.md (D35).
 *
 * The parts wake from the top of the Machine to the bottom (D32): the Scanner is on the top
 * plate, the Rings are round the lower plates and the Lens hangs under the last one. So after
 * the Core the camera only ever travels down.
 */
export const POSES: Record<BeatId, Pose> = {
  found: { x: 0, y: -0.3, z: 0, azimuth: 48, elevation: 20, distance: 13 },
  signal: { x: 0, y: -0.3, z: 0, azimuth: 36, elevation: 14, distance: 11.5 },
  core: { x: 0, y: 0.1, z: 0, azimuth: 22, elevation: 6, distance: 7.6 },
  scanner: { x: 0, y: 1.25, z: 0, azimuth: 28, elevation: 24, distance: 4.8 },
  rings: { x: 0, y: -0.55, z: 0, azimuth: 14, elevation: 28, distance: 7.8 },
  // From above, like every other pose: the camera never passes level, where each ring would be
  // a flat bar across the frame. The front of the lowest ring crosses the top of the cube (D35).
  lens: { x: 0, y: -1.9, z: 0, azimuth: 30, elevation: 20, distance: 5.2 },
  whole: { x: 0, y: -0.3, z: 0, azimuth: 36, elevation: 14, distance: 9.6 },
  contact: { x: 0, y: -0.3, z: 0, azimuth: 30, elevation: 10, distance: 10.6 },
}

/** Degrees, across the window's shorter side. */
const FOV = 30

/**
 * How far off centre the Machine is drawn, as a share of the window. The text sits at the left
 * edge of a wide window and at the bottom of a tall one, so the Machine moves right or up.
 */
const SHIFT_RIGHT = 0.14
const SHIFT_UP = 0.2

/** Points the camera as `pose` says, in a window of this size in CSS pixels. */
export function applyCamera(camera: PerspectiveCamera, pose: Pose, width: number, height: number) {
  const azimuth = MathUtils.degToRad(pose.azimuth)
  const elevation = MathUtils.degToRad(pose.elevation)
  const flat = Math.cos(elevation) * pose.distance
  camera.position.set(
    pose.x + Math.sin(azimuth) * flat,
    pose.y + Math.sin(elevation) * pose.distance,
    pose.z + Math.cos(azimuth) * flat,
  )
  camera.lookAt(pose.x, pose.y, pose.z)

  // The lens only changes with the window, so it is left alone on every other frame.
  const framed = camera.userData as { width?: number; height?: number }
  if (framed.width === width && framed.height === height) return
  framed.width = width
  framed.height = height
  const wide = width >= height
  // The field of view is fixed across the shorter side, so a phone held upright shows as much
  // of the Machine as a monitor does instead of cropping it.
  const half = Math.tan(MathUtils.degToRad(FOV / 2))
  camera.fov = MathUtils.radToDeg(2 * Math.atan(wide ? half : (half * height) / width))
  // Sliding the view moves the Machine on screen without changing the angle it is seen from.
  camera.setViewOffset(
    width,
    height,
    wide ? -SHIFT_RIGHT * width : 0,
    wide ? 0 : SHIFT_UP * height,
    width,
    height,
  )
}
