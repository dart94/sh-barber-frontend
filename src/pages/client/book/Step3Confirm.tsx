import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createAppointment, Service, Slot } from '../../../lib/api'
import { useClientAuth } from '../../../contexts/ClientAuthContext'

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function toHermosilloDate(date: Date) {
  return new Date(date.getTime() - 7 * 60 * 60 * 1000)
}

function formatDisplay(datetime: string) {
  const d = toHermosilloDate(new Date(datetime))
  const dayName = DAYS_ES[d.getUTCDay()]
  const day     = d.getUTCDate()
  const month   = MONTHS_ES[d.getUTCMonth()]
  const h       = d.getUTCHours()
  const m       = d.getUTCMinutes()
  const ampm    = h >= 12 ? 'PM' : 'AM'
  const h12     = h % 12 || 12
  const time    = `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  return { dayName, day, month, time }
}

export default function Step3Confirm() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { client } = useClientAuth()

  const { service, slot } = (location.state ?? {}) as { service?: Service; slot?: Slot }

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [confirmed, setConfirmed] = useState(false)

  // U4: navigate in effect, not during render
  useEffect(() => {
    if (!service || !slot) navigate('/agendar', { replace: true })
  }, [service, slot, navigate])

  if (!service || !slot) return null

  const { dayName, day, month, time } = formatDisplay(slot.datetime)

  const handleConfirm = async () => {
    if (!client) return
    setLoading(true)
    setError('')
    try {
      await createAppointment({
        clientId:    client.id,
        serviceId:   service.id,
        scheduledAt: slot.datetime,
      })
      setConfirmed(true)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Éxito ── */
  if (confirmed) {
    return (
      <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
        <div className="flex-1 px-6 pt-28 pb-6 flex flex-col items-center gap-6">

          {/* Check */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-barber-gold to-[#A8843D] flex items-center justify-center shadow-[0_16px_48px_rgba(201,164,92,0.35)]">
            <svg width="38" height="30" viewBox="0 0 38 30" fill="none">
              <path d="M3 15.5 13.5 26 35 4" stroke="#0B2422" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-serif text-3xl text-barber-text">¡Cita confirmada!</span>
            <span className="text-sm text-barber-mute">Te esperamos en SH Barbería</span>
          </div>

          {/* Summary card */}
          <div className="w-full bg-barber-card border border-barber-gold/25 rounded-3xl p-6 flex flex-col gap-4">
            <Row label="Servicio" value={service.name} />
            <Row label="Fecha"    value={`${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} de ${month}`} />
            <Row label="Hora"     value={time} />
            <div className="h-px bg-white/7" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-barber-mute">Total</span>
              <span className="font-serif text-2xl text-barber-gold-3">${service.price.toFixed(0)}</span>
            </div>
          </div>

          {/* Points badge */}
          <div className="flex items-center gap-2.5 bg-barber-gold/10 border border-barber-gold/30 rounded-full px-5 py-2.5">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="m10 2.5 2.2 4.6 5 .7-3.6 3.5.9 5L10 13.9l-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5Z" fill="#C9A45C" />
            </svg>
            <span className="text-sm font-bold text-barber-gold-3">+10 puntos al completar tu visita</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-10 flex flex-col gap-3">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] active:scale-95 transition-all"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => navigate('/agendar', { replace: true })}
            className="w-full border border-barber-gold/40 rounded-2xl py-4 text-base font-bold text-barber-gold-2 active:scale-95 transition-all"
          >
            Agendar otra cita
          </button>
        </div>
      </div>
    )
  }

  /* ── Resumen antes de confirmar ── */
  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-16 pb-4 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-barber-card border border-barber-border flex items-center justify-center shrink-0"
          >
            <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
              <path d="M8 1 1.5 7.5 8 14" stroke="#C9A45C" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-serif text-2xl text-barber-text">Agendar cita</span>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            <div className="flex-1 h-1 rounded-full bg-barber-gold" />
            <div className="flex-1 h-1 rounded-full bg-barber-gold" />
            <div className="flex-1 h-1 rounded-full bg-barber-gold" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-barber-gold-2">
            Paso 3 de 3 · Confirma tu cita
          </span>
        </div>

        {/* Summary */}
        <div className="bg-barber-card border border-barber-gold/25 rounded-3xl p-6 flex flex-col gap-4 mt-2">
          <Row label="Servicio"  value={service.name} />
          <Row label="Duración"  value={`${service.duration} min`} />
          <Row label="Fecha"     value={`${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} de ${month}`} />
          <Row label="Hora"      value={time} />
          <div className="h-px bg-white/7" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-barber-mute">Total</span>
            <span className="font-serif text-2xl text-barber-gold-3">${service.price.toFixed(0)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 pt-2">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading ? 'Guardando...' : 'Confirmar cita'}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-barber-mute">{label}</span>
      <span className="text-[15px] font-bold text-barber-text">{value}</span>
    </div>
  )
}
