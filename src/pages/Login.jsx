import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  return (
    <div className="min-h-screen bg-lab-cream flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 mx-4">

        {/* Top section */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔬</div>
          <h1 className="text-2xl font-bold text-lab-mauve">Smart Lab Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">College Laboratory Management System</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="label block mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="student@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label block mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-lab-mauve cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
              Remember me
            </label>
          </div>

          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or continue as demo</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Demo buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="btn-secondary text-sm"
            onClick={() => navigate('/dashboard')}
          >
            👤 Student Demo
          </button>
          <button
            className="btn-secondary border border-lab-mauve text-sm"
            onClick={() => navigate('/dashboard')}
          >
            🛡️ Admin Demo
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 Smart Lab Inventory
        </p>
      </div>
    </div>
  )
}
