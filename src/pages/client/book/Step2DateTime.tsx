import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSlots, Slot, Service } from '../../../lib/api'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toHermosilloDate(date: Date) {
  return new Date(date.getTime() - 7 * 60 * 60 * 1000)
}

function formatDateKey(date: Date) {
  const d = toHermosilloDate(date)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildWeek(offset: number) {
  const today = new Date()
  const days: Date[] = []
  for (let i = offset; i < offset + 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

function formatTime12(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function Step2DateTime() {
  const navigate = useNavigate()
  const location = useLocation()
  const service = (location.state as { service: Service })?.service

  const [weekOffset, setWeekOffset] = useState(1) // start from tomorrow
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [noSchedule, setNoSchedule] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  const week = buildWeek(weekOffset)

  useEffect(() => {
    if (!service) navigate('/agendar', { replace: true })
  }, [service, navigate])

  useEffect(() => {
    if (!selectedDate || !service) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    setNoSchedule(false)
    setSlotsError(null)
    getSlots(formatDateKey(selectedDate), service.id)
      .then((res) => {
        if (!res.available) { setNoSchedule(true); setSlots([]) }
        else setSlots(res.slots)
      })
      .catch(() => setSlotsError('No se pudieron cargar los horarios'))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, service])

  const morningSlots = slots.filter((s) => {
    const h = parseInt(s.time.split(':')[0])
    return h < 12
  })
  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.time.split(':')[0])
    return h >= 12
  })

  const hermosilloToday = toHermosilloDate(new Date())
  const currentMonth = selectedDate
    ? MONTHS_ES[toHermosilloDate(selectedDate).getUTCMonth()]
    : MONTHS_ES[hermosilloToday.getUTCMonth()]

  const handleContinue = () => {
    if (!selectedSlot || !service) return
    navigate('/agendar/confirmar', {
      state: { service, slot: selectedSlot },
    })
  }

  if (!service) return null

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-16 pb-4 flex flex-col gap-5 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/agendar')}
            className="w-10 h-10 rounded-full bg-barber-card border border-barber-border flex items-center justify-center shrink-0"
          >
            <ChevronLeft />
          </button>
          <span className="font-serif text-2xl text-barber-text">Agendar cita</span>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            <div className="flex-1 h-1 rounded-full bg-barber-gold" />
            <div className="flex-1 h-1 rounded-full bg-barber-gold" />
            <div className="flex-1 h-1 rounded-full bg-white/10" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-barber-gold-2">
            Paso 2 de 3 · Fecha y hora
          </span>
        </div>

        {/* Month + nav */}
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg text-barber-text-2">{currentMonth}</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setWeekOffset((w) => Math.max(1, w - 7)); setSelectedDate(null) }}
              disabled={weekOffset <= 1}
              className="w-8 h-8 rounded-full bg-barber-card flex items-center justify-center disabled:opacity-30"
            >
              <svg width="7" height="12" viewBox="0 0 8 14" fill="none"><path d="M7 1 1 7l6 6" stroke="#8FA69F" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
            <button
              onClick={() => { setWeekOffset((w) => w + 7); setSelectedDate(null) }}
              disabled={weekOffset > 21}
              className="w-8 h-8 rounded-full bg-barber-card flex items-center justify-center disabled:opacity-30"
            >
              <svg width="7" height="12" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#C9A45C" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* Day picker */}
        <div className="flex gap-2">
          {week.map((date) => {
            const local = toHermosilloDate(date)
            const dayName = DAYS_ES[local.getUTCDay()]
            const dayNum = local.getUTCDate()
            const isSelected = selectedDate && formatDateKey(date) === formatDateKey(selectedDate)

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 rounded-2xl py-2.5 flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-barber-gold to-[#A8843D] shadow-[0_6px_18px_rgba(201,164,92,0.3)]'
                    : 'bg-barber-card border border-barber-border'
                }`}
              >
                <span className={`text-[11px] ${isSelected ? 'font-extrabold text-barber-bg' : 'font-semibold text-barber-dim'}`}>
                  {dayName}
                </span>
                <span className={`text-base ${isSelected ? 'font-extrabold text-barber-bg' : 'font-bold text-barber-mute'}`}>
                  {dayNum}
                </span>
              </button>
            )
          })}
        </div>

        {/* Slots */}
        {!selectedDate && (
          <p className="text-sm text-barber-mute text-center mt-4">Selecciona un día para ver horarios</p>
        )}

        {selectedDate && loadingSlots && (
          <div className="flex justify-center mt-4">
            <div className="w-7 h-7 border-2 border-barber-gold/30 border-t-barber-gold rounded-full animate-spin" />
          </div>
        )}

        {selectedDate && !loadingSlots && slotsError && (
          <div className="bg-barber-red/10 border border-barber-red/30 rounded-2xl px-4 py-3 mt-2">
            <span className="text-sm text-barber-red">{slotsError}</span>
          </div>
        )}

        {selectedDate && !loadingSlots && !slotsError && noSchedule && (
          <p className="text-sm text-barber-mute text-center mt-4">No hay horario disponible este día</p>
        )}

        {selectedDate && !loadingSlots && !slotsError && !noSchedule && slots.length === 0 && (
          <p className="text-sm text-barber-mute text-center mt-4">No hay horarios disponibles</p>
        )}

        {selectedDate && !loadingSlots && slots.length > 0 && (
          <div className="flex flex-col gap-4">
            {morningSlots.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Mañana</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {morningSlots.map((slot) => <SlotBtn key={slot.time} slot={slot} selected={selectedSlot?.time === slot.time} onSelect={setSelectedSlot} />)}
                </div>
              </div>
            )}
            {afternoonSlots.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold tracking-widest uppercase text-barber-mute">Tarde</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {afternoonSlots.map((slot) => <SlotBtn key={slot.time} slot={slot} selected={selectedSlot?.time === slot.time} onSelect={setSelectedSlot} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-5 pb-10 pt-3 flex flex-col gap-3 ${selectedSlot ? 'border-t border-barber-border bg-barber-sidebar' : ''}`}>
        {selectedSlot && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-barber-mute">
              {service.name} · {formatTime12(selectedSlot.time)}
            </span>
            <span className="font-serif text-lg text-barber-gold-3">${service.price.toFixed(0)}</span>
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={!selectedSlot}
          className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          Confirmar cita
        </button>
      </div>
    </div>
  )
}

function SlotBtn({ slot, selected, onSelect }: { slot: Slot; selected: boolean; onSelect: (s: Slot) => void }) {
  const label = formatTime12(slot.time)
  if (!slot.available) {
    return (
      <button
        disabled
        aria-disabled="true"
        aria-label="Horario no disponible"
        className="rounded-xl py-3 text-center text-sm font-bold bg-barber-muted border border-barber-border/40 text-barber-dim line-through cursor-not-allowed"
      >
        {label}
      </button>
    )
  }
  return (
    <button
      onClick={() => onSelect(slot)}
      className={`rounded-xl py-3 text-center text-sm font-bold transition-all ${
        selected
          ? 'bg-gradient-to-b from-barber-gold to-[#A8843D] text-barber-bg shadow-[0_6px_18px_rgba(201,164,92,0.3)] font-extrabold'
          : 'bg-barber-card border border-barber-border text-barber-text active:scale-95'
      }`}
    >
      {label}
    </button>
  )
}

function ChevronLeft() {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
      <path d="M8 1 1.5 7.5 8 14" stroke="#C9A45C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
