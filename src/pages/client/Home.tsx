import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuth } from '../../contexts/ClientAuthContext'
import BottomNav from '../../components/client/BottomNav'

const TOTAL_VISITS = 10

export default function ClientHome() {
  const { client, logout, refresh } = useClientAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const visits = client?.visits ?? 0
  const remaining = TOTAL_VISITS - visits

  // U8: refresh points/visits on every mount (catches updates from booking flow)
  useEffect(() => { refresh() }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días,'
    if (h < 19) return 'Buenas tardes,'
    return 'Buenas noches,'
  }

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-16 pb-4 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="SH Barbería" className="w-10 h-10 rounded-xl shadow-lg" />
            <span className="font-serif text-lg text-barber-text-2 tracking-wide">SH Barbería</span>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-10 h-10 rounded-full bg-barber-card border border-barber-border flex items-center justify-center"
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Greeting */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-barber-mute">{greeting()}</span>
          <span className="font-serif text-3xl text-barber-text">{client?.name}</span>
        </div>

        {/* Loyalty Card */}
        <div className="bg-gradient-to-br from-[#143732] to-[#0E2A27] border border-barber-gold/35 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-barber-gold-2">
              Tarjeta de fidelidad
            </span>
            <span className="font-serif text-lg text-barber-gold-3">
              {visits} / {TOTAL_VISITS}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: TOTAL_VISITS }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  i < visits
                    ? 'bg-barber-gold'
                    : 'border border-dashed border-barber-gold/40'
                }`}
              >
                {i < visits && <CheckIcon />}
              </div>
            ))}
          </div>

          <span className="text-sm text-barber-sub">
            {remaining > 0 ? (
              <>Te faltan <strong className="text-barber-gold-3">{remaining} visitas</strong> para tu corte gratis</>
            ) : (
              <strong className="text-barber-gold-3">¡Tienes un corte gratis disponible!</strong>
            )}
          </span>
        </div>

        {/* Points summary */}
        <div className="bg-barber-card border border-barber-border rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Puntos acumulados</span>
            <span className="font-serif text-2xl text-barber-gold-3">{client?.points ?? 0} pts</span>
          </div>
          <StarIcon />
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/agendar')}
          className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-center text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] active:scale-95 transition-transform"
        >
          Agendar nueva cita
        </button>
      </div>

      <BottomNav active="home" />

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-sm bg-barber-sidebar border border-barber-border rounded-3xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-serif text-xl text-barber-text">¿Cerrar sesión?</span>
              <span className="text-sm text-barber-mute">Tendrás que ingresar tu teléfono de nuevo.</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border border-barber-border rounded-xl py-3 text-sm font-bold text-barber-sub"
              >
                Cancelar
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-barber-red/15 border border-barber-red/40 rounded-xl py-3 text-sm font-bold text-barber-red"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="#C9A45C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <path d="M1 4.5 4 7.5 10 1" stroke="#0B2422" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
      <path d="m10 2.5 2.2 4.6 5 .7-3.6 3.5.9 5L10 13.9l-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5Z" fill="#C9A45C" stroke="#C9A45C" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}
