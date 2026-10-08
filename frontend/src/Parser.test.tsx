import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { Parser } from './Parser'

afterEach(() => vi.unstubAllGlobals())
it('clears a previous preview after the source changes', async () => {
  const user = userEvent.setup()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: 'source',
        preamble: 'Alex',
        sections: [{ title: 'Skills', text: 'Python', bullets: [] }],
        warnings: [],
      }),
    }),
  )
  render(<Parser />)
  await user.click(screen.getByRole('button', { name: 'Load example' }))
  await user.click(screen.getByRole('button', { name: 'Preview resume' }))
  expect(await screen.findByText('1 sections found')).toBeInTheDocument()
  await user.type(screen.getByLabelText('LaTeX source'), ' modified')
  expect(screen.queryByText('1 sections found')).not.toBeInTheDocument()
})
it('ignores a stale server response after the source is edited', async () => {
  const user = userEvent.setup()
  let resolve: (value: unknown) => void = () => {}
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    ),
  )
  render(<Parser />)
  await user.click(screen.getByRole('button', { name: 'Load example' }))
  await user.click(screen.getByRole('button', { name: 'Preview resume' }))
  await user.clear(screen.getByLabelText('LaTeX source'))
  resolve({
    ok: true,
    json: async () => ({
      source: 'old',
      preamble: 'Old resume',
      sections: [{ title: 'Skills', text: 'Old', bullets: [] }],
      warnings: [],
    }),
  })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Preview resume' })).toBeEnabled())
  expect(screen.queryByText('Old resume')).not.toBeInTheDocument()
})
it('shows validation errors without rendering an old result', async () => {
  const user = userEvent.setup()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Unbalanced brace: check your resume.' }),
    }),
  )
  render(<Parser />)
  await user.type(screen.getByLabelText('LaTeX source'), 'invalid latex')
  await user.click(screen.getByRole('button', { name: 'Preview resume' }))
  expect(await screen.findByText('Unbalanced brace: check your resume.')).toBeInTheDocument()
})
