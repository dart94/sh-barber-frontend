import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices, Service } from '../../../lib/api'

export default function Step1Service() {
  const [services, setServices] = useState<Service[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false))
  }, [])

  const selectedService = services.find((s) => s.id === selected)

  const handleContinue = () => {
    if (!selectedService) return
    navigate('/agendar/fecha', { state: { service: selectedService } })
  }

  return (
    <div className="min-h-screen bg-barber-bg flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-5 pt-16 pb-4 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
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
            <div className="flex-1 h-1 rounded-full bg-white/10" />
            <div className="flex-1 h-1 rounded-full bg-white/10" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-barber-gold-2">
            Paso 1 de 3 · Elige tu servicio
          </span>
        </div>

        {/* Services */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-barber-gold/30 border-t-barber-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((service) => {
              const isSelected = selected === service.id
              return (
                <button
                  key={service.id}
                  onClick={() => setSelected(service.id)}
                  className={`w-full text-left rounded-[18px] p-5 flex items-center gap-4 transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#16403A] to-barber-card border-barber-gold shadow-[0_8px_24px_rgba(201,164,92,0.12)]'
                      : 'bg-barber-card border-barber-border'
                  }`}
                >
                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[17px] font-bold text-barber-text">
                        {service.name}
                      </span>
                    </div>
                    <span className="text-sm text-barber-mute">
                      {service.duration} min{service.description ? ` · ${service.description}` : ''}
                    </span>
                  </div>

                  {/* Price */}
                  <span className="font-serif text-[22px] text-barber-gold-3 shrink-0">
                    ${service.price.toFixed(0)}
                  </span>

                  {/* Radio */}
                  <div
                    className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-barber-gold'
                        : 'border border-white/20'
                    }`}
                  >
                    {isSelected && <CheckIcon />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-10 pt-2">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full bg-gradient-to-r from-barber-gold to-[#A8843D] rounded-2xl py-4 text-base font-extrabold text-barber-bg shadow-[0_10px_28px_rgba(201,164,92,0.25)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
      <path d="M8 1 1.5 7.5 8 14" stroke="#C9A45C" strokeWidth="1.8" strokeLinecap="round" />
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
