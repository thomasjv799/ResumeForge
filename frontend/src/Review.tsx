import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Check, CircleHelp, Minus, Plus, Target, Undo2 } from 'lucide-react'
import { original, selectedBullets } from './model'
import type { Decision, Decisions, Role, RoleKey, Suggestion } from './model'

export function ResumePaper({
  roleKey,
  decisions,
  showOriginal,
}: {
  roleKey: RoleKey
  decisions: Decisions
  showOriginal: boolean
}) {
  const bullets = showOriginal ? original : selectedBullets(roleKey, decisions)
  return (
    <article
      aria-label="Resume preview"
      className="mx-auto min-h-[575px] max-w-[490px] bg-white p-6 shadow-[0_8px_30px_#24213b0a] sm:p-9"
    >
      <div className="border-b-2 border-ink pb-5">
        <h2 className="text-[26px] font-semibold tracking-[-1.3px]">
          Alex Rivera<span className="text-accent">.</span>
        </h2>
        <p className="mt-1 text-sm text-muted">Software Engineer</p>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          <span>Bengaluru, India</span>
          <span>alex@example.com</span>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="eyebrow mb-3">Experience</h3>
        <div className="mb-3 flex items-center justify-between gap-2 text-xs">
          <strong className="font-semibold">Software Engineer</strong>
          <span className="text-muted">Example Studio</span>
        </div>
        <ul className="space-y-3 text-xs leading-[1.85]">
          {bullets.map((text, index) => (
            <li
              key={index}
              className={`relative -mx-2 rounded-md px-2 py-1 pl-5 transition-colors ${!showOriginal && decisions[index] === 'accepted' ? 'bg-accent-soft' : ''}`}
            >
              <span className="absolute left-2 top-[13px] size-1 rounded-full bg-accent" />
              {text}
              {!showOriginal && decisions[index] === 'accepted' && (
                <span className="sr-only"> Accepted edit.</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <section className="mt-6 border-t border-line pt-5">
        <h3 className="eyebrow mb-3">Selected project</h3>
        <h4 className="text-xs font-semibold">Application organizer</h4>
        <p className="mt-2 text-xs leading-[1.85]">
          Created an open-source tool to organize job applications.
        </p>
      </section>
      <section className="mt-6 border-t border-line pt-5">
        <h3 className="eyebrow mb-3">Technical skills</h3>
        <div className="flex flex-wrap gap-1.5">
          {['Python', 'FastAPI', 'SQL', 'Git', 'Accessibility'].map((skill) => (
            <span key={skill} className="rounded bg-[#f5f5f8] px-2 py-1 text-[10px] text-muted">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section className="mt-6 border-t border-line pt-5">
        <h3 className="eyebrow mb-3">Education</h3>
        <p className="text-xs font-medium">Bachelor of Technology</p>
        <p className="mt-1 text-xs text-muted">Computer Science</p>
      </section>
    </article>
  )
}

export function SuggestionCard({
  suggestion,
  index,
  decision,
  onDecide,
}: {
  suggestion: Suggestion
  index: number
  decision: Decision
  onDecide: (index: number, decision: Decision) => void
}) {
  const undoRef = useRef<HTMLButtonElement>(null)
  const acceptRef = useRef<HTMLButtonElement>(null)
  const focusNext = useRef(false)
  useEffect(() => {
    if (focusNext.current) {
      ;(decision === 'pending' ? acceptRef.current : undoRef.current)?.focus()
      focusNext.current = false
    }
  }, [decision])
  function decide(value: Decision) {
    focusNext.current = true
    onDecide(index, value)
  }
  return (
    <motion.article
      layout="position"
      transition={{ duration: 0.18 }}
      className={`panel overflow-hidden ${decision === 'accepted' ? 'border-accent/30' : ''}`}
      aria-label={`Suggestion ${index + 1}`}
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-md text-xs font-medium ${decision === 'accepted' ? 'bg-accent text-white' : 'bg-[#f3f2f8] text-muted'}`}
        >
          {decision === 'accepted' ? <Check size={14} /> : String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold tracking-[-.2px]">{suggestion.title}</h3>
          <p className="mt-1 text-[11px] text-muted">
            Experience <span className="px-1">/</span> {suggestion.tag}
          </p>
        </div>
        {decision !== 'pending' && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${decision === 'accepted' ? 'bg-accent-soft text-accent' : 'bg-gray-100 text-muted'}`}
          >
            {decision === 'accepted' ? 'Accepted' : 'Original kept'}
          </span>
        )}
      </div>
      <div className="mx-5 my-4 overflow-hidden rounded-lg border border-line text-base leading-7 sm:text-sm sm:leading-6">
        <div className="flex gap-3 bg-[#fafafb] px-3 py-3 text-muted">
          <Minus className="mt-1 shrink-0 text-gray-400" size={14} />
          <p>{original[index]}</p>
        </div>
        <div
          className={`flex gap-3 border-t border-[#e4ddfd] bg-accent-soft px-3 py-3 text-[#493687] ${decision === 'skipped' ? 'saturate-0' : ''}`}
        >
          <Plus className="mt-1 shrink-0" size={14} />
          <p>{suggestion.text}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <p className="max-w-[280px] text-xs leading-5 text-muted">{suggestion.reason}</p>
        <div className="ml-auto flex gap-2">
          {decision === 'pending' ? (
            <>
              <button
                className="min-h-10 rounded-md px-3 text-xs font-medium text-muted hover:bg-gray-100"
                aria-label={`Skip suggestion ${index + 1}`}
                onClick={() => decide('skipped')}
              >
                Skip
              </button>
              <button
                ref={acceptRef}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-accent/25 bg-white px-3 text-xs font-semibold text-accent hover:bg-accent-soft"
                aria-label={`Accept suggestion ${index + 1}`}
                onClick={() => decide('accepted')}
              >
                <Check size={14} />
                Accept edit
              </button>
            </>
          ) : (
            <button
              ref={undoRef}
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-xs text-muted hover:bg-gray-100"
              aria-label={`Undo suggestion ${index + 1}`}
              onClick={() => decide('pending')}
            >
              <Undo2 size={14} />
              Undo
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export function Insights({ role }: { role: Role }) {
  return (
    <section className="panel p-6">
      <div className="mb-5 flex items-center gap-2">
        <Target size={18} className="text-accent" />
        <h3 className="font-semibold">What this role is looking for</h3>
      </div>
      <p className="text-sm leading-7 text-muted">{role.description}</p>
      <h4 className="eyebrow mt-7 mb-3 text-muted">Already in your experience</h4>
      <div className="flex flex-wrap gap-2">
        {role.keywords.map((keyword) => (
          <span
            key={keyword}
            className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm"
          >
            <Check size={14} className="text-accent" />
            {keyword}
          </span>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <CircleHelp size={16} />A gap worth considering
        </h4>
        <p className="mt-2 text-sm leading-7 text-amber-900">
          {role.missing} isn’t in the sample resume. Add it only if you have that experience.
        </p>
      </div>
      <p className="mt-5 text-xs leading-6 text-muted">
        This is a fictional job. Suggested wording uses only the sample resume’s existing
        experience.
      </p>
    </section>
  )
}
