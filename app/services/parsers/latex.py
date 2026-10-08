"""Conservative text extraction for common resume LaTeX. Never executes TeX."""
import re
from app.models.resume import ResumeParseResponse, ResumeSection

TOKEN = re.compile(r'\\([A-Za-z]+)\*?|\\(.)', re.DOTALL)
SECTION = re.compile(r'\\(?:section|subsection)\*?\s*(?:\[[^\]]*\])?\s*\{')
BULLET = re.compile(r'\\(?:item|resumeItem)\b\s*(?:\[[^\]]*\])?')
UNSAFE = re.compile(r'\\(?:input|include|includeonly|write|openout|openin|read|immediate|usepackage|documentclass)(?![A-Za-z])')
FORMATTING = {'textbf', 'textit', 'emph', 'underline', 'textrm', 'texttt', 'textsf', 'textsc', 'mbox', 'small', 'large', 'Large', 'huge', 'Huge', 'normalsize', 'bfseries', 'itshape', 'centering', 'raggedright', 'noindent', 'par', 'hfill', 'vfill', 'resumeItem', 'resumeSubheading', 'resumeProjectHeading', 'resumeSubItem', 'resumeItemListStart', 'resumeItemListEnd', 'resumeSubHeadingListStart', 'resumeSubHeadingListEnd'}


def strip_comments(source: str) -> str:
    # Consume escaped pairs first, so \\% starts a comment while \% stays literal.
    return re.sub(r'\\.|%[^\n]*', lambda m: '' if m[0].startswith('%') else m[0], source)


def group(source: str, start: int) -> tuple[str, int]:
    depth = 1
    i = start + 1
    while i < len(source):
        if source[i] == '\\':
            i += 2
            continue
        if source[i] == '{':
            depth += 1
        elif source[i] == '}':
            depth -= 1
            if depth == 0:
                return source[start + 1:i], i + 1
        i += 1
    raise ValueError('Unbalanced brace: check opening and closing braces in your resume.')


def validate_braces(source: str) -> None:
    i = 0
    while i < len(source):
        if source[i] == '\\':
            i += 2
        elif source[i] == '{':
            _, i = group(source, i)
        elif source[i] == '}':
            raise ValueError('Unexpected closing brace in your resume.')
        else:
            i += 1


def plain(source: str, unknown: set[str]) -> str:
    output = []
    i = 0
    while i < len(source):
        match = TOKEN.match(source, i)
        if not match:
            char = source[i]
            output.append(' ' if char in '{}~&' else char)
            i += 1
            continue
        name, symbol = match.groups()
        i = match.end()
        if symbol is not None:
            output.append(' ' if symbol == '\\' else symbol)
            continue
        while i < len(source) and source[i].isspace():
            i += 1
        if name in {'begin', 'end', 'vspace', 'hspace', 'label'}:
            if i < len(source) and source[i] == '{':
                _, i = group(source, i)
            output.append(' ')
        elif name == 'href':
            if i < len(source) and source[i] == '{':
                _, i = group(source, i)  # Keep link label, discard target.
        elif name in {'url', 'textbackslash', 'LaTeX', 'TeX'}:
            if name != 'url':
                output.append({'textbackslash': '\\', 'LaTeX': 'LaTeX', 'TeX': 'TeX'}[name])
        elif name == 'item':
            output.append(' ')
        else:
            if name not in FORMATTING:
                unknown.add(name)
            output.append(' ')
    return re.sub(r'\s+', ' ', ''.join(output)).strip()


def parse_resume(source: str) -> ResumeParseResponse:
    body = strip_comments(source)
    start = re.search(r'\\begin\s*\{document\}', body)
    if start:
        body = body[start.end():]
        end = re.search(r'\\end\s*\{document\}', body)
        if end is None:
            raise ValueError('Missing \\end{document}. Paste the complete document or a section fragment.')
        body = body[:end.start()]
    if UNSAFE.search(body):
        raise ValueError('File access, package loading, and execution commands are not supported in resume content.')
    validate_braces(body)
    headings = list(SECTION.finditer(body))
    if not headings:
        raise ValueError('No sections found. Include a LaTeX section such as \\section{Experience}.')
    unknown: set[str] = set()
    preamble = plain(body[:headings[0].start()], unknown)
    sections = []
    for index, heading in enumerate(headings):
        title, content_start = group(body, heading.end() - 1)
        content_end = headings[index + 1].start() if index + 1 < len(headings) else len(body)
        content = body[content_start:content_end]
        bullets = []
        matches = list(BULLET.finditer(content))
        for bullet_index, match in enumerate(matches):
            stop = matches[bullet_index + 1].start() if bullet_index + 1 < len(matches) else len(content)
            bullet = content[match.end():stop].strip()
            if match.group(0).startswith(r'\resumeItem') and bullet.startswith('{'):
                bullet, _ = group(bullet, 0)
            else:
                bullet = re.split(r'\\end\s*\{|\\resumeItemListEnd\b', bullet)[0]
            text = plain(bullet, unknown)
            if text:
                bullets.append(text)
        sections.append(ResumeSection(title=plain(title, unknown), text=plain(content, unknown), bullets=bullets))
    warnings = []
    if unknown:
        warnings.append('Custom commands were treated as text; review the preview: ' + ', '.join('\\' + name for name in sorted(unknown)))
    if not any(section.text for section in sections):
        raise ValueError('Your sections are empty. Add resume content before parsing.')
    return ResumeParseResponse(source=source, preamble=preamble, sections=sections,
        plain_text='\n\n'.join(filter(None, [preamble] + [s.title + '\n' + s.text for s in sections])), warnings=warnings)
