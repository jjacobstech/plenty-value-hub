import { DateTime } from 'luxon'
import User from '#models/user'
import { BASE } from '#tests/helpers/partner_api'

export const PASSWORD = 'Portal-test-pass-1'

function decodeHtml(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

/** Creates a verified, active account that can sign in. Delete the returned user to clean up. */
export async function makeUser(role: 'vendor' | 'admin' = 'vendor') {
  const email = `portal_${crypto.randomUUID().slice(0, 8)}@example.com`
  return User.create({ email, password: PASSWORD, fullName: 'Portal Tester', role, status: 'active', emailVerifiedAt: DateTime.now() })
}

/**
 * A cookie-carrying client for the real web app. It signs in through /login (with the CSRF
 * token from the cookie) and sends the session cookie on later requests.
 */
export class PortalClient {
  private cookies = new Map<string, string>()

  private absorb(response: Response) {
    for (const raw of response.headers.getSetCookie()) {
      const [pair] = raw.split(';')
      const index = pair.indexOf('=')
      this.cookies.set(pair.slice(0, index), pair.slice(index + 1))
    }
  }

  private header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ')
  }

  private xsrf() {
    const token = this.cookies.get('XSRF-TOKEN')
    return token ? decodeURIComponent(token) : ''
  }

  async login(email: string, password: string) {
    const page = await fetch(`${BASE}/auth/login`, { redirect: "manual" })
    this.absorb(page)
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      redirect: 'manual',
      headers: { cookie: this.header(), 'content-type': 'application/x-www-form-urlencoded', 'x-xsrf-token': this.xsrf() },
      body: new URLSearchParams({ email, password }),
    })
    this.absorb(res)
    return res.status
  }

  /**
   * A page request, the way a browser makes it. The Inertia page data is read from the HTML
   * (`data-page`), so no Inertia version header is needed. `body` is sent as a form.
   */
  async inertia(method: 'GET' | 'POST', path: string, body?: Record<string, string>) {
    const headers: Record<string, string> = { cookie: this.header(), accept: 'text/html', 'x-xsrf-token': this.xsrf() }
    const init: RequestInit = { method, redirect: 'manual', headers }
    if (body) {
      headers['content-type'] = 'application/x-www-form-urlencoded'
      init.body = new URLSearchParams(body)
    }
    const res = await fetch(`${BASE}${path}`, init)
    this.absorb(res)
    const html = await res.text()
    const match = /data-page="([^"]*)"/.exec(html)
    const json = match ? JSON.parse(decodeHtml(match[1])) : null
    return { status: res.status, location: res.headers.get('location'), json: json ? { component: json.component, props: json.props } : null }
  }

  /** Plain navigation, for redirects and HTML responses. */
  async get(path: string) {
    const res = await fetch(`${BASE}${path}`, { redirect: 'manual', headers: { cookie: this.header() } })
    this.absorb(res)
    return { status: res.status, location: res.headers.get('location') }
  }
}
