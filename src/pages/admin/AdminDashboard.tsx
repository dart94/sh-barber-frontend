import { useEffect, useState, useCallback } from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import AdminNav from '../../components/admin/AdminNav'
import {
  Appointment,
  getAdminAppointments,
  adminConfirmAppointment,
  adminCancelAppointment,
  adminCompleteAppointment,
} from '../../lib/api'

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function toLocalDate(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  // Hermosillo UTC-7
  const h = new Date(d.getTime() - 7 * 60 * 60 * 1000)
  const y = h.getUTCFullYear()
  const m = String(h.getUTCMonth() + 1).padStart(2, '0')
  const day = String(h.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 7))
  return {
    dayName: DAYS_ES[date.getUTCDay()],
    day: d,
    month: MONTHS_ES[m - 1],
    year: y,
  }
}

function toHermosilloTime(iso: string) {
  const d = new Date(new Date(iso).getTime() - 7 * 60 * 60 * 1000)
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const STATUS_CFG = {
  PENDING:   { label: 'Pendiente',  dot: 'bg-yellow-400',    text: 'text-yellow-400',  badge: 'bg-yellow-400/10 text-yellow-400' },
  CONFIRMED: { label: 'Confirmada', dot: 'bg-barber-green',  text: 'text-barber-green', badge: 'bg-barber-green/10 text-barber-green' },
  COMPLETED: { label: 'Completada', dot: 'bg-barber-gold',   text: 'text-barber-gold',  badge: 'bg-barber-gold/10 text-barber-gold' },
  CANCELLED: { label: 'Cancelada',  dot: 'bg-barber-red',    text: 'text-barber-red',   badge: 'bg-barber-red/10 text-barber-red' },
} as const

export default function AdminDashboard() {
  const { admin, logoutAdmin } = useAdminAuth()
  const [dayOffset, setDayOffset] = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dateStr = toLocalDate(dayOffset)
  const { dayName, day, month, year } = parseDateLabel(dateStr)
  const isToday = dayOffset === 0

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getAdminAppointments(dateStr)
      .then(setAppointments)
      .catch(() => setError('No se pudo cargar las citas'))
      .finally(() => setLoading(false))
  }, [dateStr])

  useEffect(() => { load() }, [load])

  const act = async (id: string, fn: () => Promise<Appointment>) => {
    setActing(id)
    setError(null)
    try {
      const updated = await fn()
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a)))
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setActing(null)
    }
  }

  const counts = {
    PENDING:   appointments.filter((a) => a.status === 'PENDING').length,
    CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
  }

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-lg mx-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="SH Barbería" className="w-9 h-9 rounded-xl border border-barber-gold/30" />
          <div className="flex flex-col gap-0">
            <span className="font-serif text-base text-barber-text leading-tight">SH Barbería</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-barber-mute leading-tight">
              {admin?.role === 'ADMIN' ? 'Administrador' : 'Barbero'} · {admin?.name}
            </span>
          </div>
        </div>
        <button
          onClick={logoutAdmin}
          className="w-9 h-9 rounded-full bg-barber-card border border-barber-border flex items-center justify-center"
          title="Cerrar sesión"
        >
          <LogoutIcon />
        </button>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-5 overflow-y-auto">

        {/* Date nav */}
        <div className="flex items-center justify-between bg-barber-card border border-barber-border rounded-2xl px-4 py-3">
          <button
            onClick={() => setDayOffset((d) => d - 1)}
            className="w-8 h-8 rounded-full bg-barber-muted flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeftIcon />
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-serif text-lg text-barber-text">
              {dayName} {day} de {month}{year !== new Date().getFullYear() ? ` ${year}` : ''}
            </span>
            {isToday && (
              <span className="text-[10px] font-bold tracking-widest uppercase text-barber-gold">Hoy</span>
            )}
          </div>
          <button
            onClick={() => setDayOffset((d) => d + 1)}
            className="w-8 h-8 rounded-full bg-barber-muted flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(counts) as [keyof typeof STATUS_CFG, number][]).map(([status, count]) => (
            <div key={status} className="bg-barber-card border border-barber-border rounded-2xl py-3 flex flex-col items-center gap-1">
              <span className={`text-xl font-bold ${STATUS_CFG[status].text}`}>{count}</span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-barber-dim text-center leading-tight">
                {STATUS_CFG[status].label}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}

        {/* Appointments */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
          ))
        ) : appointments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <CalendarEmptyIcon />
            <span className="text-sm text-barber-mute">No hay citas este día</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => {
              const cfg = STATUS_CFG[appt.status]
              const isActing = acting === appt.id
              return (
                <div
                  key={appt.id}
                  className="bg-barber-card border border-barber-border rounded-2xl p-4 flex flex-col gap-3"
                >
                  {/* Row 1: time + status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="font-bold text-barber-gold-2 text-base">
                        {toHermosilloTime(appt.scheduledAt)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Row 2: service + client */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-barber-text">{appt.service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-barber-sub">{appt.client.name}</span>
                      <span className="text-barber-dim text-xs">·</span>
                      <span className="text-xs text-barber-dim">{appt.client.phone}</span>
                    </div>
                  </div>

                  {/* Row 3: price + duration */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-barber-mute">${appt.service.price.toFixed(0)}</span>
                    <span className="text-xs text-barber-dim">{appt.service.duration} min</span>
                    {appt.isFree && (
                      <span className="text-[10px] font-bold text-barber-gold bg-barber-gold/10 px-2 py-0.5 rounded-full">
                        Cita gratis
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {appt.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => act(appt.id, () => adminConfirmAppointment(appt.id))}
                        disabled={!!acting}
                        className="flex-1 bg-barber-green/15 border border-barber-green/40 text-barber-green text-xs font-bold rounded-xl py-2.5 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {isActing ? '...' : '✓ Confirmar'}
                      </button>
                      <button
                        onClick={() => act(appt.id, () => adminCancelAppointment(appt.id))}
                        disabled={!!acting}
                        className="flex-1 bg-barber-red/10 border border-barber-red/30 text-barber-red text-xs font-bold rounded-xl py-2.5 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {isActing ? '...' : '✗ Cancelar'}
                      </button>
                    </div>
                  )}
                  {appt.status === 'CONFIRMED' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => act(appt.id, () => adminCompleteAppointment(appt.id))}
                        disabled={!!acting}
                        className="flex-1 bg-barber-gold/15 border border-barber-gold/40 text-barber-gold text-xs font-bold rounded-xl py-2.5 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {isActing ? '...' : '★ Completar'}
                      </button>
                      <button
                        onClick={() => act(appt.id, () => adminCancelAppointment(appt.id))}
                        disabled={!!acting}
                        className="flex-1 bg-barber-red/10 border border-barber-red/30 text-barber-red text-xs font-bold rounded-xl py-2.5 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {isActing ? '...' : '✗ Cancelar'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AdminNav />
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="#8FA69F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M7 1 1 7l6 6" stroke="#A9BDB6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="#A9BDB6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CalendarEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="8" width="30" height="27" rx="5" stroke="#5E776F" strokeWidth="1.8" />
      <path d="M5 16h30M13 5v6M27 5v6" stroke="#5E776F" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 24h12M14 30h8" stroke="#5E776F" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
