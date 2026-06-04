export function formatDate(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return formatDate(d)
}
