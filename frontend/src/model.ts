export type RoleKey = 'backend' | 'fullstack'
export type Decision = 'pending' | 'accepted' | 'skipped'
export type Decisions = readonly [Decision, Decision, Decision]
export type ReviewState = Record<RoleKey, Decisions>
export type ReviewAction =
  | { type: 'decide'; role: RoleKey; index: number; decision: Decision }
  | { type: 'acceptRemaining'; role: RoleKey }
  | { type: 'reset' }
export const original = [
  'Built Python APIs serving 10,000 daily users.',
  'Reduced query latency by 30% with SQL optimization.',
  'Partnered with designers to ship accessible interfaces.',
] as const
export interface Suggestion {
  title: string
  text: string
  reason: string
  gain: number
  tag: string
}
export interface Role {
  company: string
  title: string
  location: string
  description: string
  requirements: string[]
  keywords: string[]
  missing: string
  suggestions: Suggestion[]
}
export const roles: Record<RoleKey, Role> = {
  backend: {
    company: 'Northstar',
    title: 'Backend Engineer',
    location: 'Bengaluru · Hybrid',
    description:
      'Build dependable services for a growing product. Develop Python APIs, improve database performance, and work closely with product and design.',
    requirements: [
      'Python and API development',
      'SQL and query optimization',
      'Cross-functional collaboration',
      'Kubernetes experience is a plus',
    ],
    keywords: ['Python', 'APIs', 'SQL', 'Collaboration'],
    missing: 'Kubernetes',
    suggestions: [
      {
        title: 'Put your scale in the spotlight',
        text: 'Developed Python APIs supporting 10,000 daily users.',
        reason: 'Connects API development with the scale you already delivered.',
        gain: 8,
        tag: 'Role relevance',
      },
      {
        title: 'Lead with measurable impact',
        text: 'Improved database performance through SQL optimization, reducing query latency by 30%.',
        reason: 'Links your existing result directly to database performance.',
        gain: 10,
        tag: 'Impact',
      },
      {
        title: 'Make collaboration count',
        text: 'Collaborated with designers to deliver accessible user interfaces.',
        reason: 'Highlights cross-functional work without adding new experience.',
        gain: 6,
        tag: 'Clarity',
      },
    ],
  },
  fullstack: {
    company: 'Common Ground',
    title: 'Full Stack Engineer',
    location: 'Remote · India',
    description:
      'Build thoughtful tools that connect people. Work across APIs and interfaces, partner with design, and improve product speed and accessibility.',
    requirements: [
      'API development with Python',
      'Accessible user interfaces',
      'SQL optimization',
      'React experience is a plus',
    ],
    keywords: ['Python', 'APIs', 'Accessibility', 'SQL'],
    missing: 'React',
    suggestions: [
      {
        title: 'Connect your work to the product',
        text: 'Developed Python APIs to support a product serving 10,000 daily users.',
        reason: 'Makes the product contribution of your backend work explicit.',
        gain: 8,
        tag: 'Role relevance',
      },
      {
        title: 'Keep the impact measurable',
        text: 'Optimized SQL queries to deliver a 30% reduction in query latency.',
        reason: 'Keeps the original metric and makes the action clear.',
        gain: 7,
        tag: 'Impact',
      },
      {
        title: 'Bring accessibility forward',
        text: 'Delivered accessible user interfaces in partnership with designers.',
        reason: 'Leads with the accessibility this role asks for.',
        gain: 9,
        tag: 'Clarity',
      },
    ],
  },
}
export function initialDecisions(): ReviewState {
  return {
    backend: ['pending', 'pending', 'pending'],
    fullstack: ['pending', 'pending', 'pending'],
  }
}
export function acceptRemaining(decisions: Decisions): Decisions {
  return decisions.map((value) =>
    value === 'pending' ? 'accepted' : value,
  ) as unknown as Decisions
}
export function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  if (action.type === 'reset') return initialDecisions()
  if (action.type === 'acceptRemaining')
    return { ...state, [action.role]: acceptRemaining(state[action.role]) }
  const next: [Decision, Decision, Decision] = [...state[action.role]]
  if (action.index < 0 || action.index >= next.length) return state
  next[action.index] = action.decision
  return { ...state, [action.role]: next }
}
export function selectedBullets(role: RoleKey, decisions: Decisions): string[] {
  return original.map((text, i) =>
    decisions[i] === 'accepted' ? roles[role].suggestions[i].text : text,
  )
}
export function scoreFor(role: RoleKey, decisions: Decisions): number {
  return decisions.reduce(
    (score, value, i) => score + (value === 'accepted' ? roles[role].suggestions[i].gain : 0),
    64,
  )
}
export function texEscape(text: string): string {
  const special: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  }
  return text.replace(/[\\{}$&#%_~^]/g, (char) => special[char] || '\\' + char)
}
export function exportLatex(role: RoleKey, decisions: Decisions): string {
  return [
    '% ResumeForge demo — fictional profile; accepted edits only.',
    '\\documentclass[11pt]{article}',
    '\\usepackage[margin=1in]{geometry}',
    '\\begin{document}',
    '\\begin{center}',
    '\\textbf{\\Large Alex Rivera}\\\\',
    'Software Engineer | Bengaluru, India',
    '\\end{center}',
    '\\section*{Experience}',
    '\\textbf{Software Engineer | Example Studio}',
    '\\begin{itemize}',
    ...selectedBullets(role, decisions).map((text) => '  \\item ' + texEscape(text)),
    '\\end{itemize}',
    '\\section*{Projects}',
    '\\begin{itemize}',
    '  \\item Created an open-source tool to organize job applications.',
    '\\end{itemize}',
    '\\section*{Skills}',
    'Python, FastAPI, SQL, Git, accessibility',
    '\\section*{Education}',
    'Bachelor of Technology, Computer Science',
    '\\end{document}',
    '',
  ].join('\n')
}
export function downloadText(source: string, filename: string) {
  const url = URL.createObjectURL(new Blob([source], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
