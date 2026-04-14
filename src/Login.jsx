import { useState } from 'react'

// Salted SHA-256 hashes — salt prevents rainbow table lookups
// Salt: 'xK9mP2qL5vR8', hashed as sha256(SALT + value)
const SALT = 'xK9mP2qL5vR8'
const CRED_HASH_USER = '11057f244f3076445ec11639796c3d7f44b85795b07dd3870085123849493917'
const CRED_HASH_PASS = '24aa7b12e0afafd13f7f9b29550e18b15a19fe299a09223e415e82fde7608086'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Persist lockout across page refreshes using sessionStorage
function readSession(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function writeSession(key, val) {
  try { sessionStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
}

export default function Login({ onLogin, onBack }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(() => readSession('loginAttempts', 0))
  const [lockedUntil, setLockedUntil] = useState(() => readSession('loginLockedUntil', null))

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
      setAttempts(0); writeSession('loginAttempts', 0)
      setLockedUntil(null); writeSession('loginLockedUntil', null)
      onLogin()
    } else {
      const next = attempts + 1
      setAttempts(next); writeSession('loginAttempts', next)
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS
        setLockedUntil(until); writeSession('loginLockedUntil', until)
        setError(`Too many failed attempts. Locked for ${LOCKOUT_MS / 1000}s.`)
      } else {
        setError('The details you entered are incorrect. Please try again.')
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
