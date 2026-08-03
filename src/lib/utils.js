import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelative(date) {
  if (!date) return '—'
  const now = new Date()
  const then = new Date(date)
  if (isNaN(then.getTime())) return '—'
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status) {
  const map = {
    available: 'badge-success',
    borrowed: 'badge-warning',
    maintenance: 'badge-danger',
    reserved: 'badge-info',
    retired: 'badge-neutral',
    'in-use': 'badge-primary',
  }
  return map[status] || 'badge-neutral'
}

export function getConditionColor(condition) {
  const map = {
    excellent: 'badge-success',
    good: 'badge-info',
    fair: 'badge-warning',
    poor: 'badge-danger',
    damaged: 'badge-danger',
  }
  return map[condition] || 'badge-neutral'
}

export function truncate(text, length = 40) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10)
}
