import { useEffect, useReducer, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Code2,
  FileText,
  Fingerprint,
  Layers2,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import {
  downloadText,
  exportLatex,
  initialDecisions,
  reviewReducer,
  roles,
  scoreFor,
} from './model'
import type { Decision, RoleKey } from './model'
import { ResumePaper, SuggestionCard, Insights } from './Review'
import { Parser } from './Parser'

const parserEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_PARSER === 'true'

export default function App() {
  const [roleKey, setRoleKey] = useState<RoleKey>('backend')
  const [state, dispatch] = useReducer(reviewReducer, undefined, initialDecisions)
  const [mode, setMode] = useState<'studio' | 'parser'>('studio')
  const [previewMode, setPreviewMode] = useState<'preview' | 'source'>('preview')
  const [reviewMode, setReviewMode] = useState<'changes' | 'insights'>('changes')
  const [showOriginal, setShowOriginal] = useState(false)
  const [message, setMessage] = useState('')
  const [dialogType, setDialogType] = useState<'about' | 'job'>('about')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const role = roles[roleKey]
  const decisions = state[roleKey]
  const accepted = decisions.filter((value) => value === 'accepted').length
  const reviewed = decisions.filter((value) => value !== 'pending').length
  const score = scoreFor(roleKey, decisions)
  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(''), 4500)
    return () => clearTimeout(timeout)
  }, [message])
  function openDialog(type: 'about' | 'job') {
    setDialogType(type)
    dialogRef.current?.showModal()
  }
  function decide(index: number, decision: Decision) {
    dispatch({ type: 'decide', role: roleKey, index, decision })
    setMessage(
      decision === 'accepted'
        ? 'Edit accepted. Your preview and export are updated.'
        : decision === 'skipped'
          ? 'Original wording kept.'
          : 'Decision undone. Original wording restored.',
    )
  }
  function reset() {
    dispatch({ type: 'reset' })
    setRoleKey('backend')
    setReviewMode('changes')
    setPreviewMode('preview')
    setShowOriginal(false)
    setMessage('Workspace reset. All original wording restored.')
  }
  function download() {
    downloadText(exportLatex(roleKey, decisions), `alex-rivera-${roleKey}-sample.tex`)
    setMessage('Downloaded your sample resume with accepted edits only.')
  }
  return (
    <MotionConfig reducedMotion="user">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-white focus:p-4"
        href="#main"
      >
        Skip to workspace
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a
            href="#"
            onClick={() => setMode('studio')}
            className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.8px]"
            aria-label="ResumeForge home"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-ink text-white">
              <Layers2 size={21} />
            </span>
            ResumeForge
            <span className="ml-1 hidden rounded border border-line px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-muted sm:block">
              STUDIO
            </span>
          </a>
          <nav aria-label="Main navigation" className="hidden self-stretch sm:flex">
            <button
              onClick={() => setMode('studio')}
              className={`mx-4 border-b-2 px-1 text-sm ${mode === 'studio' ? 'border-accent font-medium' : 'border-transparent text-muted'}`}
            >
              Workspace
            </button>
            {parserEnabled && (
              <button
                onClick={() => setMode('parser')}
                className={`mx-4 border-b-2 px-1 text-sm ${mode === 'parser' ? 'border-accent font-medium' : 'border-transparent text-muted'}`}
              >
                Resume parser
              </button>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[#ddd4ff] bg-[#f7f4ff] px-3 py-1.5 text-[11px] font-medium text-accent md:inline-flex">
              Sample workspace
            </span>
            <button
              className="grid size-10 place-items-center rounded-lg text-muted hover:bg-gray-100"
              aria-label="About this demo"
              onClick={() => openDialog('about')}
            >
              <CircleHelp size={19} />
            </button>
            <span
              className="grid size-9 place-items-center rounded-full border-2 border-white bg-[#e8e1fd] text-xs font-semibold text-[#5c40b0] ring-1 ring-line"
              aria-label="Alex Rivera, fictional profile"
            >
              AR
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1440px] px-4 pt-7 pb-5 sm:px-8 lg:px-12">
        {parserEnabled && (
          <div className="mb-5 flex gap-2 sm:hidden">
            <button className="btn" onClick={() => setMode('studio')}>
              Workspace
            </button>
            <button className="btn" onClick={() => setMode('parser')}>
              Resume parser
            </button>
          </div>
        )}
        {parserEnabled && (
          <div hidden={mode !== 'parser'}>
            <Parser />
          </div>
        )}
        <div hidden={mode !== 'studio'}>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] text-muted">
                <span>YOUR CAREER</span>
                <ChevronRight size={12} />
                <span className="font-medium text-accent">RESUME STUDIO</span>
              </div>
              <h1 className="text-[30px] font-semibold tracking-[-1.4px] sm:text-[37px]">
                Your experience. <span className="text-accent">Better expressed.</span>
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                A little more relevant. Every bit as you.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn !px-3" aria-label="Reset demo" onClick={reset}>
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button className="btn-primary" onClick={download}>
                <ArrowDownToLine size={16} />
                Export resume
                <ArrowUpRight className="ml-1" size={14} />
              </button>
            </div>
          </div>
          <section
            className="panel mb-7 grid overflow-hidden md:grid-cols-[1fr_auto_1.2fr]"
            aria-label="Resume and target opportunity"
          >
            <div className="flex items-center gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f1eefb] text-accent">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <p className="eyebrow text-muted">Your starting point</p>
                <h2 className="mt-1.5 truncate text-sm font-medium">alex_rivera_resume.tex</h2>
                <p className="mt-1 text-xs text-muted">
                  LaTeX <span className="px-1.5">·</span> 4 sections{' '}
                  <span className="px-1.5">·</span> Fictional sample
                </p>
              </div>
              <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-[#edf6f1] px-2.5 py-1 text-[10px] font-medium text-[#246847] lg:flex">
                <Check size={12} />
                Ready
              </span>
            </div>
            <div className="hidden items-center px-5 text-gray-400 md:flex">
              <ArrowRight size={20} />
            </div>
            <div className="flex items-center gap-4 border-t border-line p-5 md:border-t-0">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#232332] text-white">
                <span className="text-2xl font-light">
                  {roleKey === 'backend' ? 'n' : 'c'}
                  <span className="text-[#b5a0ff]">.</span>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor="role" className="eyebrow text-muted">
                  Your next opportunity
                </label>
                <select
                  id="role"
                  className="mt-1 block w-full max-w-full truncate bg-transparent py-1 text-sm font-medium"
                  value={roleKey}
                  onChange={(event) => {
                    setRoleKey(event.target.value as RoleKey)
                    setMessage('Sample role changed. Decisions are saved separately for each role.')
                  }}
                >
                  <option value="backend">Backend Engineer · Northstar</option>
                  <option value="fullstack">Full Stack Engineer · Common Ground</option>
                </select>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <MapPin size={11} />
                  {role.location}
                </p>
              </div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-gray-100"
                aria-label="View sample job"
                onClick={() => openDialog('job')}
              >
                <ArrowUpRight size={18} />
              </button>
            </div>
          </section>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]">
            <section
              className="order-2 min-w-0 lg:order-1 lg:sticky lg:top-6"
              aria-label="Resume document"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FileText size={16} className="text-muted" />
                  Your resume
                </h2>
                <span className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="size-1.5 rounded-full bg-accent" />
                  Updates with accepted edits
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#dddde7] bg-[#eaeaf0]">
                <div className="flex items-center justify-between border-b border-[#dcdce5] bg-[#f3f3f7] px-4 py-2">
                  <div className="flex gap-1" aria-label="Document view">
                    {(['preview', 'source'] as const).map((item) => (
                      <button
                        key={item}
                        aria-pressed={previewMode === item}
                        onClick={() => setPreviewMode(item)}
                        className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium ${previewMode === item ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white/50'}`}
                      >
                        {item === 'preview' ? <FileText size={14} /> : <Code2 size={14} />}{' '}
                        {item === 'preview' ? 'Preview' : 'LaTeX'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    aria-pressed={showOriginal}
                    className="flex min-h-10 items-center gap-2 rounded-md px-2 text-[11px] font-medium text-muted hover:bg-white/50"
                  >
                    <span
                      className={`relative h-4 w-7 rounded-full transition-colors ${showOriginal ? 'bg-accent' : 'bg-[#c9c9d5]'}`}
                    >
                      <span
                        className={`absolute top-0.5 size-3 rounded-full bg-white transition-transform ${showOriginal ? 'translate-x-3.5' : 'translate-x-0.5'}`}
                      />
                    </span>
                    Original
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  {previewMode === 'preview' ? (
                    <ResumePaper
                      roleKey={roleKey}
                      decisions={decisions}
                      showOriginal={showOriginal}
                    />
                  ) : (
                    <pre
                      aria-label="LaTeX source"
                      className="min-h-[575px] overflow-auto rounded-lg bg-[#242333] p-5 font-mono text-[11px] leading-6 whitespace-pre-wrap break-words text-[#d5cef3]"
                    >
                      {exportLatex(
                        roleKey,
                        showOriginal ? ['pending', 'pending', 'pending'] : decisions,
                      )}
                    </pre>
                  )}
                </div>
                <div className="flex items-center justify-between px-5 pb-4 text-[10px] text-muted">
                  <span>
                    {showOriginal
                      ? 'Original source'
                      : `${accepted} accepted edit${accepted === 1 ? '' : 's'}`}
                  </span>
                  <span>Text preview · Not a PDF rendering</span>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 px-1 text-xs leading-6 text-muted">
                <ShieldCheck className="mt-1 shrink-0 text-accent" size={15} />
                <p>Your facts stay yours. Only the wording changes.</p>
              </div>
            </section>
            <section className="order-1 min-w-0 lg:order-2" aria-label="Review suggestions">
              <div className="mb-5 overflow-hidden rounded-xl bg-[#252334] text-white">
                <div className="flex items-center justify-between gap-5 px-6 py-5">
                  <div>
                    <p className="eyebrow text-[#c7beda]">Alignment snapshot</p>
                    <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
                      <span
                        className="text-4xl font-semibold tracking-[-2px]"
                        aria-label={`Illustrative score ${score}`}
                      >
                        {score}
                      </span>
                      <span className="text-sm text-[#bcb7ce]">/ 100</span>
                      <span className="ml-2 rounded-full bg-[#b8a4ff]/15 px-2.5 py-1 text-xs font-medium text-[#d7caff]">
                        {score > 64 ? `+${score - 64} from edits` : 'Before review'}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#c4bed4]">
                      Illustrative demo score. Not an ATS assessment.
                    </p>
                  </div>
                  <div className="relative grid size-24 shrink-0 place-items-center">
                    <svg
                      className="absolute inset-0 -rotate-90"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                    >
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#454052" strokeWidth="5" />
                      <motion.circle
                        initial={false}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#b5a0ff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="251.33"
                        animate={{ strokeDashoffset: 251.33 * (1 - score / 100) }}
                        transition={{ duration: 0.4 }}
                      />
                    </svg>
                    <Sparkles className="text-[#c4b3ff]" size={27} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-3 text-[11px] text-[#cdc7de]">
                  <span>3 opportunities to sharpen your story</span>
                  <span className="text-[#d1c1ff]">Up to 88 with all edits</span>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="flex gap-1 rounded-lg border border-line bg-[#ebebf1] p-1"
                  aria-label="Review view"
                >
                  <button
                    aria-pressed={reviewMode === 'changes'}
                    onClick={() => setReviewMode('changes')}
                    className={`min-h-10 rounded-md px-3 text-xs font-medium ${reviewMode === 'changes' ? 'bg-white shadow-sm' : 'text-muted'}`}
                  >
                    Suggested edits{' '}
                    <span className="ml-1.5 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] text-accent">
                      3
                    </span>
                  </button>
                  <button
                    aria-pressed={reviewMode === 'insights'}
                    onClick={() => setReviewMode('insights')}
                    className={`min-h-10 rounded-md px-3 text-xs font-medium ${reviewMode === 'insights' ? 'bg-white shadow-sm' : 'text-muted'}`}
                  >
                    Role insights
                  </button>
                </div>
                <button
                  disabled={reviewed === 3}
                  className="flex min-h-10 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-accent hover:bg-accent-soft"
                  onClick={() => {
                    dispatch({ type: 'acceptRemaining', role: roleKey })
                    setMessage(
                      'Remaining edits accepted. Skipped suggestions keep the original wording.',
                    )
                  }}
                >
                  <CheckCheck size={15} />
                  Accept remaining
                </button>
              </div>
              {reviewMode === 'changes' ? (
                <div className="space-y-4">
                  {role.suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={`${roleKey}-${index}`}
                      suggestion={suggestion}
                      index={index}
                      decision={decisions[index]}
                      onDecide={decide}
                    />
                  ))}
                </div>
              ) : (
                <Insights role={role} />
              )}
              <div className="mt-5 flex items-center gap-3 px-1">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e2ee]">
                  <motion.div
                    className="h-full bg-accent"
                    animate={{ width: `${(reviewed / 3) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-xs text-muted" aria-live="polite">
                  {reviewed} of 3 reviewed
                </p>
              </div>
            </section>
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-line pt-5 text-xs text-muted sm:flex-row">
            <p className="flex items-center gap-2">
              <Fingerprint size={16} />
              Fictional profile. Sample suggestions. Real interactions.
            </p>
            <button
              className="flex min-h-10 items-center gap-1 font-medium hover:text-accent"
              onClick={() => openDialog('about')}
            >
              About this workspace
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </main>
      <AnimatePresence>
        {message && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed right-4 bottom-5 left-4 z-40 mx-auto flex w-fit max-w-[min(90vw,520px)] items-center gap-3 rounded-xl border border-white/10 bg-ink px-5 py-4 text-sm leading-6 text-white shadow-xl"
          >
            <Check className="shrink-0 text-[#bfaaff]" size={18} />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto w-[calc(100%-32px)] max-w-lg rounded-2xl border border-line bg-white p-7 text-ink shadow-2xl"
        aria-labelledby="dialog-title"
      >
        <button
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-lg text-muted hover:bg-gray-100"
          aria-label="Close dialog"
          onClick={() => dialogRef.current?.close()}
        >
          <X size={19} />
        </button>
        <div className="mb-5 grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
          {dialogType === 'job' ? <Target size={23} /> : <Braces size={23} />}
        </div>
        <p className="eyebrow text-accent">
          {dialogType === 'job' ? 'Fictional sample job' : 'Interactive prototype'}
        </p>
        <h2 id="dialog-title" className="mt-3 mb-4 text-2xl font-semibold tracking-tight">
          {dialogType === 'job'
            ? `${role.title} at ${role.company}`
            : 'A workspace for your next chapter.'}
        </h2>
        {dialogType === 'job' ? (
          <>
            <p className="text-sm leading-7 text-muted">{role.description}</p>
            <ul className="mt-5 space-y-3">
              {role.requirements.map((requirement) => (
                <li key={requirement} className="flex items-center gap-2 text-sm">
                  <Check size={15} className="text-accent" />
                  {requirement}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="space-y-4 text-sm leading-7 text-muted">
            <p>
              Compare suggestions, keep the ones you like, and export your reviewed LaTeX resume.
              Decisions are kept separately for each sample role until you reload or reset.
            </p>
            <p>
              Alex and both jobs are fictional. Suggestions and scores are illustrative; this demo
              doesn’t call AI, upload resumes, scrape jobs, or compile PDFs.
            </p>
            <p>
              The local app also includes a working LaTeX resume parser. Accepted edits are the only
              changes included in your export.
            </p>
          </div>
        )}
      </dialog>
    </MotionConfig>
  )
}
