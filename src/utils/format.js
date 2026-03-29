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
  interior:          'Interior',
  exterior:          'Exterior',
  insumos:           'Insumos',
  quimicos:          'Químicos',
  fertilizantes:     'Fertilizantes',
  macetas:           'Macetas',
  'macetas-plastico':  'Plástico',
  'macetas-ceramica':  'Cerámica',
  'macetas-terracota': 'Terracota',
  'macetas-madera':    'Madera',
  'macetas-colgante':  'Colgante',
}

export const CATEGORY_ICONS = {
  interior:          '🪴',
  exterior:          '🌳',
  insumos:           '🌱',
  quimicos:          '🧪',
  fertilizantes:     '🌿',
  macetas:           '🏺',
  'macetas-plastico':  '🏺',
  'macetas-ceramica':  '🏺',
  'macetas-terracota': '🏺',
  'macetas-madera':    '🏺',
  'macetas-colgante':  '🏺',
}
