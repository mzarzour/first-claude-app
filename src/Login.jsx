import { useState } from 'react'

const DEMO_USER = 'dealer'
const DEMO_PASS = 'evolv2024'

export default function Login({ onLogin, onBack }) {
  const [showForm, setShowForm] = useState(false)
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
      setError('The details you entered are incorrect. Please try again.')
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
