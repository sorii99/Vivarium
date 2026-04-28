import { useState, useRef, useCallback, memo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useInventoryStore, fileToDataUrl } from '@/context/InventoryContext'
import { uploadImage, isSupabaseEnabled } from '@/services/supabase'
import { useInventory } from '@/hooks/useProducts'
import { formatPrice, CATEGORY_LABELS } from '@/utils/format'
import { CATEGORIES, CATEGORY_OPTIONS } from '@/services/productService'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')
const CAT_OPTS = CATEGORY_OPTIONS
const EMPTY = { name: '', category: 'interior-plantas', description: '', riego: '', sustrato: '', cuidado: '', priceRetail: '', priceWholesale: '', minWholesaleQty: '1', stock: '', unit: 'planta', images: [], featured: false }

function LabeledInput({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-botanica-500 dark:text-botanica-400 mb-1 font-medium">{label}</label>
      {children}
    </div>
  )
}

function EditField({ field, type = 'text', as = 'input', opts = [], className = '', value, onChange }) {
  if (as === 'select') return (
    <select value={value ?? ''} onChange={e => onChange(field, e.target.value)}
      className={clsx('input-field py-2 text-sm', className)}>
      {(opts || []).filter(o => !o.isParent).map(o => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  )
  return (
    <input type={type} value={value ?? ''} onChange={e => onChange(field, e.target.value)}
      onWheel={type === 'number' ? e => e.target.blur() : undefined}
      className={clsx('input-field py-2 text-sm',
        type === 'number' && '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        className)}
      min={type === 'number' ? 0 : undefined}
    />
  )
}

function ImageUploader({ images, onChange }) {
  const fileRef = useRef()
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const MAX_IMAGES = 3

  const addUrl = () => {
    const url = urlInput.trim()
    if (!url || images.length >= MAX_IMAGES) return
    onChange([...images, url])
    setUrlInput('')
  }

  const addFile = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map(async (file) => {
        if (isSupabaseEnabled) {
          const url = await uploadImage(file)
          if (url) return url
          console.warn('Error al subir una imagen:', file.name)
        }
        return fileToDataUrl(file)
      }))
      const valid = results.filter(Boolean)
      const remaining = MAX_IMAGES - images.length
      if (valid.length && remaining > 0) onChange([...images, ...valid.slice(0, remaining)])
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group w-14 h-14 sm:w-16 sm:h-16">
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-botanica-200 dark:border-botanica-700" />
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-botanica-800/70 text-white rounded-b-lg py-0.5">principal</span>}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          placeholder="https://... (URL de la imagen)" className="input-field py-1.5 text-xs flex-1" />
        <button type="button" onClick={addUrl} className="btn-outline text-xs px-2 sm:px-3 py-1.5 shrink-0">+ Añadir imagen</button>
      </div>
      <button type="button" onClick={() => !uploading && fileRef.current.click()} disabled={uploading}
        className="w-full border-2 border-dashed border-botanica-200 dark:border-botanica-700 rounded-xl py-2.5 text-xs text-botanica-500 dark:text-botanica-400 hover:border-botanica-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
        {uploading ? (
          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Subiendo…</>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isSupabaseEnabled ? 'Subir imagen' : 'Subir desde el dispositivo'}</>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addFile} />
      {images.length >= MAX_IMAGES && (
        <p className="text-[10px] text-amber-500 text-center">Máximo 3 imágenes por producto</p>
      )}
    </div>
  )
}

function StockControl({ productId, stock }) {
  const { adjustStock } = useInventoryStore()
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => adjustStock(productId, -1)} disabled={stock === 0}
        className="w-6 h-6 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors text-xs">−</button>
      <span className={clsx('font-mono text-sm font-semibold w-7 text-center',
        stock === 0 ? 'text-red-500 dark:text-red-400' :
          stock <= 5 ? 'text-amber-600 dark:text-amber-400' :
            'text-botanica-700 dark:text-botanica-300')}>{stock}</span>
      <button onClick={() => adjustStock(productId, +1)}
        className="w-6 h-6 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-botanica-50 dark:hover:bg-botanica-700 transition-colors text-xs">+</button>
    </div>
  )
}

const EditForm = memo(function EditForm({ editing, onChange, onImages, onFeatured, onSave, onCancel }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <LabeledInput label="Nombre">
            <EditField field="name" value={editing.name ?? ''} onChange={onChange} />
          </LabeledInput>
        </div>
        <LabeledInput label="Categoría">
          <EditField field="category" value={editing.category ?? ''} as="select" opts={CAT_OPTS} onChange={onChange} />
        </LabeledInput>
        <LabeledInput label="Stock">
          <EditField field="stock" value={editing.stock ?? ''} type="number" onChange={onChange} />
        </LabeledInput>
        <LabeledInput label="P. Minorista">
          <EditField field="priceRetail" value={editing.priceRetail ?? ''} type="number" onChange={onChange} />
        </LabeledInput>
        <LabeledInput label="P. Mayorista">
          <EditField field="priceWholesale" value={editing.priceWholesale ?? ''} type="number" onChange={onChange} />
        </LabeledInput>
        <LabeledInput label="Mín. may.">
          <EditField field="minWholesaleQty" value={editing.minWholesaleQty ?? ''} type="number" onChange={onChange} />
        </LabeledInput>
        <div className="col-span-2">
          <LabeledInput label="Descripción">
            <EditField field="description" value={editing.description ?? ''} onChange={onChange} />
          </LabeledInput>
        </div>
        <LabeledInput label="💧 Riego">
          <EditField field="riego" value={editing.riego ?? ''} onChange={onChange} />
        </LabeledInput>
        <LabeledInput label="🪨 Sustrato">
          <EditField field="sustrato" value={editing.sustrato ?? ''} onChange={onChange} />
        </LabeledInput>
        <LabeledInput label="🌿 Cuidado">
          <EditField field="cuidado" value={editing.cuidado ?? ''} onChange={onChange} />
        </LabeledInput>
      </div>
      <div>
        <p className="text-[10px] text-botanica-400 mb-1">Imágenes</p>
        <ImageUploader images={editing.images || []} onChange={onImages} />
      </div>
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={onFeatured}
          style={{ background: editing.featured ? '#386a2b' : '#c2dab8' }}
          className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0">
          <span style={{ transform: editing.featured ? 'translateX(20px)' : 'translateX(0)' }}
            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
        </button>
        <span className="text-[10px] text-botanica-500 dark:text-botanica-400 cursor-pointer" onClick={onFeatured}>Destacado</span>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} className="btn-primary text-xs flex-1">Guardar</button>
        <button onClick={onCancel} className="btn-ghost text-xs">✕</button>
      </div>
    </div>
  )
})

const TableEditForm = memo(function TableEditForm({ editing, onChange, onImages }) {
  return (
    <div className="space-y-2">
      <EditField field="name" value={editing.name ?? ''} className="w-full" onChange={onChange} />
      <EditField field="description" value={editing.description ?? ''} className="w-full" onChange={onChange} />
      <div className="grid grid-cols-3 gap-1">
        <div>
          <p className="text-[9px] text-botanica-400 mb-0.5">💧 Riego</p>
          <EditField field="riego" value={editing.riego ?? ''} className="w-full" onChange={onChange} />
        </div>
        <div>
          <p className="text-[9px] text-botanica-400 mb-0.5">🪨 Sustrato</p>
          <EditField field="sustrato" value={editing.sustrato ?? ''} className="w-full" onChange={onChange} />
        </div>
        <div>
          <p className="text-[9px] text-botanica-400 mb-0.5">🌿 Cuidado</p>
          <EditField field="cuidado" value={editing.cuidado ?? ''} className="w-full" onChange={onChange} />
        </div>
      </div>
      <ImageUploader images={editing.images || []} onChange={onImages} />
    </div>
  )
})

export default function Inventory() {
  const { isAdmin } = useAuth()
  const { updateProduct, deleteProduct, addProduct } = useInventoryStore()
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newProd, setNewProd] = useState({ ...EMPTY })
  const [saved, setSaved] = useState(null)
  const [csvPreview, setCsvPreview] = useState(null)
  const [csvMode, setCsvMode] = useState('merge')
  const csvRef = useRef()

  const { data: products } = useInventory({ category, search })

  const startEdit = (p) => { setEditing({ ...p }); setAdding(false) }
  const cancelEdit = () => setEditing(null)
  const saveEdit = async () => {
    await updateProduct(editing.id, editing)
    setSaved(editing.id)
    setTimeout(() => setSaved(null), 2000)
    setEditing(null)
  }

  const setNew = useCallback((field, value) => setNewProd(prev => ({ ...prev, [field]: value })), [])

  const onEditChange = useCallback((f, v) => setEditing(prev => prev ? { ...prev, [f]: v } : prev), [])
  const onEditImages = useCallback((imgs) => setEditing(prev => prev ? { ...prev, images: imgs } : prev), [])
  const onEditFeatured = useCallback(() => setEditing(prev => prev ? { ...prev, featured: !prev.featured } : prev), [])

  const cancelAdd = () => { setAdding(false); setNewProd({ ...EMPTY }) }

  const handleAdd = async () => {
    if (!newProd.name) return
    await addProduct(newProd)
    cancelAdd()
  }

  const exportCSV = () => {
    const rows = [['id', 'name', 'category', 'priceRetail', 'priceWholesale', 'minWholesaleQty', 'stock', 'unit'],
    ...(products || []).map(p => [p.id, `"${p.name}"`, p.category, p.priceRetail, p.priceWholesale, p.minWholesaleQty, p.stock, p.unit])]
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'))
    a.download = 'inventario.csv'; a.click()
  }

  const handleCSV = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean)
      if (lines.length < 2) return
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      const colMap = {
        nombre: 'name', name: 'name', descripcion: 'description', description: 'description', 'descripción': 'description',
        categoria: 'category', category: 'category', 'precio minorista': 'priceRetail', precioretail: 'priceRetail', priceretail: 'priceRetail',
        'precio mayorista': 'priceWholesale', preciomayor: 'priceWholesale', pricewholesale: 'priceWholesale',
        'min mayorista': 'minWholesaleQty', minwholesaleqty: 'minWholesaleQty', stock: 'stock', unidad: 'unit', unit: 'unit'
      }
      const VALID_CATS = new Set(['interior', 'interior-plantas', 'interior-combos', 'exterior', 'exterior-plantas', 'exterior-combos', 'exterior-frutales', 'exterior-aromaticas', 'insumos', 'quimicos', 'fertilizantes', 'macetas', 'macetas-plastico', 'macetas-ceramica', 'macetas-terracota', 'macetas-madera', 'macetas-colgante', 'kits'])
      const errors = []
      const rows = lines.slice(1).map((line, i) => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row = {}
        headers.forEach((h, j) => { const k = colMap[h]; if (k) row[k] = vals[j] })
        if (!row.name) { errors.push(`Fila ${i + 2}: sin nombre`); return null }
        if (row.category && !VALID_CATS.has(row.category)) { errors.push(`Fila ${i + 2}: categoría inválida → "interior-plantas"`); row.category = 'interior-plantas' }
        return {
          id: row.id || String(Date.now() + i), name: row.name, category: (row.category || 'interior-plantas').toLowerCase(),
          description: row.description || '', priceRetail: Number(row.priceRetail) || 0, priceWholesale: Number(row.priceWholesale) || 0,
          minWholesaleQty: Number(row.minWholesaleQty) || 1, stock: Number(row.stock) || 0, unit: row.unit || 'planta',
          images: [], tags: [], featured: false, slug: row.id || String(Date.now() + i)
        }
      }).filter(Boolean)
      setCsvPreview({ rows, errors, mode: csvMode })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const importCSV = async () => {
    if (!csvPreview) return
    for (const row of csvPreview.rows) await addProduct(row)
    setCsvPreview(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl md:text-4xl mb-1">Inventario</h1>
          <p className="text-botanica-500 dark:text-botanica-400 text-xs sm:text-sm">
            {isAdmin ? 'Administrar precios y productos' : ''}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setAdding(a => !a); setEditing(null) }} className="btn-primary text-xs sm:text-sm px-3 sm:px-4">
              {adding ? '✕ Cancelar' : '+ Nuevo producto'}
            </button>
            <button onClick={() => csvRef.current.click()} className="btn-outline text-xs sm:text-sm px-3 sm:px-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Importar CSV
            </button>
            <input ref={csvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSV} />
            <button onClick={exportCSV} className="btn-outline text-xs sm:text-sm px-3 sm:px-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar CSV
            </button>
          </div>
        )}
      </div>

      {adding && isAdmin && (
        <div className="card p-4 sm:p-6 mb-6 border-2 border-botanica-400 dark:border-botanica-600">
          <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4">Nuevo producto</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="col-span-2 sm:col-span-3">
              <LabeledInput label="Nombre*">
                <input type="text" value={newProd.name} onChange={e => setNew('name', e.target.value)} placeholder="Datos del producto" className="input-field py-2 text-sm" />
              </LabeledInput>
            </div>
            <LabeledInput label="Categoría*">
              <select value={newProd.category} onChange={e => setNew('category', e.target.value)} className="input-field py-2 text-sm">
                {CAT_OPTS.filter(o => !o.isParent).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </LabeledInput>
            <LabeledInput label="Tipo">
              <select value={newProd.unit} onChange={e => setNew('unit', e.target.value)} className="input-field py-2 text-sm">
                {['planta', 'unidad', 'kg', 'litro', 'bolsa', 'par'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </LabeledInput>
            <LabeledInput label="Precio mayorista*">
              <input type="number" value={newProd.priceWholesale} min={0} onWheel={e => e.target.blur()} onChange={e => setNew('priceWholesale', e.target.value)} placeholder="0" className="input-field py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </LabeledInput>
            <LabeledInput label="Precio minorista*">
              <input type="number" value={newProd.priceRetail} min={0} onWheel={e => e.target.blur()} onChange={e => setNew('priceRetail', e.target.value)} placeholder="0" className="input-field py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </LabeledInput>
            <LabeledInput label="Mínimo">
              <input type="number" value={newProd.minWholesaleQty} min={1} onWheel={e => e.target.blur()} onChange={e => setNew('minWholesaleQty', e.target.value)} placeholder="1" className="input-field py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </LabeledInput>
            <LabeledInput label="Stock inicial">
              <input type="number" value={newProd.stock} min={0} onWheel={e => e.target.blur()} onChange={e => setNew('stock', e.target.value)} placeholder="0" className="input-field py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </LabeledInput>
          </div>
          <div className="mb-3 sm:mb-4">
            <LabeledInput label="Descripción">
              <textarea value={newProd.description} onChange={e => setNew('description', e.target.value)} placeholder="Descripción breve del producto" rows={2} className="input-field py-2 text-sm resize-none" />
            </LabeledInput>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 sm:mb-4">
            <LabeledInput label="💧 Riego">
              <input type="text" value={newProd.riego} onChange={e => setNew('riego', e.target.value)} placeholder="Ej: 2 veces por semana" className="input-field py-2 text-sm" />
            </LabeledInput>
            <LabeledInput label="🪨 Sustrato">
              <input type="text" value={newProd.sustrato} onChange={e => setNew('sustrato', e.target.value)} placeholder="Ej: Tierra universal" className="input-field py-2 text-sm" />
            </LabeledInput>
            <LabeledInput label="🌿 Cuidado">
              <input type="text" value={newProd.cuidado} onChange={e => setNew('cuidado', e.target.value)} placeholder="Ej: Luz indirecta" className="input-field py-2 text-sm" />
            </LabeledInput>
          </div>
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs text-botanica-500 dark:text-botanica-400 mb-2 font-medium">Imágenes</label>
            <ImageUploader images={newProd.images} onChange={imgs => setNew('images', imgs)} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <button type="button" onClick={() => setNew('featured', !newProd.featured)}
              style={{ background: newProd.featured ? '#386a2b' : '#c2dab8' }}
              className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0">
              <span style={{ transform: newProd.featured ? 'translateX(20px)' : 'translateX(0)' }}
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
            </button>
            <span className="text-xs text-botanica-500 dark:text-botanica-400">Mostrar como destacado</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!newProd.name} className="btn-primary text-xs sm:text-sm disabled:opacity-40">
              Añadir producto
            </button>
            <button onClick={cancelAdd} className="btn-ghost text-xs sm:text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {csvPreview && (
        <div className="card p-4 mb-6 border-2 border-amber-400 dark:border-amber-600">
          <h3 className="font-display text-sm text-botanica-800 dark:text-botanica-200 mb-2">Vista previa — {csvPreview.rows.length} productos</h3>
          {csvPreview.errors.length > 0 && (
            <ul className="text-xs text-amber-600 dark:text-amber-400 mb-3 space-y-0.5">
              {csvPreview.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}
          <div className="flex gap-2">
            <button onClick={importCSV} className="btn-primary text-xs">Importar {csvPreview.rows.length} productos</button>
            <button onClick={() => setCsvPreview(null)} className="btn-ghost text-xs">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <div className="relative w-full sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-botanica-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Buscar producto…" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
        </div>
        <div className="flex lg:flex-wrap gap-1 bg-botanica-100 dark:bg-botanica-800 rounded-2xl p-1 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CATEGORIES.map(({ id, label }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={clsx('flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap',
                category === id
                  ? 'bg-white dark:bg-botanica-700 shadow-sm text-botanica-800 dark:text-botanica-100 font-medium'
                  : 'text-botanica-600 dark:text-botanica-400')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {(products || []).length === 0 ? (
          <div className="text-center py-12 text-botanica-400 dark:text-botanica-500 text-sm">Sin productos</div>
        ) : (products || []).map(product => {
          const isEditing = editing?.id === product.id
          return (
            <div key={product.id}
              className={clsx('card p-4 transition-colors duration-300',
                isEditing ? 'border-2 border-botanica-400 dark:border-botanica-600' :
                  saved === product.id ? 'border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : '')}>
              {isEditing ? (
                <EditForm
                  editing={editing}
                  onChange={onEditChange}
                  onImages={onEditImages}
                  onFeatured={onEditFeatured}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                />
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      : <div className="w-12 h-12 rounded-lg bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-lg opacity-30">🌿</div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-botanica-900 dark:text-botanica-100 truncate">{product.name}</p>
                      <p className="text-[10px] text-botanica-400 dark:text-botanica-500">{CATEGORY_LABELS[product.category] || product.category}</p>
                    </div>
                    {product.featured && <span className="text-botanica-400 text-sm">★</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                    <div><span className="text-botanica-400">Mayorista: </span><span className="font-mono text-soil-600 dark:text-soil-400">{formatPrice(product.priceWholesale)}</span></div>
                    <div><span className="text-botanica-400">Minorista: </span><span className="font-mono">{formatPrice(product.priceRetail)}</span></div>
                    <div><span className="text-botanica-400">Stock: </span><StockControl productId={product.id} stock={product.stock} /></div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t border-botanica-100 dark:border-botanica-800">
                      <button onClick={() => startEdit(product)} className="btn-ghost text-xs py-1 flex-1">Editar</button>
                      <button onClick={() => { if (window.confirm(`¿Eliminar "${product.name}"?`)) deleteProduct(product.id) }}
                        className="btn-ghost text-xs py-1 text-red-400 hover:text-red-600">Eliminar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-botanica-50 dark:bg-botanica-800 border-b border-botanica-100 dark:border-botanica-700 text-left">
                <th className="px-5 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400">Producto</th>
                <th className="px-4 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400">Categoría</th>
                <th className="px-4 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400 text-right">Mayorista</th>
                <th className="px-4 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400 text-right">Minorista</th>
                <th className="px-4 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400 text-center">Mín.</th>
                <th className="px-4 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400 text-center">Destacado</th>
                <th className="px-4 py-3 font-body font-medium text-botanica-500 dark:text-botanica-400 text-center">Stock</th>
                {isAdmin && <th className="px-4 py-3 min-w-[130px]" />}
              </tr>
            </thead>
            <tbody>
              {(products || []).length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-botanica-400 dark:text-botanica-500">Sin productos</td></tr>
              ) : (products || []).map(product => {
                const isEditing = editing?.id === product.id
                const wasSaved = saved === product.id
                return (
                  <tr key={product.id} className={clsx('border-b border-botanica-50 dark:border-botanica-800 transition-colors duration-300',
                    isEditing ? 'bg-botanica-50 dark:bg-botanica-800/60' :
                      wasSaved ? 'bg-green-50 dark:bg-green-900/20' :
                        'hover:bg-botanica-50/50 dark:hover:bg-botanica-800/30')}>

                    <td className="px-5 py-3">
                      {isEditing ? (
                        <TableEditForm
                          editing={editing}
                          onChange={onEditChange}
                          onImages={onEditImages}
                          onFeatured={onEditFeatured}
                          onSave={saveEdit}
                          onCancel={cancelEdit}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-botanica-100 dark:bg-botanica-800 shrink-0" />
                            : <div className="w-10 h-10 rounded-lg bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-lg opacity-30">🌿</div>}
                          <span className="font-body font-medium text-botanica-900 dark:text-botanica-100">{product.name}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing
                        ? <EditField field="category" value={editing.category ?? ''} as="select" opts={CAT_OPTS} onChange={onEditChange} />
                        : <span className="text-xs text-botanica-500 dark:text-botanica-400">{CATEGORY_LABELS[product.category] || product.category}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing
                        ? <EditField field="priceWholesale" value={editing.priceWholesale ?? ''} type="number" className="w-24 ml-auto" onChange={onEditChange} />
                        : (
                          <div>
                            <span className="font-mono text-soil-600 dark:text-soil-400 font-semibold">{formatPrice(product.priceWholesale)}</span>
                            <div className="text-[10px] text-soil-400 dark:text-soil-500">
                              {product.priceRetail > 0 ? Math.round((1 - product.priceWholesale / product.priceRetail) * 100) : 0}% de ganancia
                            </div>
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing
                        ? <EditField field="priceRetail" value={editing.priceRetail ?? ''} type="number" className="w-24 ml-auto" onChange={onEditChange} />
                        : <span className="font-mono text-botanica-800 dark:text-botanica-200">{formatPrice(product.priceRetail)}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing
                        ? <EditField field="minWholesaleQty" value={editing.minWholesaleQty ?? ''} type="number" className="w-16 mx-auto" onChange={onEditChange} />
                        : <span className="font-mono text-botanica-500 dark:text-botanica-400">{product.minWholesaleQty}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <button type="button" onClick={onEditFeatured}
                          style={{ background: editing.featured ? '#386a2b' : '#c2dab8' }}
                          className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none mx-auto block">
                          <span style={{ transform: editing.featured ? 'translateX(20px)' : 'translateX(0)' }}
                            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" />
                        </button>
                      ) : (
                        <span className={clsx('text-sm', product.featured ? 'text-botanica-500 dark:text-botanica-400' : 'text-botanica-200 dark:text-botanica-700')}>★</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <EditField field="stock" value={editing.stock ?? ''} type="number" className="w-20 mx-auto" onChange={onEditChange} />
                        : isAdmin
                          ? <StockControl productId={product.id} stock={product.stock} />
                          : <span className={clsx('font-mono text-sm font-semibold block text-center',
                            product.stock === 0 ? 'text-red-500 dark:text-red-400' :
                              product.stock <= 5 ? 'text-amber-600 dark:text-amber-400' :
                                'text-botanica-700 dark:text-botanica-300')}>{product.stock}</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={saveEdit} className="bg-botanica-600 hover:bg-botanica-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors">Guardar</button>
                            <button onClick={cancelEdit} className="btn-ghost text-xs py-1.5">✕</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(product)} className="btn-ghost text-xs py-1">Editar</button>
                            <button onClick={() => { if (window.confirm(`¿Eliminar "${product.name}"?`)) deleteProduct(product.id) }}
                              className="btn-ghost text-xs py-1 text-red-400 hover:text-red-600">Eliminar</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
