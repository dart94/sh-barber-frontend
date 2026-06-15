import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import AdminNav from './AdminNav'

const TABS = [
  { path: '/admin/dashboard', label: 'Citas',     icon: CalendarIcon },
  { path: '/admin/servicios', label: 'Servicios', icon: ScissorsIcon },
  { path: '/admin/horarios',  label: 'Horarios',  icon: ClockIcon },
  { path: '/admin/clientes',  label: 'Clientes',  icon: UsersIcon },
]

const PAGE_TITLE: Record<string, string> = {
  '/admin/dashboard': 'Citas',
  '/admin/servicios': 'Servicios',
  '/admin/horarios':  'Horarios',
  '/admin/clientes':  'Clientes',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, logoutAdmin } = useAdminAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-barber-bg flex">

      {/* ── Sidebar (md+) ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-barber-sidebar border-r border-barber-border z-20">
        {/* Logo + admin */}
        <div className="px-4 py-5 border-b border-barber-border">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="SH Barbería" className="w-10 h-10 rounded-xl border border-barber-gold/30 shrink-0" />
            <div className="min-w-0">
              <div className="font-serif text-sm text-barber-text leading-tight">SH Barbería</div>
              <div className="text-[10px] text-barber-mute truncate leading-tight mt-0.5">
                {admin?.role === 'ADMIN' ? 'Administrador' : 'Barbero'} · {admin?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
          {TABS.map(({ path, label, icon: Icon }) => {
            const active = pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  active
                    ? 'bg-barber-gold/10 text-barber-gold-2'
                    : 'text-barber-sub hover:bg-barber-card hover:text-barber-text'
                }`}
              >
                <Icon active={active} />
                <span className={`text-sm ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-barber-border">
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-barber-dim hover:bg-barber-card hover:text-barber-sub transition-colors"
          >
            <LogoutIcon />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────── */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-5 pt-12 pb-3 bg-barber-sidebar border-b border-barber-border">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="SH Barbería" className="w-8 h-8 rounded-lg border border-barber-gold/30" />
            <span className="font-serif text-base text-barber-text">
              {PAGE_TITLE[pathname] ?? 'Admin'}
            </span>
          </div>
          <button
            onClick={logoutAdmin}
            className="w-9 h-9 rounded-full bg-barber-card border border-barber-border flex items-center justify-center"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Desktop page header */}
        <div className="hidden md:block px-8 pt-8 pb-2">
          <h1 className="font-serif text-2xl text-barber-text">
            {PAGE_TITLE[pathname] ?? 'Admin'}
          </h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden">
          <AdminNav />
        </div>
      </div>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : 'currentColor'
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2.5" stroke={c} strokeWidth="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ScissorsIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : 'currentColor'
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="5.5" cy="6.5" r="2" stroke={c} strokeWidth="1.4" />
      <circle cx="5.5" cy="13.5" r="2" stroke={c} strokeWidth="1.4" />
      <path d="M7.5 7.5 17 11M7.5 12.5 17 9" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : 'currentColor'
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  const c = active ? '#E6C988' : 'currentColor'
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="6" r="3" stroke={c} strokeWidth="1.5" />
      <path d="M2 17c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 3.5a3 3 0 0 1 0 5M17.5 17c-.4-2-1.8-3.5-3.5-4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
