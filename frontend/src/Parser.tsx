import { useRef, useState } from 'react'
import { ArrowRight, Download, FileText, LoaderCircle, Upload } from 'lucide-react'
import { downloadText, exportLatex } from './model'

interface ParsedResume {
  source: string
  preamble: string
  sections: { title: string; text: string; bullets: string[] }[]
  warnings: string[]
}
export function Parser() {
  const [source, setSource] = useState('')
  const [filename, setFilename] = useState('Pasted source')
  const [result, setResult] = useState<ParsedResume | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const revision = useRef(0)
  function change(value: string) {
    revision.current++
    setSource(value)
    setResult(null)
    setStatus('')
  }
  async function upload(file?: File) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.tex') || file.size > 200_000) {
      setStatus('Choose a .tex file smaller than 200 KB.')
      return
    }
    const current = ++revision.current
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
      if (current !== revision.current) return
      change(text)
      setFilename(file.name)
    } catch {
      setStatus('This file is not valid UTF-8 text. Try pasting its source.')
    }
  }
  async function parse() {
    if (!source.trim()) {
      setStatus('Paste your LaTeX resume or load the example first.')
      return
    }
    const current = revision.current
    setLoading(true)
    setStatus('Reading your resume…')
    setResult(null)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch('/api/v1/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
        signal: controller.signal,
      })
      const data = await response.json()
      if (current !== revision.current) return
      if (!response.ok)
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Check your source and keep it under 200,000 characters.',
        )
      setResult(data)
      setStatus('Your resume is ready to review.')
    } catch (error) {
      if (current === revision.current)
        setStatus(
          error instanceof Error && error.name === 'AbortError'
            ? 'The request timed out. Try again.'
            : error instanceof Error
              ? error.message
              : 'Unable to connect to the parser.',
        )
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }
  return (
    <section>
      <p className="eyebrow text-accent">Your resume, in focus</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Start with your story.</h1>
      <p className="mt-3 mb-7 text-sm text-muted">
        Upload or paste LaTeX to inspect its content. No AI calls or resume storage.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <label className="btn relative focus-within:outline-2 focus-within:outline-accent">
              <Upload size={16} />
              Upload .tex
              <input
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Upload LaTeX resume"
                type="file"
                accept=".tex,text/plain"
                onChange={(event) => {
                  void upload(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </label>
            <button
              className="min-h-11 text-sm font-medium text-accent"
              onClick={() => {
                change(exportLatex('backend', ['pending', 'pending', 'pending']))
                setFilename('example.tex')
              }}
            >
              Load example
            </button>
          </div>
          <label htmlFor="latex-input" className="mb-2 block text-sm font-medium">
            LaTeX source
          </label>
          <textarea
            id="latex-input"
            value={source}
            onChange={(event) => {
              change(event.target.value)
              setFilename('Pasted source')
            }}
            maxLength={200000}
            spellCheck={false}
            className="min-h-80 w-full resize-y rounded-lg border border-line bg-canvas p-4 font-mono text-xs leading-6"
            placeholder={'\\section{Experience}\n\\item Your experience here.'}
          />
          <div className="my-3 flex justify-between text-xs text-muted">
            <span>{filename}</span>
            <span>{source.length.toLocaleString()} characters</span>
          </div>
          <p role="status" className="my-4 min-h-5 text-sm text-muted">
            {status}
          </p>
          <button className="btn-primary w-full" disabled={loading} onClick={() => void parse()}>
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <ArrowRight size={17} />
            )}
            Preview resume
          </button>
        </div>
        <section className="panel p-6" aria-label="Parsed resume">
          {result ? (
            <>
              <h2 className="mb-4 text-lg font-semibold">
                {result.sections.length} sections found
              </h2>
              {result.warnings.map((warning) => (
                <p
                  key={warning}
                  className="mb-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900"
                >
                  {warning}
                </p>
              ))}
              <p className="mb-5 text-sm leading-7">{result.preamble}</p>
              {result.sections.map((section, i) => (
                <section key={i} className="mb-5 border-t border-line pt-4">
                  <h3 className="mb-2 font-semibold">{section.title}</h3>
                  <p className="text-sm leading-7 whitespace-pre-wrap text-muted">{section.text}</p>
                </section>
              ))}
              <button
                className="btn"
                onClick={() => downloadText(result.source, 'resume-original.tex')}
              >
                <Download size={16} />
                Download original .tex
              </button>
            </>
          ) : (
            <div className="grid min-h-96 place-content-center text-center">
              <FileText size={32} className="mx-auto mb-5 text-accent" />
              <h2 className="text-lg font-semibold">Your content, clearly structured.</h2>
              <p className="mt-3 max-w-xs text-sm leading-7 text-muted">
                Sections, bullets, and skills appear here after parsing. Your original LaTeX stays
                intact.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
