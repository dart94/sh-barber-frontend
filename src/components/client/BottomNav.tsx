import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'

type Tab = 'home' | 'appointments' | 'points' | 'profile'

interface Props {
  active: Tab
}

export default function BottomNav({ active }: Props) {
  const navigate = useNavigate()

  const tabs: { id: Tab; label: string; path: string; icon: (active: boolean) => JSX.Element }[] = [
    { id: 'home', label: 'Inicio', path: '/', icon: HomeIcon },
    { id: 'appointments', label: 'Citas', path: '/citas', icon: CalendarIcon },
    { id: 'points', label: 'Puntos', path: '/puntos', icon: StarIcon },
    { id: 'profile', label: 'Perfil', path: '/perfil', icon: ProfileIcon },
  ]

  return (
    <div className="flex border-t border-barber-border bg-barber-sidebar px-2 pt-3" style={{ paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom, 0px))' }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            {tab.icon(isActive)}
            <span
              className={`text-[11px] font-${isActive ? '700' : '600'} ${
                isActive ? 'text-barber-gold-3' : 'text-barber-dim'
              }`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function HomeIcon(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 9.5 10 3l7 6.5V17h-5v-4.5H8V17H3V9.5Z" stroke={active ? '#E6C988' : '#5E776F'} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2.5" stroke={active ? '#E6C988' : '#5E776F'} strokeWidth="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke={active ? '#E6C988' : '#5E776F'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="m10 2.5 2.2 4.6 5 .7-3.6 3.5.9 5L10 13.9l-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5Z"
        stroke={active ? '#E6C988' : '#5E776F'}
        fill={active ? '#E6C988' : 'none'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileIcon(active: boolean) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6.5" r="3.5" stroke={active ? '#E6C988' : '#5E776F'} strokeWidth="1.5" />
      <path d="M3.5 17.5c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" stroke={active ? '#E6C988' : '#5E776F'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
