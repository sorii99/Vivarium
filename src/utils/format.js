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
  'interior-plantas': 'Plantas de interior',
  'interior-combos': 'Combos de interior',
  exterior: 'Exterior',
  'exterior-plantas': 'Plantas de exterior',
  'exterior-combos': 'Combos de exterior',
  'exterior-frutales': 'Frutales',
  'exterior-aromaticas': 'Aromáticas',
  kits: 'Kits',
  insumos: 'Insumos y Ornamentos',
  quimicos: 'Químicos',
  fertilizantes: 'Fertilizantes',
  macetas: 'Macetas',
  'macetas-plastico': 'Macetas de plástico',
  'macetas-ceramica': 'Macetas de cerámica',
  'macetas-terracota': 'Macetas de terracota',
  'macetas-madera': 'Macetas de madera',
  'macetas-colgante': 'Macetas colgantes',
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
