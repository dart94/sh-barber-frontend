import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../lib/api'
import { useAdminAuth } from '../../contexts/AdminAuthContext'

export default function AdminLogin() {
  const { loginAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await adminLogin(email, password)
      loginAdmin(token, user)
      navigate('/admin/dashboard', { replace: true })
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(201,164,92,0.2)] border border-barber-gold/30">
            <img src="/logo.jpg" alt="SH Barbería" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-serif text-2xl text-barber-text tracking-wide">SH Barbería</span>
            <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Panel Administrativo</span>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-barber-card border border-barber-border rounded-3xl p-6 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider uppercase text-barber-sub">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@barber.com"
              autoComplete="email"
              className="w-full bg-barber-muted border border-barber-border rounded-xl px-4 py-3 text-sm text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider uppercase text-barber-sub">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-barber-muted border border-barber-border rounded-xl px-4 py-3 pr-12 text-sm text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-barber-dim hover:text-barber-sub transition-colors"
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-barber-red/10 border border-barber-red/30 rounded-xl px-4 py-3">
              <span className="text-sm text-barber-red">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-xl py-3.5 text-sm font-extrabold text-barber-bg disabled:opacity-50 active:scale-[0.98] transition-transform shadow-[0_8px_20px_rgba(201,164,92,0.2)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-barber-bg/30 border-t-barber-bg rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-barber-dim">
          Solo para administradores y barberos autorizados
        </p>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 1l16 16M7.5 7.6A2.5 2.5 0 0 0 11.4 11.4M5 5.2C2.8 6.5 1 9 1 9s3 6 8 6c1.6 0 3-.5 4.2-1.2M13 12.8C15.2 11.5 17 9 17 9s-3-6-8-6c-.8 0-1.6.1-2.3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
