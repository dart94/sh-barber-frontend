const BASE = (import.meta.env.VITE_API_URL ?? 'https://sh-barber-backend-production.up.railway.app') + '/api'

async function request<T>(path: string, options?: RequestInit, tokenKey = 'client_token'): Promise<T> {
  const token = localStorage.getItem(tokenKey)
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
  return data as T
}

const adminRequest = <T>(path: string, options?: RequestInit) =>
  request<T>(path, options, 'admin_token')

// ── Client Auth ──────────────────────────────────────────
export type Client = {
  id: string
  name: string
  phone: string
  visits: number
  points: number
  createdAt: string
}

export const clientAuth = (phone: string) =>
  request<{ exists: boolean; token?: string; client?: Client }>('/clients/auth', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })

export const clientRegister = (name: string, phone: string) =>
  request<{ token: string; client: Client }>('/clients', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  })

export const getClientMe = () => request<Client>('/clients/me')

export const updateClientMe = (name: string) =>
  request<Client>('/clients/me', { method: 'PUT', body: JSON.stringify({ name }) })

// ── Services ─────────────────────────────────────────────
export type Service = {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  isActive: boolean
}

export const getServices = () => request<Service[]>('/services')

// ── Schedule ─────────────────────────────────────────────
export type Schedule = {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isActive: boolean
}

export const getSchedule = () => request<Schedule[]>('/schedule')

// ── Appointments ─────────────────────────────────────────
export type Appointment = {
  id: string
  scheduledAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  isFree: boolean
  notes: string | null
  client: Client
  service: Service
}

export type Slot = { time: string; datetime: string; available: boolean }

export const getSlots = (date: string, serviceId: string) =>
  request<{ available: boolean; slots: Slot[] }>(`/appointments/slots?date=${date}&serviceId=${serviceId}`)

export const createAppointment = (data: {
  clientId: string
  serviceId: string
  scheduledAt: string
  notes?: string
}) =>
  request<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getMyAppointments = () => request<Appointment[]>('/appointments/mine')

// ── Loyalty ───────────────────────────────────────────────
export type Reward = { type: string; points: number; description: string }

export type Loyalty = {
  clientId: string
  name: string
  visits: number
  points: number
  availableRewards: Reward[]
}

export const getLoyalty = (clientId: string) =>
  request<Loyalty>(`/loyalty/${clientId}`)

export const redeemLoyalty = (clientId: string, type: string) =>
  request<{ message: string; pointsUsed: number; pointsRemaining: number }>(
    `/loyalty/${clientId}/redeem`,
    { method: 'POST', body: JSON.stringify({ type }) }
  )

// ── Admin Schedule ────────────────────────────────────────
export const adminCreateSchedule = (data: { dayOfWeek: number; openTime: string; closeTime: string }) =>
  adminRequest<Schedule>('/schedule', { method: 'POST', body: JSON.stringify(data) })

export const adminUpdateSchedule = (id: string, data: Partial<{ openTime: string; closeTime: string; isActive: boolean }>) =>
  adminRequest<Schedule>(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const adminDeleteSchedule = (id: string) =>
  adminRequest<void>(`/schedule/${id}`, { method: 'DELETE' })

// ── Admin Services ────────────────────────────────────────
export const adminCreateService = (data: { name: string; description?: string; price: number; duration: number }) =>
  adminRequest<Service>('/services', { method: 'POST', body: JSON.stringify(data) })

export const adminUpdateService = (id: string, data: Partial<{ name: string; description: string; price: number; duration: number; isActive: boolean }>) =>
  adminRequest<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const adminDeleteService = (id: string) =>
  adminRequest<Service>(`/services/${id}`, { method: 'DELETE' })

// ── Admin Clients ─────────────────────────────────────────
export const adminGetClients = () => adminRequest<Client[]>('/clients')

// ── Admin Appointments ────────────────────────────────────
export const getAdminAppointments = (date?: string, clientId?: string) => {
  const params = new URLSearchParams()
  if (date) params.set('date', date)
  if (clientId) params.set('clientId', clientId)
  const qs = params.toString()
  return adminRequest<Appointment[]>(`/appointments${qs ? `?${qs}` : ''}`)
}

export const adminConfirmAppointment = (id: string) =>
  adminRequest<Appointment>(`/appointments/${id}/confirm`, { method: 'PATCH' })

export const adminCancelAppointment = (id: string) =>
  adminRequest<Appointment>(`/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({}) })

export const adminCompleteAppointment = (id: string) =>
  adminRequest<Appointment>(`/appointments/${id}/complete`, { method: 'PATCH' })

// ── Admin Auth ────────────────────────────────────────────
export type AdminUser = { id: string; name: string; email: string; role: string }

export const adminLogin = (email: string, password: string) =>
  adminRequest<{ token: string; user: AdminUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
