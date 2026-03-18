export function formatPrice(amount) {
  return new Intl.NumberFormat('es-AR', {
    style:    'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPriceCompact(amount) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`
  return `$${amount}`
}

export function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
}

export const CATEGORY_LABELS = {
  interior: 'Interior',
  exterior: 'Exterior',
  insumos:  'Insumos',
}

export const CATEGORY_ICONS = {
  interior: '🪴',
  exterior: '🌳',
  insumos:  '🌱',
}
