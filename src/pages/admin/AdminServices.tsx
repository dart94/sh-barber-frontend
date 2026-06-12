import { useEffect, useState, useRef } from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import AdminNav from '../../components/admin/AdminNav'
import {
  Service,
  getServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
} from '../../lib/api'

type FormData = { name: string; description: string; price: string; duration: string }
const EMPTY: FormData = { name: '', description: '', price: '', duration: '' }

export default function AdminServices() {
  const { admin, logoutAdmin } = useAdminAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modal, setModal] = useState<'closed' | 'create' | 'edit'>('closed')
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toggle acting
  const [toggling, setToggling] = useState<string | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)

  const load = () => {
    setLoading(true)
    getServices()
      .then(setServices)
      .catch(() => setError('No se pudo cargar los servicios'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm(EMPTY)
    setFormError(null)
    setEditing(null)
    setModal('create')
  }

  const openEdit = (s: Service) => {
    setForm({
      name: s.name,
      description: s.description ?? '',
      price: String(s.price),
      duration: String(s.duration),
    })
    setFormError(null)
    setEditing(s)
    setModal('edit')
  }

  const closeModal = () => {
    setModal('closed')
    setEditing(null)
    setFormError(null)
  }

  const handleSave = async () => {
    const name = form.name.trim()
    const price = parseFloat(form.price)
    const duration = parseInt(form.duration, 10)

    if (!name) return setFormError('El nombre es requerido')
    if (isNaN(price) || price <= 0) return setFormError('Precio inválido')
    if (isNaN(duration) || duration <= 0) return setFormError('Duración inválida')

    setSaving(true)
    setFormError(null)
    try {
      const data = { name, description: form.description.trim() || undefined, price, duration }
      if (modal === 'create') {
        const created = await adminCreateService(data)
        setServices((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      } else if (editing) {
        const updated = await adminUpdateService(editing.id, data)
        setServices((prev) => prev.map((s) => (s.id === editing.id ? updated : s)))
      }
      closeModal()
    } catch (e: unknown) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (s: Service) => {
    setToggling(s.id)
    try {
      const updated = await adminUpdateService(s.id, { isActive: !s.isActive })
      setServices((prev) => prev.map((x) => (x.id === s.id ? updated : x)))
    } catch {
      setError('No se pudo actualizar el servicio')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await adminDeleteService(confirmDelete.id)
      setServices((prev) => prev.map((s) => s.id === confirmDelete.id ? { ...s, isActive: false } : s))
      setConfirmDelete(null)
    } catch {
      setError('No se pudo eliminar el servicio')
    } finally {
      setDeleting(false)
    }
  }

  const active = services.filter((s) => s.isActive)
  const inactive = services.filter((s) => !s.isActive)

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-lg mx-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="SH Barbería" className="w-9 h-9 rounded-xl border border-barber-gold/30" />
          <div className="flex flex-col">
            <span className="font-serif text-base text-barber-text leading-tight">Servicios</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-barber-mute leading-tight">
              {admin?.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-xl px-3 py-2 text-xs font-extrabold text-barber-bg active:scale-95 transition-transform"
          >
            <PlusIcon /> Nuevo
          </button>
          <button
            onClick={logoutAdmin}
            className="w-9 h-9 rounded-full bg-barber-card border border-barber-border flex items-center justify-center"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 flex flex-col gap-5 overflow-y-auto">

        {error && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
          ))
        ) : (
          <>
            {/* Active */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">
                Activos ({active.length})
              </span>
              {active.length === 0 ? (
                <div className="bg-barber-card border border-barber-border rounded-2xl px-5 py-6 text-center">
                  <span className="text-sm text-barber-mute">Sin servicios activos</span>
                </div>
              ) : (
                active.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    toggling={toggling === s.id}
                    onEdit={() => openEdit(s)}
                    onToggle={() => handleToggle(s)}
                    onDelete={() => setConfirmDelete(s)}
                  />
                ))
              )}
            </div>

            {/* Inactive */}
            {inactive.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">
                  Inactivos ({inactive.length})
                </span>
                {inactive.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    toggling={toggling === s.id}
                    onEdit={() => openEdit(s)}
                    onToggle={() => handleToggle(s)}
                    onDelete={() => setConfirmDelete(s)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <div className="h-2" />
      </div>

      <AdminNav />

      {/* Create / Edit modal */}
      {modal !== 'closed' && (
        <div
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) closeModal() }}
          className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center"
        >
          <div className="w-full max-w-lg bg-barber-sidebar border-t border-barber-border rounded-t-3xl px-5 pt-5 pb-10 flex flex-col gap-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl text-barber-text">
                {modal === 'create' ? 'Nuevo servicio' : 'Editar servicio'}
              </span>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-barber-muted flex items-center justify-center">
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Field label="Nombre" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Corte de cabello"
                  className={inputCls}
                />
              </Field>

              <Field label="Descripción (opcional)">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descripción del servicio"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio ($)" required>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="150"
                    className={inputCls}
                  />
                </Field>
                <Field label="Duración (min)" required>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="45"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {formError && (
              <div className="bg-barber-red/10 border border-barber-red/30 rounded-xl px-4 py-2.5">
                <span className="text-sm text-barber-red">{formError}</span>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-xl py-3.5 text-sm font-extrabold text-barber-bg disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {saving ? 'Guardando...' : modal === 'create' ? 'Crear servicio' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="w-full max-w-sm bg-barber-sidebar border border-barber-border rounded-3xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-serif text-xl text-barber-text">¿Desactivar servicio?</span>
              <span className="text-sm text-barber-mute">
                <strong className="text-barber-text-2">{confirmDelete.name}</strong> dejará de aparecer para los clientes.
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-barber-border rounded-xl py-3 text-sm font-bold text-barber-sub"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-barber-red/15 border border-barber-red/40 rounded-xl py-3 text-sm font-bold text-barber-red disabled:opacity-50"
              >
                {deleting ? '...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls =
  'w-full bg-barber-muted border border-barber-border rounded-xl px-4 py-3 text-sm text-barber-text placeholder-barber-dim focus:outline-none focus:border-barber-gold/60 transition-colors'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold tracking-wider uppercase text-barber-sub">
        {label}{required && <span className="text-barber-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function ServiceCard({
  service, toggling, onEdit, onToggle, onDelete,
}: {
  service: Service
  toggling: boolean
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className={`bg-barber-card border rounded-2xl p-4 flex flex-col gap-3 transition-opacity ${service.isActive ? 'border-barber-border' : 'border-barber-border opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-bold text-barber-text truncate">{service.name}</span>
          {service.description && (
            <span className="text-xs text-barber-mute line-clamp-1">{service.description}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-xl bg-barber-muted flex items-center justify-center active:scale-90 transition-transform"
          >
            <EditIcon />
          </button>
          <button
            onClick={onToggle}
            disabled={toggling}
            className="w-8 h-8 rounded-xl bg-barber-muted flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            title={service.isActive ? 'Desactivar' : 'Activar'}
          >
            {toggling ? (
              <span className="w-3 h-3 border border-barber-sub/40 border-t-barber-sub rounded-full animate-spin block" />
            ) : service.isActive ? (
              <EyeOffIcon />
            ) : (
              <EyeIcon />
            )}
          </button>
          {service.isActive && (
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl bg-barber-red/10 flex items-center justify-center active:scale-90 transition-transform"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-lg text-barber-gold-3">${service.price.toFixed(0)}</span>
        </div>
        <div className="w-px h-4 bg-barber-border" />
        <span className="text-xs text-barber-sub">{service.duration} min</span>
        <div className="w-px h-4 bg-barber-border" />
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${service.isActive ? 'text-barber-green bg-barber-green/10' : 'text-barber-dim bg-barber-muted'}`}>
          {service.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1v10M1 6h10" stroke="#0B2422" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="#8FA69F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9.5 2.5 11.5 4.5 4.5 11.5H2.5v-2L9.5 2.5Z" stroke="#A9BDB6" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="#C98A7E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 7s2-4.5 6-4.5S13 7 13 7s-2 4.5-6 4.5S1 7 1 7Z" stroke="#A9BDB6" strokeWidth="1.3" />
      <circle cx="7" cy="7" r="1.8" stroke="#A9BDB6" strokeWidth="1.3" />
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 1l12 12M5.5 5.6A1.8 1.8 0 0 0 8.4 8.4M3.5 3.7C2 4.8 1 7 1 7s2 4.5 6 4.5c1.2 0 2.2-.3 3.1-.8M10 9.8C11.9 8.7 13 7 13 7s-2-4.5-6-4.5c-.6 0-1.2.1-1.7.2" stroke="#A9BDB6" strokeWidth="1.3" strokeLinecap="round" />
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
