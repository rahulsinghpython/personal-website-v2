import { MathUtils, type PerspectiveCamera } from 'three'

// How the camera is placed and framed. Where it is at each beat is the city's story
// (../city/story.ts, CITY_POSES); between beats the story moves it from one pose to the next, so
// the camera is a function of progress like everything else in the scene.

/** The camera circles a point in the city: which point, from where, and how far back. */
export type Pose = {
  /** The point it looks at, in the city's units. */
  x: number
  y: number
  z: number
  /** Degrees round the vertical through that point. 0 looks along -z, across the bay. */
  azimuth: number
  /** Degrees above level. */
  elevation: number
  distance: number
}

/**
 * How the picture is framed. `fov` is in degrees, across the window's shorter side. `right` and
 * `up` are how far off centre the subject is drawn, as a share of the window: the text sits at the
 * left edge of a wide window and at the bottom of a tall one, so the subject moves right or up.
 */
export type Lens = { fov: number; right: number; up: number }

/** Points the camera as `pose` says, in a window of this size in CSS pixels. */
export function applyCamera(
  camera: PerspectiveCamera,
  pose: Pose,
  width: number,
  height: number,
  lens: Lens,
) {
  const azimuth = MathUtils.degToRad(pose.azimuth)
  const elevation = MathUtils.degToRad(pose.elevation)
  const flat = Math.cos(elevation) * pose.distance
  camera.position.set(
    pose.x + Math.sin(azimuth) * flat,
    pose.y + Math.sin(elevation) * pose.distance,
    pose.z + Math.cos(azimuth) * flat,
  )
  camera.lookAt(pose.x, pose.y, pose.z)
  frame(camera, width, height, lens)
}

/** Sets the camera's lens for a window of this size in CSS pixels, wherever the camera is. */
export function frame(camera: PerspectiveCamera, width: number, height: number, lens: Lens) {
  // The lens changes with the window, and with the story, so it is left alone
  // on every frame where neither has changed. Kept as plain numbers: nothing new is made per frame.
  const framed = camera.userData as Partial<Lens & { width: number; height: number }>
  if (
    framed.width === width &&
    framed.height === height &&
    framed.fov === lens.fov &&
    framed.right === lens.right &&
    framed.up === lens.up
  )
    return
  framed.width = width
  framed.height = height
  framed.fov = lens.fov
  framed.right = lens.right
  framed.up = lens.up
  const wide = width >= height
  // The field of view is fixed across the shorter side, so a phone held upright shows as much
  // of the city as a monitor does instead of cropping it.
  const half = Math.tan(MathUtils.degToRad(lens.fov / 2))
  camera.fov = MathUtils.radToDeg(2 * Math.atan(wide ? half : (half * height) / width))
  // Sliding the view moves the subject on screen without changing the angle it is seen from.
  camera.setViewOffset(
    width,
    height,
    wide ? -lens.right * width : 0,
    wide ? 0 : lens.up * height,
    width,
    height,
  )
}
