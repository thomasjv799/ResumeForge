import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import * as model from './model'

const original =
  'Summary\nExperienced software engineer.\nWork Experience\nBuilt reliable services.\nEducation\nUniversity degree.\nSkills\nPython\nalex@example.com'
function resumeFile() {
  const file = new File([original], 'my-resume.txt', { type: 'text/plain' })
  Object.defineProperty(file, 'arrayBuffer', {
    value: async () => new TextEncoder().encode(original).buffer,
  })
  return file
}

describe('upload and consent flow', () => {
  it('uses uploaded content and requires consent before editing or downloading changes', async () => {
    const user = userEvent.setup()
    const download = vi.spyOn(model, 'downloadText').mockImplementation(() => {})
    render(<App />)
    await user.upload(screen.getByLabelText('Upload resume'), resumeFile())
    expect(await screen.findByText('Structure score', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Download text copy' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Keep read-only' }))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Allow editing' }))
    const editor = screen.getByRole('textbox', { name: 'Edit resume text' })
    expect(editor).toHaveValue(original)
    await user.type(editor, '\nAn approved edit.')
    await user.click(screen.getByRole('button', { name: 'Download text copy' }))
    expect(download).toHaveBeenCalledWith(original + '\nAn approved edit.', 'my-resume-edited.txt')
    await user.click(screen.getByRole('button', { name: 'Discard changes' }))
    await user.click(screen.getByRole('button', { name: 'Allow editing' }))
    expect(screen.getByRole('textbox')).toHaveValue(original)
    download.mockRestore()
  })
  it('ignores a file read that completes after cancellation', async () => {
    const user = userEvent.setup()
    let finish!: (value: ArrayBuffer) => void
    const file = new File([original], 'resume.txt')
    Object.defineProperty(file, 'arrayBuffer', {
      value: () =>
        new Promise<ArrayBuffer>((resolve) => {
          finish = resolve
        }),
    })
    render(<App />)
    await user.upload(screen.getByLabelText('Upload resume'), file)
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    finish(new TextEncoder().encode(original).buffer)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Choose a resume' })).toBeInTheDocument(),
    )
    expect(screen.queryByText('Structure score')).not.toBeInTheDocument()
  })
  it('shows a recoverable error for an unreadable document', async () => {
    const user = userEvent.setup()
    const file = new File(['bad zip'], 'broken.docx')
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => new TextEncoder().encode('bad zip').buffer,
    })
    render(<App />)
    await user.upload(screen.getByLabelText('Upload resume'), file)
    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose a resume' })).toBeInTheDocument()
  })
})
