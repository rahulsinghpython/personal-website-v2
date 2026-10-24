import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// The résumé drawn by PDF.js, through react-pdf (docs/DECISIONS.md, D49): the same in every
// browser, phones included, with its text selectable and its links live. The lazy entry of the
// résumé page (src/sections/Resume.tsx), so none of it is on the page's critical path.

// Set here, in the module that renders the PDF, as react-pdf asks: set anywhere else, its own
// default can win. Vite copies the worker into the build and gives back its address.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/** The sheet's widest, in CSS pixels: about A4 at the size it is read on a screen. */
const WIDEST = 832

/** Every page of the PDF at `file`, as wide as its column allows. `fallback` is shown if it fails. */
export default function PdfSheet({ file, fallback }: { file: string; fallback: React.ReactNode }) {
  const column = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [pages, setPages] = useState(0)

  useEffect(() => {
    const element = column.current
    if (!element) return
    const measured = new ResizeObserver(([entry]) =>
      setWidth(Math.min(WIDEST, Math.floor(entry!.contentRect.width))),
    )
    measured.observe(element)
    return () => measured.disconnect()
  }, [])

  return (
    <div ref={column} className="w-full">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
        loading={<div className="resume-page resume-blank" />}
        error={<div className="resume-page resume-blank">{fallback}</div>}
        className="grid gap-6"
      >
        {width > 0 &&
          Array.from({ length: pages }, (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              width={width}
              className="resume-page"
              loading={<div className="resume-blank" style={{ width }} />}
            />
          ))}
      </Document>
    </div>
  )
}
