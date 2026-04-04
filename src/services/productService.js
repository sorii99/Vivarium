export const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  {
    id: 'interior', label: 'Interior', children: [
      { id: 'interior-plantas', label: 'Plantas' },
      { id: 'interior-combos', label: 'Combos' },
    ]
  },
  {
    id: 'exterior', label: 'Exterior', children: [
      { id: 'exterior-plantas', label: 'Plantas' },
      { id: 'exterior-combos', label: 'Combos' },
      { id: 'exterior-frutales', label: 'Frutales' },
      { id: 'exterior-aromaticas', label: 'Aromáticas' },
    ]
  },
  { id: 'kits', label: 'Kits' },
  { id: 'insumos', label: 'Insumos' },
  { id: 'quimicos', label: 'Químicos' },
  { id: 'fertilizantes', label: 'Fertilizantes' },
  {
    id: 'macetas', label: 'Macetas', children: [
      { id: 'macetas-plastico', label: 'Plástico' },
      { id: 'macetas-ceramica', label: 'Cerámica' },
      { id: 'macetas-terracota', label: 'Terracota' },
      { id: 'macetas-madera', label: 'Madera' },
      { id: 'macetas-colgante', label: 'Colgante' },
    ]
  },
]

export const ALL_CATEGORY_IDS = CATEGORIES.flatMap(c =>
  c.children ? c.children.map(sc => sc.id) : (c.id !== 'all' ? [c.id] : [])
)

export const CATEGORY_OPTIONS = CATEGORIES
  .filter(c => c.id !== 'all')
  .flatMap(c => c.children
    ? [
      { id: c.id, label: c.label, isParent: true },
      ...c.children.map(sc => ({ id: sc.id, label: `${c.label} – ${sc.label}`, isParent: false })),
    ]
    : [{ id: c.id, label: c.label, isParent: false }]
  )
