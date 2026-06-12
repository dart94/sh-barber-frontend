import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuth } from '../../contexts/ClientAuthContext'
import BottomNav from '../../components/client/BottomNav'
import { Appointment, getMyAppointments } from '../../lib/api'

const STATUS_CFG = {
  PENDING:   { label: 'Pendiente',  badge: 'bg-yellow-400/10 text-yellow-400',    dot: 'bg-yellow-400' },
  CONFIRMED: { label: 'Confirmada', badge: 'bg-barber-green/10 text-barber-green', dot: 'bg-barber-green' },
  COMPLETED: { label: 'Completada', badge: 'bg-barber-gold/10 text-barber-gold',   dot: 'bg-barber-gold' },
  CANCELLED: { label: 'Cancelada',  badge: 'bg-barber-red/10 text-barber-red',     dot: 'bg-barber-red' },
} as const

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const DAYS_ES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

function formatAppt(iso: string) {
  const d = new Date(new Date(iso).getTime() - 7 * 60 * 60 * 1000)
  const h = d.getUTCHours(), m = d.getUTCMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  return {
    day:     DAYS_ES[d.getUTCDay()],
    date:    `${d.getUTCDate()} ${MONTHS_ES[d.getUTCMonth()]}`,
    year:    d.getUTCFullYear(),
    time:    `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`,
  }
}

type Tab = 'upcoming' | 'past'

export default function AppointmentsScreen() {
  const { client } = useClientAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('upcoming')

  useEffect(() => {
    setLoading(true)
    setError(null)
    getMyAppointments()
      .then(setAppointments)
      .catch(() => setError('No se pudieron cargar tus citas'))
      .finally(() => setLoading(false))
  }, [client?.id])

  const now = new Date()

  const upcoming = appointments.filter(
    (a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && new Date(a.scheduledAt) >= now
  )
  const past = appointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED' || new Date(a.scheduledAt) < now
  )

  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-14 pb-4 flex flex-col gap-5 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col gap-0.5 pt-2">
          <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Hola, {client?.name?.split(' ')[0]}</span>
          <span className="font-serif text-2xl text-barber-text">Mis citas</span>
        </div>

        {error && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-barber-card border border-barber-border rounded-xl p-1 gap-1">
          {(['upcoming', 'past'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                tab === t
                  ? 'bg-barber-gold text-barber-bg shadow-sm'
                  : 'text-barber-sub'
              }`}
            >
              {t === 'upcoming'
                ? `Próximas${upcoming.length ? ` (${upcoming.length})` : ''}`
                : 'Historial'}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
          ))
        ) : list.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <EmptyCalendarIcon />
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-barber-sub">
                {tab === 'upcoming' ? 'No tienes citas próximas' : 'Sin historial aún'}
              </span>
              {tab === 'upcoming' && (
                <span className="text-xs text-barber-dim">Agenda tu siguiente visita</span>
              )}
            </div>
            {tab === 'upcoming' && (
              <button
                onClick={() => navigate('/agendar')}
                className="mt-2 bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-xl px-6 py-3 text-sm font-extrabold text-barber-bg active:scale-95 transition-transform"
              >
                Agendar cita
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((appt) => {
              const cfg = STATUS_CFG[appt.status]
              const { day, date, year, time } = formatAppt(appt.scheduledAt)
              const currentYear = now.getFullYear()
              return (
                <div
                  key={appt.id}
                  className={`bg-barber-card border rounded-2xl p-4 flex gap-4 ${
                    appt.status === 'CANCELLED' ? 'border-barber-border opacity-60' : 'border-barber-border'
                  }`}
                >
                  {/* Date block */}
                  <div className="flex flex-col items-center justify-center bg-barber-muted rounded-xl px-3 py-2 min-w-[52px] shrink-0">
                    <span className="text-[10px] font-bold uppercase text-barber-mute">{date.split(' ')[1]}</span>
                    <span className="font-serif text-2xl text-barber-text leading-none">{date.split(' ')[0]}</span>
                    {year !== currentYear && (
                      <span className="text-[9px] text-barber-dim">{year}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-barber-text leading-tight">{appt.service.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs text-barber-sub">{day} · {time}</span>
                      </div>
                      <span className="text-barber-dim text-xs">·</span>
                      <span className="text-xs text-barber-dim">{appt.service.duration} min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base text-barber-gold-3">${appt.service.price.toFixed(0)}</span>
                      {appt.isFree && (
                        <span className="text-[10px] font-bold text-barber-gold bg-barber-gold/10 px-2 py-0.5 rounded-full">
                          Gratis
                        </span>
                      )}
                      {appt.status === 'COMPLETED' && !appt.isFree && (
                        <span className="text-[10px] font-bold text-barber-gold bg-barber-gold/10 px-2 py-0.5 rounded-full">
                          +10 pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* FAB */}
      {tab === 'upcoming' && !loading && (
        <div className="fixed right-5" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={() => navigate('/agendar')}
            className="w-14 h-14 bg-gradient-to-br from-barber-gold to-[#A8843D] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(201,164,92,0.35)] active:scale-90 transition-transform"
          >
            <PlusIcon />
          </button>
        </div>
      )}

      <BottomNav active="appointments" />
    </div>
  )
}

function EmptyCalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="32" rx="6" stroke="#5E776F" strokeWidth="2" />
      <path d="M6 19h36M16 6v8M32 6v8" stroke="#5E776F" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 29h14M17 35h9" stroke="#5E776F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3v16M3 11h16" stroke="#0B2422" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
