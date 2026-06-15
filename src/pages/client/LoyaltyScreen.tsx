import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuth } from '../../contexts/ClientAuthContext'
import BottomNav from '../../components/client/BottomNav'
import { getLoyalty, redeemLoyalty, getMyAppointments, Loyalty, Appointment } from '../../lib/api'

const REWARDS_ORDER = [
  { type: 'DISCOUNT_20', label: 'Descuento 20%', points: 30 },
  { type: 'FREE_HAIRCUT', label: 'Corte gratis', points: 50 },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  // Hermosillo UTC-7
  const local = new Date(d.getTime() - 7 * 60 * 60 * 1000)
  return local.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-barber-green bg-barber-green/10',
  CANCELLED: 'text-barber-red bg-barber-red/10',
  COMPLETED: 'text-barber-gold bg-barber-gold/10',
}

const PREVIEW_COUNT = 5

export default function LoyaltyScreen() {
  const navigate = useNavigate()
  const { client, refresh } = useClientAuth()
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client) return
    Promise.all([getLoyalty(client.id), getMyAppointments()])
      .then(([l, a]) => {
        setLoyalty(l)
        setAppointments(a)
      })
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setLoading(false))
  }, [client])

  const handleRedeem = async (type: string, label: string) => {
    if (!client) return
    setRedeeming(type)
    setError(null)
    try {
      const result = await redeemLoyalty(client.id, type)
      setRedeemSuccess(`¡${label} canjeado! Usaste ${result.pointsUsed} pts. Muestra esto al barbero.`)
      const [updated] = await Promise.all([getLoyalty(client.id), refresh()])
      setLoyalty(updated)
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setRedeeming(null)
    }
  }

  const pts = loyalty?.points ?? client?.points ?? 0

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-14 pb-4 flex flex-col gap-5 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col gap-0.5 pt-2">
          <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Programa de fidelidad</span>
          <span className="font-serif text-2xl text-barber-text">Mis puntos</span>
        </div>

        {/* Points hero */}
        <div className="bg-gradient-to-br from-[#143732] to-[#0E2A27] border border-barber-gold/35 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-widest uppercase text-barber-gold-2">Puntos acumulados</span>
            <span className="font-serif text-5xl text-barber-gold-3 leading-none">{pts}</span>
            <span className="text-xs text-barber-sub mt-1">{loyalty?.visits ?? client?.visits ?? 0} visitas en total</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-barber-gold/10 border border-barber-gold/30 flex items-center justify-center">
            <StarBigIcon />
          </div>
        </div>

        {/* Success banner */}
        {redeemSuccess && (
          <div aria-live="polite" className="bg-barber-green/15 border border-barber-green/40 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-barber-green text-lg mt-0.5">✓</span>
            <span className="text-sm text-barber-green flex-1">{redeemSuccess}</span>
            <button
              onClick={() => setRedeemSuccess(null)}
              aria-label="Cerrar"
              className="shrink-0 text-barber-green/70 hover:text-barber-green transition-colors"
            >
              <span className="text-base leading-none">✕</span>
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-barber-red/15 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}

        {/* Rewards */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Recompensas</span>

          {loading ? (
            <div className="h-24 rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
          ) : (
            REWARDS_ORDER.map(({ type, label, points }) => {
              const progress = Math.min(pts / points, 1)
              const canRedeem = pts >= points
              const isRedeeming = redeeming === type

              return (
                <div
                  key={type}
                  className="bg-barber-card border border-barber-border rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-barber-text">{label}</span>
                      <span className="text-xs text-barber-mute">{points} puntos necesarios</span>
                    </div>
                    {canRedeem ? (
                      <button
                        onClick={() => handleRedeem(type, label)}
                        disabled={isRedeeming}
                        className="px-4 py-2 bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-xl text-xs font-extrabold text-barber-bg disabled:opacity-60 active:scale-95 transition-transform"
                      >
                        {isRedeeming ? '...' : 'Canjear'}
                      </button>
                    ) : (
                      <span className="text-xs text-barber-dim font-semibold">
                        Faltan {points - pts} pts
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-barber-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-barber-gold to-barber-gold-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[10px] text-barber-dim">0</span>
                    <span className="text-[10px] text-barber-dim">{points} pts</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Appointment history */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Historial de citas</span>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
            ))
          ) : appointments.length === 0 ? (
            <div className="bg-barber-card border border-barber-border rounded-2xl px-5 py-6 text-center">
              <span className="text-sm text-barber-mute">Aún no tienes citas</span>
            </div>
          ) : (
            <>
              {appointments.slice(0, PREVIEW_COUNT).map((appt) => (
                <div
                  key={appt.id}
                  className="bg-barber-card border border-barber-border rounded-2xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-barber-text">{appt.service.name}</span>
                    <span className="text-xs text-barber-mute">{formatDate(appt.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.status === 'COMPLETED' && !appt.isFree && (
                      <span className="text-xs font-bold text-barber-gold">+10 pts</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLOR[appt.status]}`}>
                      {STATUS_LABEL[appt.status]}
                    </span>
                  </div>
                </div>
              ))}
              {appointments.length > PREVIEW_COUNT && (
                <button
                  onClick={() => navigate('/citas')}
                  className="w-full text-xs font-bold text-barber-gold-2 py-2 active:opacity-70 transition-opacity"
                >
                  Ver todas ({appointments.length}) →
                </button>
              )}
            </>
          )}
        </div>

        <div className="h-4" />
      </div>

      <BottomNav active="points" />
    </div>
  )
}

function StarBigIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
      <path
        d="m10 2.5 2.2 4.6 5 .7-3.6 3.5.9 5L10 13.9l-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5Z"
        fill="#C9A45C"
        stroke="#C9A45C"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}
