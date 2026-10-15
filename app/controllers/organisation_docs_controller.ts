import { readFileSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'

const DOCS_DIR = 'docs/organisation-api'

function escape(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function page(title: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title>
<style>
:root{color-scheme:light dark;--bg:#fafaf7;--fg:#1c1f1a;--muted:#5f655c;--line:#dad8cf;--code:#f0efe9}
@media (prefers-color-scheme:dark){:root{--bg:#15180f;--fg:#ecebe4;--muted:#a3a899;--line:#353a2e;--code:#1e2219}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,sans-serif}
main{max-width:900px;margin:0 auto;padding:24px 16px 64px}
h1,h2{line-height:1.2} code,pre{font-family:ui-monospace,monospace;font-size:13px;background:var(--code);border-radius:4px}
pre{padding:12px;overflow-x:auto} code{padding:1px 4px} table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);vertical-align:top} .m{font-family:ui-monospace,monospace;font-weight:600}
a{color:inherit}
</style></head><body><main>${body}</main></body></html>`
}

/** Renders the markdown we ship (headings, lists, fenced code, paragraphs). Enough for QUICKSTART. */
function markdownToHtml(markdown: string) {
  const out: string[] = []
  let inCode = false
  let inList = false
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(inCode ? '</pre>' : '<pre>')
      inCode = !inCode
      continue
    }
    if (inCode) {
      out.push(escape(line))
      continue
    }
    if (/^\s*- /.test(line)) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${escape(line.replace(/^\s*- /, '')).replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`)
      continue
    }
    if (inList) { out.push('</ul>'); inList = false }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length + 1
      out.push(`<h${level}>${escape(heading[2])}</h${level}>`)
    } else if (line.trim()) {
      out.push(`<p>${escape(line).replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`)
    }
  }
  if (inList) out.push('</ul>')
  return out.join('\n')
}

/** Lists each operation in the OpenAPI file (method, path, summary). Enough for a reference index. */
function operationsIndex(spec: string) {
  const rows: { method: string; path: string; summary: string }[] = []
  let path = ''
  let method = ''
  for (const line of spec.split('\n')) {
    const p = /^ {2}(\/\S+):\s*$/.exec(line)
    if (p) { path = p[1]; method = ''; continue }
    const m = /^ {4}(get|post|patch|put|delete):\s*$/.exec(line)
    if (m && path) { method = m[1].toUpperCase(); continue }
    const s = /^ {6}summary:\s*(.+)$/.exec(line)
    if (s && method) {
      rows.push({ method, path, summary: s[1].trim() })
      method = ''
    }
  }
  return rows
}

export default class OrganisationDocsController {
  /** GET /docs/api: the reference index, built from the OpenAPI file. */
  api({ response }: HttpContext) {
    const spec = readFileSync(app.makePath(DOCS_DIR, 'openapi.yaml'), 'utf8')
    const rows = operationsIndex(spec)
    const table = rows
      .map((r) => `<tr><td class="m">${r.method}</td><td><code>${escape(r.path)}</code></td><td>${escape(r.summary)}</td></tr>`)
      .join('')
    const body = `<h1>Plenty Value Organisation API</h1>
<p>Version 2026-10-01. Send <code>Authorization: Bearer pv_test_sk_…</code> (or <code>pv_live_sk_…</code>) on every <code>/api/v1/organisations</code> request. JSON only, 64 KB limit. Send <code>Idempotency-Key</code> on POST requests to retry safely.</p>
<p>Errors use <code>{ "error": { "type", "code", "message", "param", "request_id" } }</code>. Start with <a href="/docs/quickstart">the quickstart</a>. The full contract is in <a href="/docs/api/openapi.yaml">openapi.yaml</a>.</p>
<h2>Endpoints</h2>
<table><thead><tr><th>Method</th><th>Path</th><th>Summary</th></tr></thead><tbody>${table}</tbody></table>`
    return response.type('html').send(page('Organisation API reference', body))
  }

  /** GET /docs/api/openapi.yaml: the raw contract. */
  openapi({ response }: HttpContext) {
    return response.type('text/yaml').send(readFileSync(app.makePath(DOCS_DIR, 'openapi.yaml'), 'utf8'))
  }

  /** GET /docs/quickstart: QUICKSTART.md, rendered. */
  quickstart({ response }: HttpContext) {
    const body = markdownToHtml(readFileSync(app.makePath(DOCS_DIR, 'QUICKSTART.md'), 'utf8'))
    return response.type('html').send(page('Organisation API quickstart', body))
  }
}
