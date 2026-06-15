import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientAuth } from '../../lib/api'
import { useClientAuth } from '../../contexts/ClientAuthContext'

type Step = 'phone' | 'pin'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useClientAuth()
  const navigate = useNavigate()

  // Step 1: verify phone exists
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${(import.meta.env.VITE_API_URL ?? '') + '/api'}/clients/lookup?phone=${phone.trim()}`,
      )
      const data = await res.json()
      if (data.exists) {
        setStep('pin')
      } else {
        navigate('/registro', { state: { phone: phone.trim() } })
      }
    } catch {
      setError('Error al verificar el número. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: login with phone + PIN
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) return
    setLoading(true)
    setError('')

    try {
      const result = await clientAuth(phone.trim(), pin)
      if (result.exists && result.token && result.client) {
        login(result.token, result.client)
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? 'PIN incorrecto. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setPin('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-12">
        <img src="/logo.jpg" alt="SH Barbería" className="w-20 h-20 rounded-2xl shadow-2xl" />
        <div className="flex flex-col items-center gap-1">
          <span className="font-serif text-3xl text-barber-text tracking-wide">SH Barbería</span>
          <span className="text-sm text-barber-mute">Agenda tu cita en segundos</span>
        </div>
      </div>

      {step === 'phone' ? (
        /* ── Phone step ── */
        <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="phone-input" className="text-xs font-bold tracking-widest uppercase text-barber-mute">
              Número de teléfono
            </label>
            <input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                setPhone(digits)
              }}
              placeholder="Ej. 6441234567"
              className="w-full bg-barber-card border border-barber-border rounded-2xl px-4 py-4 text-base font-semibold text-barber-text placeholder:text-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
              autoFocus
            />
            <span className="text-xs text-barber-dim text-right">{phone.length}/10</span>
          </div>

          {error && (
            <span className="text-sm text-barber-red text-center">{error}</span>
          )}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>
      ) : (
        /* ── PIN step ── */
        <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2 mb-2">
            <span className="text-sm text-barber-mute text-center">
              Ingresa tu PIN para el número
            </span>
            <span className="text-base font-semibold text-barber-text text-center tracking-widest">
              {phone}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone-pin" className="text-xs font-bold tracking-wider uppercase text-barber-sub">
              PIN de seguridad
            </label>
            <input
              id="phone-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="····"
              className="w-full bg-barber-muted border border-barber-border rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <span className="text-sm text-barber-red text-center">{error}</span>
          )}

          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-barber-dim underline text-center mt-1"
          >
            Cambiar número
          </button>
        </form>
      )}

      <p className="mt-8 text-xs text-barber-dim text-center leading-relaxed">
        Si es tu primera visita te pediremos tu nombre y un PIN.<br />
        Tu PIN protege tu cuenta.
      </p>
    </div>
  )
}
