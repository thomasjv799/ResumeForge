import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './SampleStudio'
import * as model from './model'

describe('resume review workspace', () => {
  it('preserves pasted source when navigating away from the parser', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: 'Resume parser' })[0])
    await user.type(screen.getByLabelText('LaTeX source'), 'My unfinished resume')
    await user.click(screen.getAllByRole('button', { name: 'Workspace' })[0])
    await user.click(screen.getAllByRole('button', { name: 'Resume parser' })[0])
    expect(screen.getByLabelText('LaTeX source')).toHaveValue('My unfinished resume')
  })
  it('updates the preview and keeps keyboard focus when accepting and undoing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Accept suggestion 1' }))
    const preview = screen.getByRole('article', { name: 'Resume preview' })
    expect(within(preview).getByText(/Developed Python APIs supporting/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo suggestion 1' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Undo suggestion 1' }))
    expect(within(preview).getByText(/Built Python APIs serving/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept suggestion 1' })).toHaveFocus()
  })
  it('exports accepted changes and preserves skipped wording', async () => {
    const user = userEvent.setup()
    const download = vi.spyOn(model, 'downloadText').mockImplementation(() => {})
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Skip suggestion 2' }))
    await user.click(screen.getByRole('button', { name: 'Accept remaining' }))
    expect(screen.getByRole('button', { name: 'Accept remaining' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Export resume' }))
    expect(download).toHaveBeenCalledWith(
      expect.stringContaining('Developed Python APIs supporting 10,000 daily users.'),
      'alex-rivera-backend-sample.tex',
    )
    expect(download.mock.calls[0][0]).toContain(
      'Reduced query latency by 30\\% with SQL optimization.',
    )
    expect(download.mock.calls[0][0]).not.toContain('Improved database performance')
    download.mockRestore()
  })
  it('keeps decisions per role and resets the whole workspace', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Accept suggestion 1' }))
    await user.selectOptions(screen.getByLabelText('Your next opportunity'), 'fullstack')
    expect(screen.getByRole('button', { name: 'Accept suggestion 1' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Your next opportunity'), 'backend')
    expect(screen.getByRole('button', { name: 'Undo suggestion 1' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    expect(screen.getByRole('button', { name: 'Accept suggestion 1' })).toBeInTheDocument()
    expect(screen.getByText('0 of 3 reviewed')).toBeInTheDocument()
  })
  it('switches between accepted and original LaTeX without discarding decisions', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Accept suggestion 1' }))
    await user.click(screen.getByRole('button', { name: 'LaTeX' }))
    expect(
      within(screen.getByRole('region', { name: 'Resume document' })).getByLabelText(
        'LaTeX source',
      ),
    ).toHaveTextContent('Developed Python APIs supporting')
    await user.click(screen.getByRole('button', { name: 'Original' }))
    expect(
      within(screen.getByRole('region', { name: 'Resume document' })).getByLabelText(
        'LaTeX source',
      ),
    ).toHaveTextContent('Built Python APIs serving')
    expect(screen.getByRole('button', { name: 'Undo suggestion 1' })).toBeInTheDocument()
  })
})
