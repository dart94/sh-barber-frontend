const HERMOSILLO_OFFSET_MS = 7 * 60 * 60 * 1000

export const toHermosillo = (date: Date): Date =>
  new Date(date.getTime() - HERMOSILLO_OFFSET_MS)

export const formatTime12 = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export const formatDateEs = (iso: string): string => {
  const d = toHermosillo(new Date(iso))
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
