import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Client, getClientMe } from '../lib/api'

interface ClientAuthContextType {
  client: Client | null
  token: string | null
  loading: boolean
  login: (token: string, client: Client) => void
  logout: () => void
  refresh: () => Promise<void>
}

const ClientAuthContext = createContext<ClientAuthContextType | null>(null)

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('client_token'))
  const [loading, setLoading] = useState(true)

  const login = (newToken: string, newClient: Client) => {
    localStorage.setItem('client_token', newToken)
    setToken(newToken)
    setClient(newClient)
  }

  const logout = () => {
    localStorage.removeItem('client_token')
    setToken(null)
    setClient(null)
  }

  const refresh = async () => {
    if (!localStorage.getItem('client_token')) return
    try {
      const me = await getClientMe()
      setClient(me)
    } catch {
      logout()
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('client_token')
    if (!stored) {
      setLoading(false)
      return
    }
    getClientMe()
      .then(setClient)
      .catch(logout)
      .finally(() => setLoading(false))
  }, [])

  return (
    <ClientAuthContext.Provider value={{ client, token, loading, login, logout, refresh }}>
      {children}
    </ClientAuthContext.Provider>
  )
}

export const useClientAuth = () => {
  const ctx = useContext(ClientAuthContext)
  if (!ctx) throw new Error('useClientAuth must be used inside ClientAuthProvider')
  return ctx
}
