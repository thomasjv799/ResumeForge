import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Layers2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import { assessResume, extractResume, validateFile } from './intake'
import { downloadText } from './model'

const SampleStudio = lazy(() => import('./SampleStudio'))
const stages = ['Reading your file', 'Extracting resume text', 'Checking resume structure']
type Resume = { name: string; text: string; assessment: ReturnType<typeof assessResume> }

export default function App() {
  const [view, setView] = useState<'upload' | 'processing' | 'results' | 'sample'>('upload')
  const [stage, setStage] = useState(0)
  const [resume, setResume] = useState<Resume | null>(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const request = useRef(0)
  const input = useRef<HTMLInputElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()
  useEffect(
    () => () => {
      request.current++
    },
    [],
  )

  function restart() {
    request.current++
    setResume(null)
    setDraft('')
    setEditing(false)
    setError('')
    setNotice('')
    setView('upload')
  }
  async function upload(file?: File) {
    if (!file) return
    const id = ++request.current
    setError('')
    setDragging(false)
    try {
      validateFile(file)
      setStage(0)
      setView('processing')
      const pause = () => new Promise((resolve) => setTimeout(resolve, reduced ? 0 : 450))
      const bytes = new Uint8Array(await file.arrayBuffer())
      await pause()
      if (request.current !== id) return
      setStage(1)
      await pause()
      const text = extractResume(bytes, file.name)
      if (request.current !== id) return
      setStage(2)
      const assessment = assessResume(text)
      await pause()
      if (request.current !== id) return
      setResume({ name: file.name, text, assessment })
      setDraft(text)
      setEditing(false)
      setView('results')
    } catch (cause) {
      if (request.current !== id) return
      setError(
        cause instanceof Error
          ? cause.message
          : 'We could not read this file. Try another Word or text resume.',
      )
      setView('upload')
    }
  }
  if (view === 'sample')
    return (
      <>
        <div className="border-b border-line bg-accent-soft px-5 py-3 text-sm">
          <button className="btn" onClick={restart}>
            ← Back to upload
          </button>
          <span className="ml-4">Fictional sample · no uploaded resume used</span>
        </div>
        <Suspense
          fallback={
            <p className="p-8" role="status">
              Opening sample…
            </p>
          }
        >
          <SampleStudio />
        </Suspense>
      </>
    )
  const score = resume?.assessment.score ?? 0
  return (
    <MotionConfig reducedMotion="user">
      <a className="sr-only focus:not-sr-only focus:p-4" href="#main">
        Skip to content
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-10">
          <button
            onClick={restart}
            aria-label="ResumeForge home"
            className="flex items-center gap-3 text-lg font-semibold tracking-tight"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-white">
              <Layers2 size={22} />
            </span>
            ResumeForge
            <span className="hidden text-xs font-normal text-muted sm:inline">/ studio</span>
          </button>
          <span className="flex items-center gap-2 text-xs text-muted">
            <LockKeyhole size={14} />{' '}
            <span className="hidden sm:inline">Your resume stays in this browser</span>
            <span className="sm:hidden">Browser only</span>
          </span>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-5 py-10 sm:px-10 sm:py-14">
        <ol aria-label="Resume review progress" className="mb-12 flex max-w-xl gap-3 sm:gap-8">
          {['Upload resume', 'Understand it', 'Make it yours'].map((label, index) => {
            const current = view === 'upload' ? 0 : view === 'processing' ? 1 : 2
            return (
              <li
                key={label}
                aria-current={index === current ? 'step' : undefined}
                className={`flex items-center gap-2 text-[11px] sm:text-xs ${index === current ? 'font-semibold text-accent' : 'text-muted'}`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border ${index <= current ? 'border-accent bg-accent text-white' : 'border-line bg-white'}`}
                >
                  {index < current ? <Check size={13} /> : `0${index + 1}`}
                </span>
                {label}
              </li>
            )
          })}
        </ol>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onAnimationComplete={() => heading.current?.focus()}
          >
            {view === 'upload' && (
              <div className="grid gap-12 lg:grid-cols-[1.3fr_.7fr] lg:gap-20">
                <section>
                  <p className="eyebrow mb-4 text-accent">A stronger next chapter</p>
                  <h1
                    ref={heading}
                    tabIndex={-1}
                    className="max-w-xl text-4xl leading-[1.15] font-semibold tracking-[-1.8px] outline-none sm:text-5xl"
                  >
                    Great experience.
                    <br />
                    <span className="text-accent">Let’s make it read that way.</span>
                  </h1>
                  <p className="mt-5 max-w-lg text-base leading-7 text-muted">
                    Start with the resume you already have. See what’s there, find what needs
                    attention, and decide what changes.
                  </p>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      void upload(e.dataTransfer.files[0])
                    }}
                    className={`mt-8 rounded-2xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${dragging ? 'border-accent bg-accent-soft' : 'border-[#c9c3dc] bg-white'}`}
                  >
                    <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent">
                      <UploadCloud size={29} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-semibold">Drop your resume here</h2>
                    <p id="upload-help" className="mt-2 text-sm text-muted">
                      Word (.docx) or plain text · up to 2 MB
                    </p>
                    <input
                      ref={input}
                      type="file"
                      accept=".docx,.txt"
                      aria-label="Upload resume"
                      aria-describedby="upload-help upload-error"
                      className="sr-only"
                      onChange={(e) => {
                        void upload(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                    <button
                      className="btn-primary mx-auto mt-6"
                      onClick={() => input.current?.click()}
                    >
                      Choose a resume <ArrowRight size={16} />
                    </button>
                  </div>
                  <p
                    id="upload-error"
                    role={error ? 'alert' : undefined}
                    className="mt-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                  <p className="mt-4 text-center text-xs text-muted">
                    Just exploring?{' '}
                    <button
                      className="min-h-10 px-2 font-medium text-accent underline underline-offset-4"
                      onClick={() => setView('sample')}
                    >
                      Try the sample workspace
                    </button>
                  </p>
                </section>
                <aside className="lg:pt-12">
                  <div className="rounded-2xl bg-[#252334] p-8 text-white">
                    <p className="eyebrow text-[#c7beda]">Thoughtful by design</p>
                    <h2 className="mt-4 text-2xl font-medium tracking-tight">
                      Your story.
                      <br />
                      You stay in control.
                    </h2>
                    <div className="mt-8 space-y-7">
                      {[
                        [
                          FileText,
                          'Understand first',
                          'We extract the text and check five essentials in your resume.',
                        ],
                        [
                          Sparkles,
                          'See what could improve',
                          'Get a transparent structure score and practical suggestions.',
                        ],
                        [
                          ShieldCheck,
                          'Nothing changes without you',
                          'Choose whether to open an editable copy. Your original stays intact.',
                        ],
                      ].map(([Icon, title, copy]) => {
                        const Symbol = Icon as typeof FileText
                        return (
                          <div key={String(title)} className="flex gap-4">
                            <Symbol size={20} className="mt-1 shrink-0 text-[#c4b3ff]" />
                            <div>
                              <h3 className="text-sm font-medium">{String(title)}</h3>
                              <p className="mt-2 text-xs leading-6 text-[#ccc6db]">
                                {String(copy)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <p className="mt-5 px-2 text-xs leading-6 text-muted">
                    Text extraction runs locally. Files are not uploaded to a server or saved after
                    you leave. PDF and formatted Word export are planned.
                  </p>
                </aside>
              </div>
            )}
            {view === 'processing' && (
              <section className="mx-auto max-w-xl py-10 text-center" aria-busy="true">
                <div className="relative mx-auto mb-8 grid size-24 place-items-center rounded-3xl bg-accent-soft text-accent">
                  <FileText size={38} strokeWidth={1.4} />
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-accent"
                    animate={reduced ? {} : { opacity: [0.2, 1, 0.2], scale: [1, 1.07, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <h1
                  ref={heading}
                  tabIndex={-1}
                  className="text-3xl font-semibold tracking-tight outline-none"
                >
                  Getting to know your resume.
                </h1>
                <p className="mt-3 text-sm text-muted">A little clarity before the next step.</p>
                <div role="status" aria-live="polite" className="sr-only">
                  {stages[stage]}
                </div>
                <ol className="panel mt-8 divide-y divide-line text-left">
                  {stages.map((label, index) => (
                    <li
                      key={label}
                      className={`flex items-center gap-3 p-5 text-sm ${index > stage ? 'text-muted' : 'text-ink'}`}
                    >
                      <span
                        className={`grid size-7 place-items-center rounded-full ${index <= stage ? 'bg-accent-soft text-accent' : 'bg-gray-100'}`}
                      >
                        {index < stage ? <Check size={15} /> : index + 1}
                      </span>
                      {label}
                      {index === stage && (
                        <span className="ml-auto text-xs text-accent">In progress</span>
                      )}
                    </li>
                  ))}
                </ol>
                <button className="btn mx-auto mt-6" onClick={restart}>
                  Cancel
                </button>
              </section>
            )}
            {view === 'results' && resume && (
              <section>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-3 text-accent">Your starting point, understood</p>
                    <h1
                      ref={heading}
                      tabIndex={-1}
                      className="text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
                    >
                      A clearer picture. A stronger resume.
                    </h1>
                    <p className="mt-3 max-w-xl truncate text-sm text-muted">
                      {resume.name} · {resume.assessment.words} words extracted
                    </p>
                  </div>
                  <button className="btn" onClick={restart}>
                    Upload another resume
                  </button>
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-[.8fr_1.2fr]">
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-[#252334] p-7 text-white">
                      <p className="eyebrow text-[#c7beda]">Structure score</p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-6xl font-semibold tracking-tighter">{score}</span>
                        <span className="text-[#ccc6db]">/ 100</span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[#ccc6db]">
                        {score / 20} of 5 essentials detected. Each is worth 20 points.
                      </p>
                      <p className="mt-3 border-t border-white/15 pt-3 text-xs leading-5 text-[#ccc6db]">
                        A heading and email check of the original text, not an ATS rating or a
                        measure of content quality. Text extraction can miss layout details.
                      </p>
                    </div>
                    <div className="panel p-6">
                      <h2 className="font-semibold">What we found</h2>
                      <ul className="mt-5 space-y-5">
                        {resume.assessment.checks.map((check) => (
                          <li key={check.label} className="flex gap-3">
                            {check.passed ? (
                              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#246847]" />
                            ) : (
                              <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-amber-100 text-xs text-amber-800">
                                !
                              </span>
                            )}
                            <div>
                              <h3 className="text-sm font-medium">{check.label}</h3>
                              <p className="mt-1 text-xs leading-5 text-muted">
                                {check.passed ? 'Detected in your resume.' : check.tip}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="min-w-0 space-y-5">
                    <div className="rounded-2xl border border-[#d8cdfa] bg-accent-soft p-6">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={22} className="shrink-0 text-accent" />
                        <div>
                          <h2 className="font-semibold">
                            {editing
                              ? 'You’re editing a separate copy.'
                              : 'Would you like to edit your resume?'}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {editing
                              ? 'Make your changes below. Download when you’re ready, or discard them to restore the original text.'
                              : 'Review the suggestions first. Allow editing to open a text copy you control. We won’t rewrite or add any facts automatically.'}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            {editing ? (
                              <>
                                <button
                                  className="btn-primary"
                                  onClick={() => {
                                    downloadText(
                                      draft,
                                      resume.name.replace(/\.(docx|txt)$/i, '') + '-edited.txt',
                                    )
                                    setNotice(
                                      'Text copy downloaded. Word template formatting is not included yet.',
                                    )
                                  }}
                                >
                                  Download text copy
                                </button>
                                <button
                                  className="btn"
                                  onClick={() => {
                                    setDraft(resume.text)
                                    setEditing(false)
                                    setNotice('Changes discarded. Original text restored.')
                                  }}
                                >
                                  Discard changes
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn-primary"
                                  onClick={() => {
                                    setEditing(true)
                                    setNotice('Editing enabled. Your original file is unchanged.')
                                  }}
                                >
                                  Allow editing <ArrowRight size={15} />
                                </button>
                                <button
                                  className="btn"
                                  onClick={() =>
                                    setNotice(
                                      'Kept read-only. You can allow editing whenever you’re ready.',
                                    )
                                  }
                                >
                                  Keep read-only
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="panel overflow-hidden">
                      <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <h2 className="text-sm font-semibold">
                          {editing ? 'Your editable copy' : 'Extracted resume text'}
                        </h2>
                        <span className="text-xs text-muted">
                          {editing ? 'Unsaved · text only' : 'Read-only'}
                        </span>
                      </div>
                      {editing ? (
                        <div className="p-5">
                          <label htmlFor="resume-copy" className="sr-only">
                            Edit resume text
                          </label>
                          <textarea
                            autoFocus
                            id="resume-copy"
                            className="min-h-[520px] w-full resize-y rounded-lg border border-line bg-white p-4 text-sm leading-7"
                            value={draft}
                            maxLength={100_000}
                            onChange={(e) => setDraft(e.target.value)}
                          />
                        </div>
                      ) : (
                        <pre className="max-h-[620px] overflow-auto p-6 font-sans text-sm leading-7 whitespace-pre-wrap break-words">
                          {resume.text}
                        </pre>
                      )}
                    </div>
                    <p role="status" className="text-sm text-accent">
                      {notice}
                    </p>
                    <p className="text-xs leading-6 text-muted">
                      Next: apply approved text to a professional Word template. For now, downloads
                      contain plain text only.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
        <footer className="mt-14 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
          <span>ResumeForge · A little more clarity. Every bit as you.</span>
          <span>Read first. Edit with permission.</span>
        </footer>
      </main>
    </MotionConfig>
  )
}
