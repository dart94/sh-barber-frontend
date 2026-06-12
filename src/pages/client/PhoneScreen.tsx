import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientAuth } from '../../lib/api'
import { useClientAuth } from '../../contexts/ClientAuthContext'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useClientAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) return
    setLoading(true)
    setError('')

    try {
      const result = await clientAuth(phone.trim())
      if (result.exists && result.token && result.client) {
        login(result.token, result.client)
        navigate('/', { replace: true })
      } else {
        navigate('/registro', { state: { phone: phone.trim() } })
      }
    } catch {
      setError('Error al verificar el número. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest uppercase text-barber-mute">
            Número de teléfono
          </label>
          <input
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

      <p className="mt-8 text-xs text-barber-dim text-center leading-relaxed">
        Si es tu primera visita te pediremos tu nombre.<br />
        No necesitas contraseña.
      </p>
    </div>
  )
}
