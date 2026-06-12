import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AdminUser } from '../lib/api'

interface AdminAuthContextType {
  admin: AdminUser | null
  token: string | null
  loginAdmin: (token: string, user: AdminUser) => void
  logoutAdmin: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')
    if (stored && storedUser) {
      try {
        setAdmin(JSON.parse(storedUser))
        setToken(stored)
      } catch {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
  }, [])

  const loginAdmin = (newToken: string, user: AdminUser) => {
    localStorage.setItem('admin_token', newToken)
    localStorage.setItem('admin_user', JSON.stringify(user))
    setToken(newToken)
    setAdmin(user)
  }

  const logoutAdmin = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken(null)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
