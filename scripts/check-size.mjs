// Fails when the production build is over a bundle budget in docs/PERFORMANCE.md.
// Runs after `vite build`. Sizes are gzipped and in the units `vite build` prints (1 kB = 1000 B).
//
// It measures what a page is told to load, not what a file is called: it reads each built HTML
// page for the files it references, and Vite's manifest for what those files import.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'

const DIST = 'dist'
const MANIFEST = '.vite/manifest.json'

// Mirrors the Loading table in docs/PERFORMANCE.md. Change both together, with a DECISIONS entry.
const BUDGET_KB = { critical: 100, scene: 300, whole: 1000 }

// The site's pages (src/routes.ts). Any other HTML in the build, the workbench say, is a failure.
const PAGES = ['index.html', 'plain/index.html']

// The scene is whatever the lazy entries under this folder pull in beyond the page's own files.
const SCENE_SRC = 'src/experience/'

// Emitted by the build but requested by no page (see "How it is prerendered" in ARCHITECTURE.md).
// Any other file that no budget covers fails the check, so nothing ships unmeasured.
const NEVER_REQUESTED = [/\/react-dom\/server\.edge\.js$/]

if (!existsSync(join(DIST, MANIFEST))) {
  console.error(`No ${DIST}/${MANIFEST}. Run \`vite build\` first, with build.manifest on.`)
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(join(DIST, MANIFEST), 'utf8'))
const chunks = Object.values(manifest)
const chunkByFile = new Map(chunks.map((chunk) => [chunk.file, chunk]))

const allFiles = readdirSync(DIST, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => relative(DIST, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))

const sizes = new Map()
function gzipped(file) {
  if (!sizes.has(file)) sizes.set(file, gzipSync(readFileSync(join(DIST, file))).length)
  return sizes.get(file)
}
const total = (files) => [...files].reduce((sum, file) => sum + gzipped(file), 0)
const kB = (bytes) => (bytes / 1000).toFixed(1)

/** Adds a chunk's file, its CSS and assets, and the same for everything it imports. */
function collect(chunk, { lazy, skip }, files = new Set()) {
  if (files.has(chunk.file) || skip?.has(chunk.file)) return files
  files.add(chunk.file)
  for (const file of [...(chunk.css ?? []), ...(chunk.assets ?? [])]) files.add(file)
  const imports = [...(chunk.imports ?? []), ...(lazy ? (chunk.dynamicImports ?? []) : [])]
  for (const key of imports) collect(manifest[key], { lazy, skip }, files)
  return files
}

/** The local files an HTML page asks the browser for before any script runs. */
function referencedBy(html) {
  const files = []
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/g)) {
    const url = /\b(?:src|href)="([^"]+)"/.exec(tag)?.[1]
    if (!url?.startsWith('/')) continue
    if (tag.startsWith('<link') && !/\brel="(?:stylesheet|modulepreload|preload)"/.test(tag))
      continue
    files.push(url.slice(1))
  }
  return files
}

const failures = []
const rows = []
function budget(label, files, limitKb) {
  const bytes = total(files)
  const over = bytes > limitKb * 1000
  rows.push([label, `${kB(bytes)} / ${limitKb} kB`, over ? 'OVER' : 'ok'])
  if (!over) return
  const breakdown = [...files]
    .sort((a, b) => gzipped(b) - gzipped(a))
    .map((file) => `    ${kB(gzipped(file)).padStart(7)} kB  ${file}`)
  failures.push(`${label} is over its ${limitKb} kB budget:\n${breakdown.join('\n')}`)
}

// Critical path, per page: the HTML, what it references, and what those files import statically.
const pages = allFiles.filter((file) => file.endsWith('.html')).sort()
if (pages.length === 0) failures.push(`No HTML pages in ${DIST}.`)
for (const page of pages) {
  if (!PAGES.includes(page))
    failures.push(`${page} is not one of the site's pages. A development page has been built.`)
}

const criticalByPage = new Map()
for (const page of pages) {
  const files = new Set([page])
  for (const file of referencedBy(readFileSync(join(DIST, page), 'utf8'))) {
    if (!existsSync(join(DIST, file))) {
      failures.push(`${page} references ${file}, which is not in ${DIST}.`)
      continue
    }
    files.add(file)
    const chunk = chunkByFile.get(file)
    if (chunk) collect(chunk, { lazy: false }, files)
  }
  criticalByPage.set(page, files)
  const path = '/' + page.replace(/\/?index\.html$/, '')
  budget(`Critical path ${path}`, files, BUDGET_KB.critical)
}

// Scene chunk: everything the lazy scene entries reach that the home page has not already loaded.
const home = criticalByPage.get('index.html') ?? new Set()
const scene = new Set()
for (const chunk of chunks) {
  if (chunk.isDynamicEntry && chunk.src?.startsWith(SCENE_SRC))
    collect(chunk, { lazy: true, skip: home }, scene)
}
if (scene.size > 0) budget('Scene chunk', scene, BUDGET_KB.scene)
else rows.push(['Scene chunk', 'not built yet', ''])

budget('Whole experience', new Set([...home, ...scene]), BUDGET_KB.whole)

// Everything else in dist has to be accounted for.
const counted = new Set([
  MANIFEST,
  ...scene,
  ...[...criticalByPage.values()].flatMap((f) => [...f]),
])
const neverRequested = new Set(
  chunks
    .filter((chunk) => NEVER_REQUESTED.some((pattern) => pattern.test(chunk.src ?? '')))
    .map((chunk) => chunk.file),
)
const uncovered = allFiles.filter((file) => !counted.has(file) && !neverRequested.has(file))
if (uncovered.length > 0) {
  const list = uncovered.map((file) => `    ${kB(gzipped(file)).padStart(7)} kB  ${file}`)
  failures.push(
    `Not covered by any budget:\n${list.join('\n')}\n` +
      '  If a page loads it, it belongs in a budget. If nothing does, it should not be in the build.',
  )
}

console.log('\nBundle budgets (gzip)\n')
const width = Math.max(...rows.map(([label]) => label.length))
for (const [label, size, status] of rows)
  console.log(`  ${label.padEnd(width)}  ${size.padStart(18)}  ${status}`)
if (neverRequested.size > 0) {
  console.log('\n  Not counted, no page requests it:')
  for (const file of neverRequested) console.log(`    ${kB(gzipped(file)).padStart(7)} kB  ${file}`)
}

if (failures.length > 0) {
  console.error(`\n${failures.join('\n\n')}\n`)
  process.exit(1)
}
console.log()
