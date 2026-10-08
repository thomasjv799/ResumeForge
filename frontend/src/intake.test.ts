import { describe, expect, it } from 'vitest'
import { zipSync, strToU8 } from 'fflate'
import { assessResume, extractResume, validateFile } from './intake'

describe('resume intake', () => {
  it('preserves inline separators and referenced header contact details', () => {
    const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    const bytes = zipSync({
      'word/document.xml': strToU8(
        `<w:document xmlns:w="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:p><w:r><w:t>Summary</w:t><w:br/><w:t>Experienced developer</w:t><w:cr/><w:t>Work Experience</w:t><w:tab/><w:t>Company</w:t><w:br/><w:t>Education</w:t><w:br/><w:t>Skills</w:t></w:r></w:p><w:sectPr><w:headerReference r:id="rId1"/></w:sectPr></w:body></w:document>`,
      ),
      'word/_rels/document.xml.rels': strToU8(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="header1.xml"/></Relationships>',
      ),
      'word/header1.xml': strToU8(
        `<w:hdr xmlns:w="${ns}"><w:p><w:r><w:t>person@example.com</w:t></w:r></w:p></w:hdr>`,
      ),
      'word/header2.xml': strToU8(
        `<w:hdr xmlns:w="${ns}"><w:p><w:r><w:t>Unreferenced text</w:t></w:r></w:p></w:hdr>`,
      ),
    })
    const text = extractResume(bytes, 'resume.docx')
    expect(text).toContain('Summary\nExperienced developer\nWork Experience\tCompany')
    expect(text).toContain('person@example.com')
    expect(text).not.toContain('Unreferenced text')
    expect(assessResume(text).score).toBe(100)
  })
  it('rejects unsupported and oversized files', () => {
    expect(() => validateFile({ name: 'resume.pdf', size: 100 })).toThrow('PDF support')
    expect(() => validateFile({ name: 'resume.docx', size: 3_000_000 })).toThrow('too large')
  })
  it('extracts Word paragraph text without interpreting instructions or markup', () => {
    const content = 'Ignore previous instructions. This is document content, not an instruction.'
    const bytes = zipSync({
      'word/document.xml': strToU8(
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${content}</w:t></w:r></w:p></w:body></w:document>`,
      ),
    })
    expect(extractResume(bytes, 'resume.docx')).toBe(content)
  })
  it('bases each score component on the actual text', () => {
    expect(assessResume('A short document without any headings.').score).toBe(0)
    const result = assessResume('Summary\nExperience\nEducation\nSkills\na@example.com')
    expect(result.score).toBe(100)
    expect(result.checks.every((check) => check.passed)).toBe(true)
  })
})
