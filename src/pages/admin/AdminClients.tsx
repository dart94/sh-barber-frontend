import { useEffect, useState, useRef } from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import AdminNav from '../../components/admin/AdminNav'
import { Client, Appointment, adminGetClients, getAdminAppointments } from '../../lib/api'

const STATUS_CFG = {
  PENDING:   { label: 'Pendiente',  badge: 'bg-yellow-400/10 text-yellow-400' },
  CONFIRMED: { label: 'Confirmada', badge: 'bg-barber-green/10 text-barber-green' },
  COMPLETED: { label: 'Completada', badge: 'bg-barber-gold/10 text-barber-gold' },
  CANCELLED: { label: 'Cancelada',  badge: 'bg-barber-red/10 text-barber-red' },
} as const

function formatDate(iso: string) {
  const d = new Date(new Date(iso).getTime() - 7 * 60 * 60 * 1000)
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toHermosilloTime(iso: string) {
  const d = new Date(new Date(iso).getTime() - 7 * 60 * 60 * 1000)
  const h = d.getUTCHours(), m = d.getUTCMinutes()
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'bg-[#1E4A44] text-barber-gold-2',
  'bg-[#2A3A1E] text-barber-green',
  'bg-[#3A1E2A] text-[#D4A0B0]',
  'bg-[#1E2A3A] text-[#A0B4D4]',
  'bg-[#3A2A1E] text-[#D4B8A0]',
]
function avatarColor(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

export default function AdminClients() {
  const { admin, logoutAdmin } = useAdminAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Detail sheet
  const [selected, setSelected] = useState<Client | null>(null)
  const [appts, setAppts] = useState<Appointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(false)
  const [apptsError, setApptsError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    adminGetClients()
      .then(setClients)
      .catch(() => setError('No se pudo cargar los clientes'))
      .finally(() => setLoading(false))
  }, [])

  const openClient = async (c: Client) => {
    setSelected(c)
    setAppts([])
    setApptsError(null)
    setLoadingAppts(true)
    try {
      const data = await getAdminAppointments(undefined, c.id)
      setAppts(data)
    } catch {
      setApptsError('No se pudo cargar el historial')
    } finally {
      setLoadingAppts(false)
    }
  }

  const closeSheet = () => setSelected(null)

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-lg mx-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="SH Barbería" className="w-9 h-9 rounded-xl border border-barber-gold/30" />
          <div className="flex flex-col">
            <span className="font-serif text-base text-barber-text leading-tight">Clientes</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-barber-mute leading-tight">
              {clients.length} registrados
            </span>
          </div>
        </div>
        <button onClick={logoutAdmin} className="w-9 h-9 rounded-full bg-barber-card border border-barber-border flex items-center justify-center">
          <LogoutIcon />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-barber-dim">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o teléfono"
            className="w-full bg-barber-card border border-barber-border rounded-xl pl-10 pr-4 py-3 text-sm text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 flex flex-col gap-2.5 overflow-y-auto">

        {error && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}

        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-sm text-barber-mute">{search ? 'Sin resultados' : 'Sin clientes registrados'}</span>
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => openClient(c)}
              className="w-full bg-barber-card border border-barber-border rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(c.id)}`}>
                {initials(c.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-barber-text truncate">{c.name}</div>
                <div className="text-xs text-barber-mute">{c.phone}</div>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-xs font-bold text-barber-gold-2">{c.points} pts</span>
                <span className="text-[10px] text-barber-dim">{c.visits} visitas</span>
              </div>

              <ChevronIcon />
            </button>
          ))
        )}
        <div className="h-2" />
      </div>

      <AdminNav />

      {/* Client detail sheet */}
      {selected && (
        <div
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) closeSheet() }}
          className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center"
        >
          <div className="w-full max-w-lg bg-barber-sidebar border-t border-barber-border rounded-t-3xl flex flex-col max-h-[85vh] animate-slide-up">

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${avatarColor(selected.id)}`}>
                  {initials(selected.name)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-serif text-lg text-barber-text">{selected.name}</span>
                  <span className="text-xs text-barber-mute">{selected.phone}</span>
                </div>
              </div>
              <button onClick={closeSheet} className="w-8 h-8 rounded-full bg-barber-muted flex items-center justify-center">
                <CloseIcon />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 px-5 pb-4 shrink-0">
              <StatCard label="Puntos" value={String(selected.points)} color="text-barber-gold-2" />
              <StatCard label="Visitas" value={String(selected.visits)} color="text-barber-green" />
              <StatCard label="Miembro desde" value={formatDate(selected.createdAt)} color="text-barber-sub" small />
            </div>

            <div className="h-px bg-barber-border mx-5 shrink-0" />

            {/* Appointments */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-barber-mute shrink-0">
                Historial de citas
              </span>

              {loadingAppts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-barber-card border border-barber-border animate-pulse" />
                ))
              ) : apptsError ? (
                <div className="bg-barber-red/10 border border-barber-red/30 rounded-xl px-4 py-3">
                  <span className="text-sm text-barber-red">{apptsError}</span>
                </div>
              ) : appts.length === 0 ? (
                <div className="py-6 text-center">
                  <span className="text-sm text-barber-mute">Sin citas registradas</span>
                </div>
              ) : (
                appts.map((a) => {
                  const cfg = STATUS_CFG[a.status]
                  return (
                    <div key={a.id} className="bg-barber-card border border-barber-border rounded-xl px-3.5 py-3 flex items-center gap-3">
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-sm font-semibold text-barber-text truncate">{a.service.name}</span>
                        <span className="text-xs text-barber-mute">
                          {formatDate(a.scheduledAt)} · {toHermosilloTime(a.scheduledAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {a.status === 'COMPLETED' && !a.isFree && (
                          <span className="text-xs font-bold text-barber-gold">+10 pts</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div className="h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="bg-barber-card border border-barber-border rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
      <span className="text-[9px] font-bold tracking-wider uppercase text-barber-dim">{label}</span>
      <span className={`font-bold ${small ? 'text-[11px]' : 'text-base'} ${color} leading-tight`}>{value}</span>
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
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="#5E776F" strokeWidth="1.4" />
      <path d="M10.5 10.5 14 14" stroke="#5E776F" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
      <path d="M1 1l4 4-4 4" stroke="#5E776F" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1l10 10M11 1 1 11" stroke="#8FA69F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
