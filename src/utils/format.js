export function formatPrice(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
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
  'interior-plantas': 'Interior – Plantas',
  'interior-combos': 'Interior – Combos',
  exterior: 'Exterior',
  'exterior-plantas': 'Exterior – Plantas',
  'exterior-combos': 'Exterior – Combos',
  'exterior-frutales': 'Exterior – Frutales',
  'exterior-aromaticas': 'Exterior – Aromáticas',
  kits: 'Kits',
  insumos: 'Insumos',
  quimicos: 'Químicos',
  fertilizantes: 'Fertilizantes',
  macetas: 'Macetas',
  'macetas-plastico': 'Macetas – Plástico',
  'macetas-ceramica': 'Macetas – Cerámica',
  'macetas-terracota': 'Macetas – Terracota',
  'macetas-madera': 'Macetas – Madera',
  'macetas-colgante': 'Macetas – Colgante',
}

export const CATEGORY_ICONS = {
  interior: '🪴',
  'interior-plantas': '🪴',
  'interior-combos': '🎁',
  exterior: '🌳',
  'exterior-plantas': '🌳',
  'exterior-combos': '🎁',
  'exterior-frutales': '🍋',
  'exterior-aromaticas': '🌸',
  kits: '🎁',
  insumos: '🌱',
  quimicos: '🧪',
  fertilizantes: '🌿',
  macetas: '🏺',
  'macetas-plastico': '🏺',
  'macetas-ceramica': '🏺',
  'macetas-terracota': '🏺',
  'macetas-madera': '🏺',
  'macetas-colgante': '🏺',
}
