import { useState } from 'react'
import { useClientAuth } from '../../contexts/ClientAuthContext'
import BottomNav from '../../components/client/BottomNav'
import { updateClientMe } from '../../lib/api'

function formatMemberSince(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

export default function ProfileScreen() {
  const { client, logout, refresh } = useClientAuth()

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(client?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  const handleSaveName = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed === client?.name) { setEditing(false); return }
    setSaving(true)
    setSaveError(null)
    try {
      await updateClientMe(trimmed)
      await refresh()
      setEditing(false)
    } catch (e: unknown) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setNameInput(client?.name ?? '')
    setSaveError(null)
    setEditing(false)
  }

  const pts = client?.points ?? 0
  const visits = client?.visits ?? 0
  const progress = Math.min(visits / 10, 1)

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-14 pb-4 flex flex-col gap-5 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col gap-0.5 pt-2">
          <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Cuenta</span>
          <span className="font-serif text-2xl text-barber-text">Mi perfil</span>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E4A44] to-[#0E2A27] border-2 border-barber-gold/40 flex items-center justify-center shadow-[0_8px_24px_rgba(201,164,92,0.15)]">
            <span className="font-serif text-2xl text-barber-gold-2">
              {client ? initials(client.name) : '?'}
            </span>
          </div>

          {editing ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') cancelEdit() }}
                autoFocus
                className="w-full text-center bg-barber-card border border-barber-gold/50 rounded-xl px-4 py-2.5 font-serif text-xl text-barber-text focus:outline-none"
              />
              {saveError && <span className="text-xs text-barber-red">{saveError}</span>}
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl border border-barber-border text-xs font-bold text-barber-sub"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={saving || !nameInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-barber-gold to-[#A8843D] text-xs font-extrabold text-barber-bg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl text-barber-text">{client?.name}</span>
              <button
                onClick={() => { setNameInput(client?.name ?? ''); setEditing(true) }}
                className="w-7 h-7 rounded-lg bg-barber-card border border-barber-border flex items-center justify-center"
              >
                <EditIcon />
              </button>
            </div>
          )}

          <span className="text-sm text-barber-mute">{client?.phone}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#143732] to-[#0E2A27] border border-barber-gold/25 rounded-2xl px-4 py-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-barber-mute">Puntos</span>
            <span className="font-serif text-3xl text-barber-gold-3 leading-none">{pts}</span>
            <span className="text-[10px] text-barber-dim mt-0.5">
              {pts >= 50 ? '¡Corte gratis disponible!' : pts >= 30 ? '¡Descuento disponible!' : `${50 - pts} para corte gratis`}
            </span>
          </div>
          <div className="bg-barber-card border border-barber-border rounded-2xl px-4 py-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-barber-mute">Visitas</span>
            <span className="font-serif text-3xl text-barber-text leading-none">{visits}</span>
            <span className="text-[10px] text-barber-dim mt-0.5">
              {10 - (visits % 10)} para siguiente sello
            </span>
          </div>
        </div>

        {/* Loyalty progress */}
        <div className="bg-barber-card border border-barber-border rounded-2xl px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Tarjeta de sellos</span>
            <span className="text-xs font-bold text-barber-gold-2">{visits % 10} / 10</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i < visits % 10 ? 'bg-barber-gold' : 'bg-barber-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-barber-dim">
            {visits % 10 === 0 && visits > 0
              ? '¡Sello completado! Habla con tu barbero'
              : `${10 - (visits % 10)} visitas más para completar el sello`}
          </span>
        </div>

        {/* Member info */}
        <div className="bg-barber-card border border-barber-border rounded-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-widest uppercase text-barber-mute">Miembro desde</span>
            <span className="text-sm font-semibold text-barber-text capitalize">
              {client?.createdAt ? formatMemberSince(client.createdAt) : '—'}
            </span>
          </div>
          <BadgeIcon />
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full border border-barber-red/30 bg-barber-red/5 rounded-2xl py-4 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        >
          <LogoutIcon />
          <span className="text-sm font-bold text-barber-red">Cerrar sesión</span>
        </button>

        <div className="h-4" />
      </div>

      <BottomNav active="profile" />
    </div>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8 1.5 10.5 4 4 10.5H1.5v-2.5L8 1.5Z" stroke="#A9BDB6" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="#C98A7E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function BadgeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3 16.5 9l6.5.5-5 4.5 1.5 6.5L14 17l-5.5 3.5 1.5-6.5-5-4.5 6.5-.5L14 3Z" stroke="#C9A45C" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
