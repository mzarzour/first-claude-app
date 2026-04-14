import { useState } from 'react'

// SHA-256 hashes of 'dealer' and 'evolv2024' — never store plaintext credentials in source
const CRED_HASH_USER = '8e321a4f4fcdcbe581abd4a400c61da2ca45a44519689ae9b9458673b24409e0'
const CRED_HASH_PASS = 'ad9481046ecc5c11caf350409d1ea3b8c89e2b697864974a1716e90fc01fbf62'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Login({ onLogin, onBack }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const now = Date.now()
    if (lockedUntil && now < lockedUntil) {
      const secs = Math.ceil((lockedUntil - now) / 1000)
      setError(`Too many failed attempts. Try again in ${secs}s.`)
      return
    }

    const [uHash, pHash] = await Promise.all([
      sha256(form.username),
      sha256(form.password),
    ])

    if (uHash === CRED_HASH_USER && pHash === CRED_HASH_PASS) {
      setAttempts(0)
      setLockedUntil(null)
      onLogin()
    } else {
      const next = attempts + 1
      setAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS)
        setError(`Too many failed attempts. Locked for ${LOCKOUT_MS / 1000}s.`)
      } else {
        setError(`The details you entered are incorrect. Please try again. (${next}/${MAX_ATTEMPTS})`)
      }
    }
  }

  return (
    <div className="login-page">
      <div className="shell-card">
        <div className="shell-card-body">
          <div className="login-inner">
            <h1 className="shell-heading">Welcome</h1>

            {!showForm ? (
              <>
                <button
                  className="shell-btn shell-btn-primary shell-btn-full"
                  type="button"
                  onClick={() => setShowForm(true)}
                >
                  Sign In
                </button>
                <button
                  className="shell-btn shell-btn-outlined shell-btn-full"
                  type="button"
                  onClick={() => setShowForm(true)}
                >
                  Shell Employee Login
                </button>
              </>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="shell-field">
                  <label className="shell-label" htmlFor="username">Username</label>
                  <input
                    className="shell-input"
                    id="username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div className="shell-field">
                  <label className="shell-label" htmlFor="password">Password</label>
                  <input
                    className="shell-input"
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && <div className="shell-error">{error}</div>}
                <button className="shell-btn shell-btn-primary shell-btn-full" type="submit">
                  Sign In
                </button>
                <button
                  className="shell-btn shell-btn-outlined shell-btn-full"
                  type="button"
                  onClick={() => { setShowForm(false); setError(''); onBack?.() }}
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
