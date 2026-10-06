import { Vector2, type Camera, type Scene, type WebGLRenderer } from 'three'

// What a frame costs, measured around the render call of the main viewport.
//
// Cost is reported in milliseconds, not only as a frame rate, because a frame rate is capped by
// whatever is pacing the browser (see "Measuring" in docs/PERFORMANCE.md). CPU time is the time
// spent inside render(). GPU time comes from the timer-query extension and arrives a few frames
// late, so it is collected separately.

/** Live numbers, read by the panel on a timer. Mutated in place; never goes through React. */
export const stats = {
  fps: 0,
  cpuMs: 0,
  gpuMs: 0,
  drawCalls: 0,
  triangles: 0,
  points: 0,
  /** Frames drawn since load. It must stop climbing when input stops. */
  frames: 0,
  pixelRatio: 0,
  /** Time the last geometry rebuild took. */
  buildMs: 0,
}

/** Wraps a geometry rebuild so the panel can show how long it took. */
export function timeBuild<T>(build: () => T): T {
  const start = performance.now()
  const built = build()
  stats.buildMs = performance.now() - start
  return built
}

// Not in TypeScript's DOM types.
type TimerQuery = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number }
const timerQuery = (gl: WebGL2RenderingContext) =>
  gl.getExtension('EXT_disjoint_timer_query_webgl2') as TimerQuery | null

type Spread = { median: number; p95: number; max: number }

export type BenchmarkReport = {
  frames: number
  /** Time inside render(), per frame. */
  cpuMs: Spread
  /** GPU time per frame. Null when the timer-query extension is missing. */
  gpuMs: Spread | null
  /** Gap between frames. Says how the browser is paced, not what the scene costs. */
  intervalMs: Spread
  drawCalls: number
  triangles: number
  points: number
  pixelRatio: number
  drawingBuffer: [number, number]
  buildMs: number
  renderer: string
}

type Run = {
  warmup: number
  cpu: Float32Array
  interval: Float32Array
  gpu: number[]
  taken: number
  finishing: boolean
  resolve: (report: BenchmarkReport) => void
}

let run: Run | null = null
let requestFrame: (() => void) | null = null
let lastFrameAt = 0

const MAX_PENDING = 8
const pending: WebGLQuery[] = []

function spread(samples: ArrayLike<number>): Spread {
  const sorted = Array.from(samples).sort((a, b) => a - b)
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0
  const round = (n: number) => +n.toFixed(3)
  return { median: round(at(0.5)), p95: round(at(0.95)), max: round(at(1)) }
}

/** Collects any GPU timings that have become available. */
function collect(gl: WebGL2RenderingContext, ext: TimerQuery) {
  // A disjoint event (a context switch, say) makes every outstanding timing meaningless.
  if (gl.getParameter(ext.GPU_DISJOINT_EXT)) {
    for (const query of pending.splice(0)) gl.deleteQuery(query)
    return
  }
  while (pending[0] && gl.getQueryParameter(pending[0], gl.QUERY_RESULT_AVAILABLE)) {
    const query = pending.shift()!
    const ms = (gl.getQueryParameter(query, gl.QUERY_RESULT) as number) / 1e6
    gl.deleteQuery(query)
    stats.gpuMs = ms
    if (run && run.taken > 0) run.gpu.push(ms)
  }
}

/** Renders one frame of the main viewport and records what it cost. */
export function measuredRender(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  const gl = renderer.getContext() as WebGL2RenderingContext
  const ext = timerQuery(gl)

  const query = ext && pending.length < MAX_PENDING ? gl.createQuery() : null
  if (ext && query) gl.beginQuery(ext.TIME_ELAPSED_EXT, query)
  const start = performance.now()
  renderer.render(scene, camera)
  const cpuMs = performance.now() - start
  if (ext && query) {
    gl.endQuery(ext.TIME_ELAPSED_EXT)
    pending.push(query)
  }
  if (ext) collect(gl, ext)

  const interval = start - lastFrameAt
  lastFrameAt = start
  // Frames further apart than this are separate bursts of input, not a frame rate.
  if (interval < 250)
    stats.fps = stats.fps ? stats.fps * 0.9 + (1000 / interval) * 0.1 : 1000 / interval
  stats.cpuMs = cpuMs
  stats.drawCalls = renderer.info.render.calls
  stats.triangles = renderer.info.render.triangles
  stats.points = renderer.info.render.points
  stats.pixelRatio = renderer.getPixelRatio()
  stats.frames++

  if (!run || run.finishing) return
  if (run.warmup > 0) {
    run.warmup--
  } else if (run.taken < run.cpu.length) {
    run.cpu[run.taken] = cpuMs
    run.interval[run.taken] = interval
    run.taken++
  }
  if (run.taken < run.cpu.length) requestFrame?.()
  else finish(renderer, gl, ext)
}

function finish(renderer: WebGLRenderer, gl: WebGL2RenderingContext, ext: TimerQuery | null) {
  const finished = run!
  finished.finishing = true
  const size = renderer.getDrawingBufferSize(new Vector2())
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  // The last few GPU timings land after the last frame, so wait for them before reporting.
  let waited = 0
  const settle = () => {
    if (ext) collect(gl, ext)
    if (ext && pending.length > 0 && waited++ < 20) return void setTimeout(settle, 25)
    run = null
    finished.resolve({
      frames: finished.taken,
      cpuMs: spread(finished.cpu),
      gpuMs: finished.gpu.length > 0 ? spread(finished.gpu) : null,
      intervalMs: spread(finished.interval),
      drawCalls: stats.drawCalls,
      triangles: stats.triangles,
      points: stats.points,
      pixelRatio: stats.pixelRatio,
      drawingBuffer: [size.x, size.y],
      buildMs: +stats.buildMs.toFixed(2),
      renderer: info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : 'unknown',
    })
  }
  settle()
}

/** The main viewport registers how to ask it for another frame. */
export function connect(invalidate: () => void, gl: WebGL2RenderingContext) {
  requestFrame = invalidate
  // GPU timings for the last frame before rest arrive after it, with no frame left to read them.
  const timer = setInterval(() => {
    const ext = timerQuery(gl)
    if (ext) collect(gl, ext)
    if (performance.now() - lastFrameAt > 500) stats.fps = 0
  }, 250)
  return () => {
    clearInterval(timer)
    requestFrame = null
  }
}

/**
 * Renders `frames` frames back to back and reports what they cost. The only thing on the
 * workbench that draws without input, and only while it runs.
 */
export function benchmark({ frames = 240, warmup = 20 } = {}): Promise<BenchmarkReport> {
  if (run) return Promise.reject(new Error('A benchmark is already running.'))
  if (!requestFrame) return Promise.reject(new Error('No viewport is mounted.'))
  return new Promise((resolve) => {
    run = {
      warmup,
      cpu: new Float32Array(frames),
      interval: new Float32Array(frames),
      gpu: [],
      taken: 0,
      finishing: false,
      resolve,
    }
    requestFrame!()
  })
}
