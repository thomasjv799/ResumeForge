import { unzipSync, strFromU8 } from 'fflate'

export const MAX_FILE_SIZE = 2 * 1024 * 1024

export function validateFile(file: Pick<File, 'size' | 'name'>) {
  if (!/\.(docx|txt)$/i.test(file.name))
    throw new Error(
      'Choose a Word (.docx) or plain text (.txt) resume. PDF support is coming next.',
    )
  if (file.size > MAX_FILE_SIZE)
    throw new Error('This file is too large. Choose a resume under 2 MB.')
  if (!file.size) throw new Error('This file is empty. Choose a resume with text.')
}

export function extractResume(bytes: Uint8Array, name: string): string {
  let text: string
  if (/\.docx$/i.test(name)) {
    let expandedSize = 0
    const files = unzipSync(bytes, {
      filter: (entry) => {
        if (
          !/^word\/(document\.xml|_rels\/document\.xml\.rels|(?:header|footer)[^/]*\.xml)$/.test(
            entry.name,
          )
        )
          return false
        expandedSize += entry.originalSize
        if (expandedSize > 4 * 1024 * 1024)
          throw new Error('The document contains too much text. Try a smaller file.')
        return true
      },
    })
    if (!files['word/document.xml']) throw new Error('This file is not a readable Word document.')
    const xml = new DOMParser().parseFromString(
      strFromU8(files['word/document.xml']),
      'application/xml',
    )
    if (xml.getElementsByTagName('parsererror').length)
      throw new Error('The Word document appears damaged.')
    const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    const paragraphs = (doc: Document) =>
      Array.from(doc.getElementsByTagNameNS(ns, 'p'))
        .map((p) =>
          Array.from(p.getElementsByTagNameNS(ns, '*'))
            .map((node) => {
              if (node.localName === 't') return node.textContent
              if (node.localName === 'tab') return '\t'
              if (node.localName === 'br' || node.localName === 'cr') return '\n'
              return ''
            })
            .join(''),
        )
        .join('\n')
    const relationNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    const referenced = new Set(
      [
        ...Array.from(xml.getElementsByTagNameNS(ns, 'headerReference')),
        ...Array.from(xml.getElementsByTagNameNS(ns, 'footerReference')),
      ].map((node) => node.getAttributeNS(relationNS, 'id')),
    )
    const headers: string[] = []
    const footers: string[] = []
    const relationships = files['word/_rels/document.xml.rels']
    if (relationships) {
      const relDoc = new DOMParser().parseFromString(strFromU8(relationships), 'application/xml')
      for (const relation of Array.from(relDoc.getElementsByTagName('Relationship'))) {
        if (
          !referenced.has(relation.getAttribute('Id')) ||
          relation.getAttribute('TargetMode') === 'External'
        )
          continue
        const target = relation.getAttribute('Target') ?? ''
        if (!/^(header|footer)[^/]*\.xml$/.test(target)) continue
        const part = files[`word/${target}`]
        if (!part) continue
        const partDoc = new DOMParser().parseFromString(strFromU8(part), 'application/xml')
        if (partDoc.getElementsByTagName('parsererror').length)
          throw new Error('The Word document appears damaged.')
        const content = paragraphs(partDoc)
        const collection = target.startsWith('header') ? headers : footers
        if (!collection.includes(content)) collection.push(content)
      }
    }
    text = [...headers, paragraphs(xml), ...footers].join('\n')
  } else {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  }
  text = text.trim()
  if (text.length < 40)
    throw new Error(
      'We could not find enough resume text. Try a text-based Word document or a UTF-8 text file.',
    )
  if (text.length > 100_000)
    throw new Error('This resume has too much text. Please keep it under 100,000 characters.')
  return text
}

export function assessResume(text: string) {
  const checks = [
    {
      label: 'Contact details',
      passed: /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text),
      tip: 'Include an email address so employers can contact you.',
    },
    {
      label: 'Professional overview',
      passed: /\b(summary|profile|overview|objective)\b/i.test(text),
      tip: 'Add a brief professional overview that describes your experience and focus.',
    },
    {
      label: 'Work experience',
      passed: /\b(experience|employment|work history)\b/i.test(text),
      tip: 'Use a clear Work Experience heading to organise your roles.',
    },
    {
      label: 'Education',
      passed: /\beducation\b/i.test(text),
      tip: 'Add an Education section with your qualifications.',
    },
    {
      label: 'Skills',
      passed: /\b(skills|competencies|expertise)\b/i.test(text),
      tip: 'List relevant skills you can support with experience.',
    },
  ]
  return {
    checks,
    score: checks.filter((check) => check.passed).length * 20,
    words: text.split(/\s+/).length,
  }
}
