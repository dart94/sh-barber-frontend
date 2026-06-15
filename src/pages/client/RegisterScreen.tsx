import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { clientRegister } from '../../lib/api'
import { useClientAuth } from '../../contexts/ClientAuthContext'

export default function RegisterScreen() {
  const location = useLocation()
  const phone = (location.state as { phone: string })?.phone ?? ''
  const navigate = useNavigate()
  const [name, setName] = useState('')

  // U3: guard — no phone means user navigated directly without going through PhoneScreen
  useEffect(() => {
    if (!phone) navigate('/telefono', { replace: true })
  }, [phone, navigate])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const { login } = useClientAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2 || pin.length !== 4) return
    if (pin !== confirmPin) { setError('Los PINs no coinciden'); return }
    setLoading(true)
    setError('')

    try {
      const { token, client } = await clientRegister({ name: name.trim(), phone, pin })
      login(token, client)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/telefono')}
        className="self-start mb-8 w-10 h-10 rounded-full bg-barber-card border border-barber-border flex items-center justify-center"
      >
        <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
          <path d="M8 1 1.5 7.5 8 14" stroke="#C9A45C" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Header */}
      <div className="w-full flex flex-col gap-1 mb-10">
        <span className="font-serif text-3xl text-barber-text">Bienvenido</span>
        <span className="text-sm text-barber-mute">
          Primera visita · {phone}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="reg-name" className="text-xs font-bold tracking-widest uppercase text-barber-mute">
            Tu nombre
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Carlos Mendoza"
            className="w-full bg-barber-card border border-barber-border rounded-2xl px-4 py-4 text-base font-semibold text-barber-text placeholder:text-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="reg-pin" className="text-xs font-bold tracking-widest uppercase text-barber-mute">
            PIN de seguridad (4 dígitos)
          </label>
          <input
            id="reg-pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="····"
            className="w-full bg-barber-card border border-barber-border rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="reg-pin-confirm" className="text-xs font-bold tracking-widest uppercase text-barber-mute">
            Confirmar PIN
          </label>
          <input
            id="reg-pin-confirm"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="····"
            className="w-full bg-barber-card border border-barber-border rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
          />
        </div>

        {error && (
          <span className="text-sm text-barber-red text-center">{error}</span>
        )}

        <button
          type="submit"
          disabled={loading || name.trim().length < 2 || pin.length !== 4 || pin !== confirmPin}
          className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
