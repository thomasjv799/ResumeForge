import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
SOURCE = r"""\documentclass{article}
\newcommand{\resumeItem}[1]{\item{#1}}
\begin{document}
\textbf{Alex Rivera}
\section{Experience}
\begin{itemize}
\item Built \textbf{Python} services and cut latency by 30\%. % private comment
\resumeItem{Shipped \href{https://example.com}{accessible tools} for R\&D.}
\end{itemize}
\section*{Skills}
Python, SQL, C\#
\end{document}"""


def parse(source=SOURCE):
    return client.post('/api/v1/resume/parse', json={'source': source})


def test_extracts_sections_and_nested_bullets_without_preamble():
    response = parse()
    assert response.status_code == 200
    data = response.json()
    assert data['source'] == SOURCE
    assert [s['title'] for s in data['sections']] == ['Experience', 'Skills']
    assert data['sections'][0]['bullets'] == [
        'Built Python services and cut latency by 30%.',
        'Shipped accessible tools for R&D.',
    ]
    assert data['sections'][1]['text'] == 'Python, SQL, C#'
    assert data['preamble'] == 'Alex Rivera'
    assert 'private comment' not in data['plain_text']
    assert '#1' not in data['plain_text']


@pytest.mark.parametrize('source', ['', '   ', '% just a comment', 'not a latex resume'])
def test_rejects_empty_or_non_latex_input(source):
    assert parse(source).status_code == 422


def test_limits_input_size():
    assert parse('x' * 200001).status_code == 422


def test_unbalanced_braces_produce_actionable_error():
    response = parse(r'\section{Experience}\item Built \textbf{tools')
    assert response.status_code == 422
    assert 'brace' in response.json()['detail'].lower()


def test_never_executes_file_or_shell_commands():
    response = parse(r'\section{Skills}Python\input{/etc/passwd}\write18{touch /tmp/oops}')
    assert response.status_code == 422
    assert 'command' in response.json()['detail'].lower()


def test_accepts_fragments_and_warns_about_custom_commands():
    response = parse(r'\section{Work}\customHeading{Engineer}{2024}\resumeItem{Built APIs.}')
    assert response.status_code == 200
    assert response.json()['sections'][0]['bullets'] == ['Built APIs.']
    assert response.json()['warnings']


def test_escaped_braces_and_optional_item_labels():
    response = parse(r'\section{Projects}\item[API] Supports \{JSON\} payloads.')
    assert response.status_code == 200
    assert response.json()['sections'][0]['bullets'] == ['Supports {JSON} payloads.']


def test_workbench_is_available():
    response = client.get('/')
    assert response.status_code == 200
    assert 'ResumeForge' in response.text


def test_health_still_works():
    assert client.get('/health').json() == {'status': 'ok'}


@pytest.mark.parametrize('command', [r'\write18{echo hi}', r'\openout1=file', r'\read0 to \data'])
def test_rejects_numbered_io_commands(command):
    response = parse(r'\section{Skills}Python ' + command)
    assert response.status_code == 422
    assert 'command' in response.json()['detail'].lower()


def test_demo_and_its_assets_are_served():
    import re
    response = client.get('/demo/')
    assert response.status_code == 200
    script = re.search(r'src="\./(assets/[^\"]+\.js)"', response.text)
    assert script is not None
    assert client.get('/' + script.group(1)).status_code == 200


def test_missing_document_end_is_actionable():
    response = parse(r'\begin{document}\section{Skills}Python')
    assert response.status_code == 422
    assert 'Missing' in response.json()['detail']


def test_item_keeps_text_after_leading_group():
    response = parse(r'\section{Experience}\begin{itemize}\item {Built Python APIs} serving 10,000 users.\end{itemize}')
    assert response.status_code == 200
    assert response.json()['sections'][0]['bullets'] == ['Built Python APIs serving 10,000 users.']
