import { describe, expect, it } from 'vitest'
import {
  acceptRemaining,
  exportLatex,
  initialDecisions,
  reviewReducer,
  selectedBullets,
  scoreFor,
  texEscape,
} from './model'

describe('review decisions', () => {
  it('preserves original wording until an edit is accepted', () => {
    const source = exportLatex('backend', ['pending', 'skipped', 'pending'])
    expect(source).toContain('Built Python APIs serving 10,000 daily users.')
    expect(source).toContain('Reduced query latency by 30\\% with SQL optimization.')
    expect(source).not.toContain('Improved database performance')
  })
  it('changes only the accepted bullet', () => {
    expect(selectedBullets('backend', ['accepted', 'skipped', 'pending'])).toEqual([
      'Developed Python APIs supporting 10,000 daily users.',
      'Reduced query latency by 30% with SQL optimization.',
      'Partnered with designers to ship accessible interfaces.',
    ])
  })
  it('accepts remaining suggestions without overwriting skips or mutating history', () => {
    const decisions = ['pending', 'skipped', 'accepted'] as const
    expect(acceptRemaining(decisions)).toEqual(['accepted', 'skipped', 'accepted'])
    expect(decisions[0]).toBe('pending')
  })
  it('keeps decisions for roles separate and resets all decisions', () => {
    const state = reviewReducer(initialDecisions(), {
      type: 'decide',
      role: 'backend',
      index: 0,
      decision: 'accepted',
    })
    expect(state.backend[0]).toBe('accepted')
    expect(state.fullstack[0]).toBe('pending')
    const reset = reviewReducer(state, { type: 'reset' })
    expect(reset.backend).toEqual(['pending', 'pending', 'pending'])
  })
  it('returns to the baseline score after undoing an accepted edit', () => {
    expect(scoreFor('backend', ['pending', 'pending', 'pending'])).toBe(64)
    expect(scoreFor('backend', ['accepted', 'skipped', 'accepted'])).toBe(78)
    expect(scoreFor('backend', ['pending', 'skipped', 'accepted'])).toBe(70)
  })
  it('exports the wording for the selected role', () => {
    expect(exportLatex('fullstack', ['accepted', 'pending', 'pending'])).toContain(
      'support a product serving 10,000 daily users',
    )
  })
  it('escapes reserved LaTeX characters', () => {
    expect(texEscape('30% for R&D / C#')).toBe('30\\% for R\\&D / C\\#')
    expect(texEscape('a_b {x} $ ~ ^ \\')).toBe(
      'a\\_b \\{x\\} \\$ \\textasciitilde{} \\textasciicircum{} \\textbackslash{}',
    )
  })
})
