export function formatDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function isToday(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  const date = new Date(dateStr + 'T12:00:00')
  return date.toDateString() === today.toDateString()
}

export function isTomorrow(dateStr) {
  if (!dateStr) return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const date = new Date(dateStr + 'T12:00:00')
  return date.toDateString() === tomorrow.toDateString()
}

export function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + 'T12:00:00')
  return date < today
}

export function isThisWeek(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  const date = new Date(dateStr + 'T12:00:00')
  return date >= today && date <= weekEnd
}

export function dueDateLabel(dateStr, status) {
  if (!dateStr) return null
  if (isOverdue(dateStr, status)) return { text: 'overdue', variant: 'danger' }
  if (isToday(dateStr)) return { text: 'today', variant: 'warning' }
  if (isTomorrow(dateStr)) return { text: 'tomorrow', variant: 'warning' }
  return { text: formatDate(dateStr), variant: 'default' }
}
