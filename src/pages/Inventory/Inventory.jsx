import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useInventoryStore, fileToDataUrl } from '@/context/InventoryContext'
import { useInventory } from '@/hooks/useProducts'
import { formatPrice } from '@/utils/format'
import { CATEGORIES } from '@/services/productService'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

const CAT_OPTS = CATEGORIES.filter(c => c.id !== 'all')
const EMPTY = { name: '', category: 'interior', description: '', priceRetail: '', priceWholesale: '', minWholesaleQty: '1', stock: '', unit: 'planta', images: [] }


function LabeledInput({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-botanica-500 dark:text-botanica-400 mb-1 font-medium">{label}</label>
      {children}
    </div>
  )
}

function ImageUploader({ images, onChange }) {
  const fileRef = useRef()
  const [urlInput, setUrlInput] = useState('')

  const addUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    onChange([...images, url])
    setUrlInput('')
  }

  const addFile = async (e) => {
    const files = Array.from(e.target.files)
    const dataUrls = await Promise.all(files.map(fileToDataUrl))
    onChange([...images, ...dataUrls])
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group w-14 h-14 sm:w-16 sm:h-16">
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-botanica-200 dark:border-botanica-700" />
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-botanica-800/70 text-white rounded-b-lg py-0.5">
                  principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          placeholder="https://... (URL de imagen)"
          className="input-field py-1.5 text-xs flex-1" />
        <button type="button" onClick={addUrl} className="btn-outline text-xs px-2 sm:px-3 py-1.5 shrink-0">
          + URL
        </button>
      </div>
      <button type="button" onClick={() => fileRef.current.click()}
        className="w-full border-2 border-dashed border-botanica-200 dark:border-botanica-700 rounded-xl py-2.5 sm:py-3 text-xs text-botanica-500 dark:text-botanica-400 hover:border-botanica-400 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        Subir desde dispositivo
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addFile} />
    </div>
  )
}

function StockControl({ productId, stock }) {
  const { adjustStock } = useInventoryStore()
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => adjustStock(productId, -1)} disabled={stock === 0}
        className="w-6 h-6 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs">
        −
      </button>
      <span className={clsx('font-mono text-sm font-semibold w-7 text-center',
        stock === 0 ? 'text-red-500 dark:text-red-400' :
          stock <= 5 ? 'text-amber-600 dark:text-amber-400' :
            'text-botanica-700 dark:text-botanica-300')}>
        {stock}
      </span>
      <button onClick={() => adjustStock(productId, +1)}
        className="w-6 h-6 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-botanica-50 dark:hover:bg-botanica-700 transition-colors text-xs">
        +
      </button>
    </div>
  )
}

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
  const saveEdit = () => {
    updateProduct(editing.id, editing)
    setSaved(editing.id)
    setTimeout(() => setSaved(null), 1800)
    setEditing(null)
  }

  const setNew = useCallback((field, value) => setNewProd(prev => ({ ...prev, [field]: value })), [])
  const saveNew = () => { addProduct(newProd); setNewProd({ ...EMPTY }); setAdding(false) }
  const cancelAdd = () => { setAdding(false); setNewProd({ ...EMPTY }) }

  const VALID_CATS = new Set(['interior', 'exterior', 'insumos'])

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return { rows: [], errors: ['El archivo está vacío'] }
    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
    const colMap = {
      nombre: 'name', name: 'name',
      'categoría': 'category', categoria: 'category', category: 'category',
      'p. minorista': 'priceRetail', minorista: 'priceRetail', priceretail: 'priceRetail',
      'p. mayorista': 'priceWholesale', mayorista: 'priceWholesale', pricewholesale: 'priceWholesale',
      'mín. may.': 'minWholesaleQty', minwholesaleqty: 'minWholesaleQty',
      stock: 'stock', unidad: 'unit', unit: 'unit',
      descripcion: 'description', description: 'description', 'descripción': 'description',
      imagen: 'image', image: 'image', id: 'id',
    }
    const mapped = header.map(h => colMap[h] || null)
    const errors = [], rows = []
    lines.slice(1).forEach((line, i) => {
      if (!line.trim()) return
      const cols = []; let cur = '', inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
        else cur += ch
      }
      cols.push(cur.trim())
      const row = {}
      mapped.forEach((key, j) => { if (key) row[key] = cols[j]?.replace(/^"|"$/g, '') ?? '' })
      if (!row.name) { errors.push(`Fila ${i + 2}: nombre vacío`); return }
      if (row.category && !VALID_CATS.has(row.category.toLowerCase())) {
        errors.push(`Fila ${i + 2}: categoría inválida → "interior"`); row.category = 'interior'
      }
      rows.push({ id: row.id || String(Date.now() + i), name: row.name, category: (row.category || 'interior').toLowerCase(), description: row.description || '', priceRetail: Number(row.priceRetail) || 0, priceWholesale: Number(row.priceWholesale) || 0, minWholesaleQty: Number(row.minWholesaleQty) || 1, stock: Number(row.stock) || 0, unit: row.unit || 'planta', images: row.image ? [row.image] : [], tags: [], featured: false, slug: row.id || String(Date.now() + i) })
    })
    return { rows, errors }
  }

  const handleCSVFile = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsvPreview(parseCSV(ev.target.result))
    reader.readAsText(file, 'UTF-8'); e.target.value = ''
  }

  const confirmImport = () => {
    if (!csvPreview) return
    csvPreview.rows.forEach(row => {
      const existing = products.find(p => p.id === row.id || p.name.toLowerCase() === row.name.toLowerCase())
      if (existing && csvMode === 'merge') updateProduct(existing.id, { ...row, id: existing.id })
      else if (!existing) addProduct(row)
    })
    setCsvPreview(null)
  }

  const exportCSV = () => {
    const rows = [['ID', 'Nombre', 'Categoría', 'P. Minorista', 'P. Mayorista', 'Mín. May.', 'Stock', 'Unidad'],
    ...(products || []).map(p => [p.id, `"${p.name}"`, p.category, p.priceRetail, p.priceWholesale, p.minWholesaleQty, p.stock, p.unit])]
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'))
    a.download = 'inventario.csv'; a.click()
  }

  const EditField = ({ field, type = 'text', as = 'input', opts = [], className = '' }) => {
    if (as === 'select') return (
      <select value={editing[field]} onChange={e => setEditing(v => ({ ...v, [field]: e.target.value }))}
        className={clsx('input-field py-1 text-xs', className)}>
        {opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    )
    return (
      <input type={type} value={editing[field] ?? ''} onChange={e => setEditing(v => ({ ...v, [field]: e.target.value }))}
        className={clsx('input-field py-1 text-xs', className)} min={type === 'number' ? 0 : undefined} />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl md:text-4xl mb-1">Inventario</h1>
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
            <input ref={csvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVFile} />
            <button onClick={exportCSV} className="btn-outline text-xs sm:text-sm px-3 sm:px-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar CSV
            </button>
          </div>
        )}
      </div>

      {adding && (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-botanica-400 dark:border-botanica-600">
          <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4">Nuevo producto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <LabeledInput label="Nombre *">
              <input type="text" value={newProd.name} onChange={e => setNew('name', e.target.value)} placeholder="Ej: Monstera Deliciosa" className="input-field py-2 text-sm" />
            </LabeledInput>
            <LabeledInput label="Categoría">
              <select value={newProd.category} onChange={e => setNew('category', e.target.value)} className="input-field py-2 text-sm">
                {CAT_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </LabeledInput>
            <LabeledInput label="Tipo">
              <select value={newProd.unit} onChange={e => setNew('unit', e.target.value)} className="input-field py-2 text-sm">
                {['Planta', 'Bolsa', 'Unidad', 'Kg.', 'Litro'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </LabeledInput>
            <LabeledInput label="Precio minorista *">
              <input type="number" value={newProd.priceRetail} min={0} onChange={e => setNew('priceRetail', e.target.value)} placeholder="0" className="input-field py-2 text-sm" />
            </LabeledInput>
            <LabeledInput label="Precio mayorista *">
              <input type="number" value={newProd.priceWholesale} min={0} onChange={e => setNew('priceWholesale', e.target.value)} placeholder="0" className="input-field py-2 text-sm" />
            </LabeledInput>
            <LabeledInput label="Stock inicial">
              <input type="number" value={newProd.stock} min={0} onChange={e => setNew('stock', e.target.value)} placeholder="0" className="input-field py-2 text-sm" />
            </LabeledInput>
          </div>
          <div className="mb-3 sm:mb-4">
            <LabeledInput label="Descripción">
              <textarea value={newProd.description} onChange={e => setNew('description', e.target.value)} placeholder="Descripción breve…" rows={2} className="input-field py-2 text-sm resize-none" />
            </LabeledInput>
          </div>
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs text-botanica-500 dark:text-botanica-400 mb-2 font-medium">Imágenes</label>
            <ImageUploader images={newProd.images} onChange={imgs => setNew('images', imgs)} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew} disabled={!newProd.name || !newProd.priceRetail} className="btn-primary text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              Guardar
            </button>
            <button onClick={cancelAdd} className="btn-ghost text-xs sm:text-sm">Cancelar</button>
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
        <div className="flex flex-wrap gap-1 bg-botanica-100 dark:bg-botanica-800 rounded-2xl p-1">
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
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2"><LabeledInput label="Nombre"><EditField field="name" /></LabeledInput></div>
                    <LabeledInput label="Categoría"><EditField field="category" as="select" opts={CAT_OPTS} /></LabeledInput>
                    <LabeledInput label="Stock"><EditField field="stock" type="number" /></LabeledInput>
                    <LabeledInput label="P. Minorista"><EditField field="priceRetail" type="number" /></LabeledInput>
                    <LabeledInput label="P. Mayorista"><EditField field="priceWholesale" type="number" /></LabeledInput>
                    <LabeledInput label="Mín. may."><EditField field="minWholesaleQty" type="number" /></LabeledInput>
                  </div>
                  <div>
                    <p className="text-[10px] text-botanica-400 mb-1">Imágenes</p>
                    <ImageUploader images={editing.images || []} onChange={imgs => setEditing(v => ({ ...v, images: imgs }))} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} className="btn-primary text-xs flex-1">Guardar</button>
                    <button onClick={cancelEdit} className="btn-ghost text-xs">✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-3">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-botanica-100 dark:bg-botanica-800" />
                      : <div className="w-14 h-14 rounded-xl bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-2xl opacity-30">🌿</div>
                    }
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body font-medium text-botanica-900 dark:text-botanica-100 text-sm leading-tight">{product.name}</h3>
                      <span className="text-[10px] text-botanica-500 dark:text-botanica-400 capitalize">{product.category}</span>
                    </div>
                    <StockControl productId={product.id} stock={product.stock} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-botanica-400 dark:text-botanica-500 mb-0.5">Minorista</p>
                      <p className="font-mono font-semibold text-botanica-800 dark:text-botanica-200">{formatPrice(product.priceRetail)}</p>
                    </div>
                    <div>
                      <p className="text-botanica-400 dark:text-botanica-500 mb-0.5">Mayorista</p>
                      <p className="font-mono font-semibold text-soil-600 dark:text-soil-400">{formatPrice(product.priceWholesale)}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 border-t border-botanica-100 dark:border-botanica-800 pt-3">
                      <button onClick={() => startEdit(product)} className="btn-ghost text-xs flex-1">Editar</button>
                      <button onClick={() => { if (window.confirm(`¿Eliminar "${product.name}"?`)) deleteProduct(product.id) }}
                        className="btn-ghost text-xs text-red-400 hover:text-red-600 flex-1">Eliminar</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="hidden md:block card overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-botanica-50 dark:bg-botanica-800 border-b border-botanica-100 dark:border-botanica-700">
                <th className="text-left px-5 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400 min-w-[180px]">Producto</th>
                <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Categoría</th>
                <th className="text-right px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400"><span className="badge-retail">Minorista</span></th>
                <th className="text-right px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400"><span className="badge-wholesale">Mayorista</span></th>
                <th className="text-center px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Mín.</th>
                <th className="text-center px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400 min-w-[110px]">Stock</th>
                {isAdmin && <th className="px-4 py-3 min-w-[130px]" />}
              </tr>
            </thead>
            <tbody>
              {(products || []).length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-botanica-400 dark:text-botanica-500">Sin productos</td></tr>
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
                        <div className="space-y-2">
                          <EditField field="name" className="w-full" />
                          <ImageUploader images={editing.images || []} onChange={imgs => setEditing(v => ({ ...v, images: imgs }))} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-botanica-100 dark:bg-botanica-800 shrink-0" />
                            : <div className="w-10 h-10 rounded-lg bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-lg opacity-30">🌿</div>
                          }
                          <span className="font-body font-medium text-botanica-900 dark:text-botanica-100">{product.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <EditField field="category" as="select" opts={CAT_OPTS} />
                        : <span className="text-xs text-botanica-500 dark:text-botanica-400 capitalize">{product.category}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing
                        ? <EditField field="priceRetail" type="number" className="w-24 ml-auto" />
                        : <span className="font-mono text-botanica-800 dark:text-botanica-200">{formatPrice(product.priceRetail)}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing
                        ? <EditField field="priceWholesale" type="number" className="w-24 ml-auto" />
                        : (
                          <div>
                            <span className="font-mono text-soil-600 dark:text-soil-400 font-semibold">{formatPrice(product.priceWholesale)}</span>
                            <div className="text-[10px] text-soil-400 dark:text-soil-500">
                              {product.priceRetail > 0 ? Math.round((1 - product.priceWholesale / product.priceRetail) * 100) : 0}% desc.
                            </div>
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing
                        ? <EditField field="minWholesaleQty" type="number" className="w-16 mx-auto" />
                        : <span className="font-mono text-botanica-500 dark:text-botanica-400">{product.minWholesaleQty}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <EditField field="stock" type="number" className="w-20 mx-auto" />
                        : isAdmin
                          ? <StockControl productId={product.id} stock={product.stock} />
                          : <span className={clsx('font-mono text-sm font-semibold block text-center',
                            product.stock === 0 ? 'text-red-500 dark:text-red-400' :
                              product.stock <= 5 ? 'text-amber-600 dark:text-amber-400' :
                                'text-botanica-700 dark:text-botanica-300')}>
                            {product.stock}
                          </span>}
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
                              className="btn-ghost text-xs py-1 text-red-400 hover:text-red-600 dark:hover:text-red-400">Eliminar</button>
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

      <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs text-botanica-400 dark:text-botanica-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Stock bajo (≤5)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Sin stock</span>
      </div>

      {csvPreview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white dark:bg-botanica-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col border-t sm:border border-botanica-200 dark:border-botanica-700">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-botanica-100 dark:border-botanica-800">
              <div>
                <h2 className="font-display text-lg sm:text-xl text-botanica-900 dark:text-botanica-100">Importar CSV</h2>
                <p className="text-xs text-botanica-500 dark:text-botanica-400">{csvPreview.rows.length} productos detectados</p>
              </div>
              <button onClick={() => setCsvPreview(null)} className="btn-ghost p-2 text-botanica-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 sm:px-6 py-3 border-b border-botanica-100 dark:border-botanica-800 flex gap-2 sm:gap-3">
              {[{ id: 'merge', label: 'Combinar', desc: 'Actualiza existentes, agrega nuevos' }, { id: 'replace', label: 'Solo agregar', desc: 'Ignora los existentes' }].map(m => (
                <button key={m.id} onClick={() => setCsvMode(m.id)}
                  className={clsx('flex-1 text-left rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border transition-all text-xs sm:text-sm',
                    csvMode === m.id ? 'border-botanica-500 bg-botanica-50 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-200' : 'border-botanica-200 dark:border-botanica-700 text-botanica-500 dark:text-botanica-400')}>
                  <span className="font-medium block">{m.label}</span>
                  <span className="text-[10px] sm:text-xs opacity-70 hidden sm:block">{m.desc}</span>
                </button>
              ))}
            </div>
            {csvPreview.errors.length > 0 && (
              <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Advertencias ({csvPreview.errors.length})</p>
                {csvPreview.errors.map((e, i) => <p key={i} className="text-xs text-amber-600 dark:text-amber-500">{e}</p>)}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
              {csvPreview.rows.length === 0 ? (
                <p className="text-center text-botanica-400 py-8 text-sm">No se encontraron filas válidas.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-botanica-100 dark:border-botanica-800">
                      <th className="text-left py-2 pr-3 font-medium text-botanica-600 dark:text-botanica-400">Nombre</th>
                      <th className="text-left py-2 pr-3 font-medium text-botanica-600 dark:text-botanica-400 hidden sm:table-cell">Cat.</th>
                      <th className="text-right py-2 pr-3 font-medium text-botanica-600 dark:text-botanica-400">Minorista</th>
                      <th className="text-right py-2 pr-3 font-medium text-botanica-600 dark:text-botanica-400 hidden sm:table-cell">Mayorista</th>
                      <th className="text-center py-2 font-medium text-botanica-600 dark:text-botanica-400">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((row, i) => {
                      const isExisting = products.some(p => p.id === row.id || p.name.toLowerCase() === row.name.toLowerCase())
                      return (
                        <tr key={i} className="border-b border-botanica-50 dark:border-botanica-800/50">
                          <td className="py-2 pr-3 text-botanica-900 dark:text-botanica-100 font-medium">
                            <span className="truncate block max-w-[120px] sm:max-w-none">{row.name}</span>
                            {isExisting && <span className="text-[9px] bg-botanica-100 dark:bg-botanica-800 text-botanica-500 px-1 py-0.5 rounded-full">existente</span>}
                          </td>
                          <td className="py-2 pr-3 text-botanica-500 dark:text-botanica-400 capitalize hidden sm:table-cell">{row.category}</td>
                          <td className="py-2 pr-3 text-right font-mono text-botanica-700 dark:text-botanica-300">{formatPrice(row.priceRetail)}</td>
                          <td className="py-2 pr-3 text-right font-mono text-soil-600 dark:text-soil-400 hidden sm:table-cell">{formatPrice(row.priceWholesale)}</td>
                          <td className="py-2 text-center font-mono text-botanica-700 dark:text-botanica-300">{row.stock}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-botanica-100 dark:border-botanica-800 gap-3">
              <p className="text-[10px] sm:text-xs text-botanica-400 dark:text-botanica-500 hidden sm:block">Columnas: nombre, categoría, p. minorista, p. mayorista, stock, unidad</p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setCsvPreview(null)} className="btn-ghost text-xs sm:text-sm flex-1 sm:flex-none">Cancelar</button>
                <button onClick={confirmImport} disabled={csvPreview.rows.length === 0}
                  className="btn-primary text-xs sm:text-sm flex-1 sm:flex-none disabled:opacity-40">
                  Importar {csvPreview.rows.length}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
