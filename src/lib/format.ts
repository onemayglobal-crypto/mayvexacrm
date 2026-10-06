export function rupeesToLakhs(value: number) {
  if (!Number.isFinite(value) || value === 0) return '₹0'
  const lakhs = value / 100_000
  const abs = Math.abs(lakhs)
  const formatted =
    abs >= 10 ? lakhs.toFixed(0) : abs >= 1 ? lakhs.toFixed(1) : lakhs.toFixed(2)
  return `₹${formatted.replace(/\.0$/, '')}L`
}

export function rupees(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function daysFrom(iso?: string) {
  if (!iso) return null
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  then.setHours(0, 0, 0, 0)
  return Math.round((then.getTime() - today.getTime()) / 86_400_000)
}

export function shortDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
