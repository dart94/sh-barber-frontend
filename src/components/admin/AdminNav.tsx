import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/admin/dashboard', label: 'Citas', icon: CalendarIcon },
  { path: '/admin/servicios', label: 'Servicios', icon: ScissorsIcon },
  { path: '/admin/horarios', label: 'Horarios', icon: ClockIcon },
  { path: '/admin/clientes', label: 'Clientes', icon: UsersIcon },
]

export default function AdminNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="flex border-t border-barber-border bg-barber-sidebar px-2 pb-7 pt-3">
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <Icon active={active} />
            <span className={`text-[11px] font-${active ? '700' : '600'} ${active ? 'text-barber-gold-3' : 'text-barber-dim'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : '#5E776F'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2.5" stroke={c} strokeWidth="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ScissorsIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : '#5E776F'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5.5" cy="6.5" r="2" stroke={c} strokeWidth="1.4" />
      <circle cx="5.5" cy="13.5" r="2" stroke={c} strokeWidth="1.4" />
      <path d="M7.5 7.5 17 11M7.5 12.5 17 9" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : '#5E776F'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : '#5E776F'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="6" r="3" stroke={c} strokeWidth="1.5" />
      <path d="M2 17c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 3.5a3 3 0 0 1 0 5M17.5 17c-.4-2-1.8-3.5-3.5-4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
