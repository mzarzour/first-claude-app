import { useState } from 'react'

const DEMO_USER = 'dealer'
const DEMO_PASS = 'evolv2024'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.username === DEMO_USER && form.password === DEMO_PASS) {
      onLogin()
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">EVOLV <span>FISHING</span></div>
        <h2 className="login-title">Dealer Portal</h2>
        <p className="login-sub">Sign in to access wholesale pricing and the dealer catalog.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="dealer"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full">Sign In</button>
        </form>

        <p className="login-hint">Demo credentials: <code>dealer</code> / <code>evolv2024</code></p>
      </div>
    </div>
  )
}
