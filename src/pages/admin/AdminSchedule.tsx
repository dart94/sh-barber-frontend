import { useEffect, useState, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  Schedule,
  getSchedule,
  adminCreateSchedule,
  adminUpdateSchedule,
  adminDeleteSchedule,
} from '../../lib/api'

const DAYS: { dow: number; label: string; short: string }[] = [
  { dow: 1, label: 'Lunes',     short: 'L' },
  { dow: 2, label: 'Martes',    short: 'M' },
  { dow: 3, label: 'Miércoles', short: 'X' },
  { dow: 4, label: 'Jueves',    short: 'J' },
  { dow: 5, label: 'Viernes',   short: 'V' },
  { dow: 6, label: 'Sábado',    short: 'S' },
  { dow: 0, label: 'Domingo',   short: 'D' },
]

function fmt12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

type ModalState = { mode: 'create'; dow: number } | { mode: 'edit'; schedule: Schedule } | null

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modal, setModal] = useState<ModalState>(null)
  const [openTime, setOpenTime] = useState('09:00')
  const [closeTime, setCloseTime] = useState('19:00')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toggling, setToggling] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<Schedule | null>(null)
  const [deleting, setDeleting] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  const byDow = Object.fromEntries(schedules.map((s) => [s.dayOfWeek, s]))

  useEffect(() => {
    getSchedule()
      .then(setSchedules)
      .catch(() => setError('No se pudo cargar los horarios'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!modal) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setModal(null); setFormError(null) } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modal])

  useEffect(() => {
    if (!confirmDel) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setConfirmDel(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [confirmDel])

  const openCreate = (dow: number) => {
    setOpenTime('09:00')
    setCloseTime('19:00')
    setFormError(null)
    setModal({ mode: 'create', dow })
  }

  const openEdit = (s: Schedule) => {
    setOpenTime(s.openTime)
    setCloseTime(s.closeTime)
    setFormError(null)
    setModal({ mode: 'edit', schedule: s })
  }

  const closeModal = () => { setModal(null); setFormError(null) }

  const handleSave = async () => {
    if (openTime >= closeTime) return setFormError('La hora de apertura debe ser antes del cierre')
    setSaving(true)
    setFormError(null)
    try {
      if (modal?.mode === 'create') {
        const created = await adminCreateSchedule({ dayOfWeek: modal.dow, openTime, closeTime })
        setSchedules((prev) => [...prev, created].sort((a, b) => a.dayOfWeek - b.dayOfWeek))
      } else if (modal?.mode === 'edit') {
        const updated = await adminUpdateSchedule(modal.schedule.id, { openTime, closeTime })
        setSchedules((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      }
      closeModal()
    } catch (e: unknown) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (s: Schedule) => {
    setToggling(s.id)
    try {
      const updated = await adminUpdateSchedule(s.id, { isActive: !s.isActive })
      setSchedules((prev) => prev.map((x) => x.id === s.id ? updated : x))
    } catch {
      setError('No se pudo actualizar el horario')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDel) return
    setDeleting(true)
    try {
      await adminDeleteSchedule(confirmDel.id)
      setSchedules((prev) => prev.filter((s) => s.id !== confirmDel.id))
      setConfirmDel(null)
    } catch {
      setError('No se pudo eliminar el horario')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="px-5 md:px-8 pb-8 pt-4 flex flex-col gap-4 max-w-4xl w-full">

        {/* Week strip summary */}
        <div className="flex gap-1.5">
          {DAYS.map(({ dow, short }) => {
            const s = byDow[dow]
            const active = s?.isActive
            return (
              <div
                key={dow}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl ${
                  active ? 'bg-barber-gold/15 border border-barber-gold/40' : 'bg-barber-card border border-barber-border'
                }`}
              >
                <span className={`text-[10px] font-bold ${active ? 'text-barber-gold-2' : 'text-barber-dim'}`}>
                  {short}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-barber-gold' : s ? 'bg-barber-dim' : 'bg-transparent'}`} />
              </div>
            )
          })}
        </div>

        {error && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3">
            <span className="text-sm text-barber-red">{error}</span>
          </div>
        )}

        {/* Day cards */}
        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-2xl bg-barber-card border border-barber-border animate-pulse" />
            ))
          ) : (
            DAYS.map(({ dow, label }) => {
              const s = byDow[dow]
              const isToggling = s ? toggling === s.id : false

              return (
                <div
                  key={dow}
                  className={`bg-barber-card border rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-opacity ${
                    s ? 'border-barber-border' : 'border-dashed border-barber-border/60'
                  } ${s && !s.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="w-20 shrink-0">
                    <span className={`text-sm font-bold ${s?.isActive ? 'text-barber-text' : s ? 'text-barber-sub' : 'text-barber-dim'}`}>
                      {label}
                    </span>
                  </div>

                  {s ? (
                    <>
                      <div className="flex-1 flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-barber-gold-2">{fmt12(s.openTime)}</span>
                        <span className="text-barber-dim text-xs">—</span>
                        <span className="text-sm font-semibold text-barber-gold-2">{fmt12(s.closeTime)}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggle(s)}
                          disabled={isToggling}
                          aria-label={s.isActive ? 'Desactivar día' : 'Activar día'}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 ${
                            s.isActive ? 'bg-barber-green/10' : 'bg-barber-muted'
                          }`}
                        >
                          {isToggling ? (
                            <span className="w-3 h-3 border border-barber-sub/40 border-t-barber-sub rounded-full animate-spin block" />
                          ) : s.isActive ? (
                            <CheckIcon color="#7FBFA0" />
                          ) : (
                            <CheckIcon color="#5E776F" />
                          )}
                        </button>

                        <button
                          onClick={() => openEdit(s)}
                          aria-label="Editar horario"
                          className="w-8 h-8 rounded-xl bg-barber-muted flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <EditIcon />
                        </button>

                        <button
                          onClick={() => setConfirmDel(s)}
                          aria-label="Eliminar horario"
                          className="w-8 h-8 rounded-xl bg-barber-red/10 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-xs text-barber-dim">Sin horario</span>
                      <button
                        onClick={() => openCreate(dow)}
                        className="flex items-center gap-1 bg-barber-muted border border-barber-border rounded-xl px-3 py-1.5 text-xs font-bold text-barber-sub active:scale-95 transition-transform"
                      >
                        <PlusIcon /> Agregar
                      </button>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <div
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) closeModal() }}
          className="fixed inset-0 bg-black/60 z-40 flex items-end md:items-center justify-center"
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-lg bg-barber-sidebar border-t md:border border-barber-border rounded-t-3xl md:rounded-3xl px-5 pt-5 pb-10 md:pb-5 flex flex-col gap-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-serif text-xl text-barber-text">
                  {modal.mode === 'create'
                    ? DAYS.find((d) => d.dow === modal.dow)?.label
                    : DAYS.find((d) => d.dow === modal.schedule.dayOfWeek)?.label}
                </span>
                <span className="text-xs text-barber-mute">
                  {modal.mode === 'create' ? 'Configurar horario' : 'Editar horario'}
                </span>
              </div>
              <button onClick={closeModal} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-barber-muted flex items-center justify-center">
                <CloseIcon />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sch-open" className="text-xs font-bold tracking-wider uppercase text-barber-sub">Apertura</label>
                <input
                  id="sch-open"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-barber-muted border border-barber-border rounded-xl px-4 py-3 text-sm text-barber-text focus:outline-none focus:border-barber-gold/60 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sch-close" className="text-xs font-bold tracking-wider uppercase text-barber-sub">Cierre</label>
                <input
                  id="sch-close"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-barber-muted border border-barber-border rounded-xl px-4 py-3 text-sm text-barber-text focus:outline-none focus:border-barber-gold/60 transition-colors"
                />
              </div>
            </div>

            {openTime && closeTime && openTime < closeTime && (
              <div className="bg-barber-gold/10 border border-barber-gold/25 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-barber-mute">Horario</span>
                <span className="text-sm font-bold text-barber-gold-2">
                  {fmt12(openTime)} — {fmt12(closeTime)}
                </span>
              </div>
            )}

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
              {saving ? 'Guardando...' : modal.mode === 'create' ? 'Guardar horario' : 'Actualizar horario'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div role="dialog" aria-modal="true" className="w-full max-w-sm bg-barber-sidebar border border-barber-border rounded-3xl p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-serif text-xl text-barber-text">¿Eliminar horario?</span>
              <span className="text-sm text-barber-mute">
                Se eliminará el horario de{' '}
                <strong className="text-barber-text-2">
                  {DAYS.find((d) => d.dow === confirmDel.dayOfWeek)?.label}
                </strong>
                . Los clientes no podrán agendar ese día.
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                className="flex-1 border border-barber-border rounded-xl py-3 text-sm font-bold text-barber-sub"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-barber-red/15 border border-barber-red/40 rounded-xl py-3 text-sm font-bold text-barber-red disabled:opacity-50"
              >
                {deleting ? '...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
      <path d="M1 5 5 9 12 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1l10 10M11 1 1 11" stroke="#8FA69F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
