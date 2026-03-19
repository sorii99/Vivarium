import { useState, useRef } from 'react'
import { useBanners } from '@/context/BannerContext'
import { fileToDataUrl } from '@/context/InventoryContext'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

const EMPTY = {
  tag: '', title: '', subtitle: '', desc: '',
  cta: 'Ver más', to: '/productos', accent: '#4a8539', image: '',
}

const labelClass = 'block text-xs text-botanica-500 dark:text-botanica-400 font-medium mb-1 uppercase tracking-wider'

function FormField({ label, field, placeholder, as = 'input', value, onChange }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {as === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="input-field text-xs py-1.5 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="input-field text-xs py-1.5"
        />
      )}
    </div>
  )
}

function BannerForm({ initial = EMPTY, onSave, onCancel, saveLabel = 'Guardar' }) {
  const [form, setForm] = useState({ ...initial })
  const fileRef = useRef()

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    set('image', url)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Etiqueta" field="tag" placeholder="🌿 Novedad" value={form.tag} onChange={set} />
        <FormField label="Título*" field="title" placeholder="Plantas de temporada" value={form.title} onChange={set} />
        <FormField label="Subtítulo" field="subtitle" placeholder="Interior · Exterior" value={form.subtitle} onChange={set} />
        <FormField label="Texto del botón" field="cta" placeholder="Ver catálogo" value={form.cta} onChange={set} />
        <FormField label="Destino (URL)" field="to" placeholder="/productos" value={form.to} onChange={set} />

        <div>
          <label className={labelClass}>Color de acento</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.accent}
              onChange={e => set('accent', e.target.value)}
              className="w-9 h-9 rounded-lg border border-botanica-200 dark:border-botanica-700 cursor-pointer bg-transparent p-0.5"
            />
            <input
              type="text"
              value={form.accent}
              onChange={e => set('accent', e.target.value)}
              className="input-field text-xs py-1.5 font-mono flex-1"
            />
          </div>
        </div>
      </div>

      <FormField label="Descripción" field="desc" placeholder="Texto descriptivo del banner…" as="textarea" value={form.desc} onChange={set} />

      <div>
        <label className={labelClass}>Imagen (opcional)</label>
        <div className="flex items-start gap-3">
          {form.image && (
            <div className="relative shrink-0">
              <img src={form.image} alt="preview"
                className="w-20 h-14 object-cover rounded-lg border border-botanica-200 dark:border-botanica-700" />
              <button onClick={() => set('image', '')}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                ×
              </button>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              type="url"
              value={form.image}
              onChange={e => set('image', e.target.value)}
              placeholder="https://... (URL de imagen)"
              className="input-field text-xs py-1.5"
            />
            <button type="button" onClick={() => fileRef.current.click()}
              className="w-full border-2 border-dashed border-botanica-200 dark:border-botanica-700 rounded-xl py-2 text-xs text-botanica-500 hover:border-botanica-400 transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Subir desde dispositivo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        </div>
      </div>

      {(form.title || form.image) && (
        <div className="rounded-xl overflow-hidden border border-botanica-200 dark:border-botanica-700">
          <p className="text-[10px] text-botanica-400 px-3 py-1.5 bg-botanica-50 dark:bg-botanica-800 border-b border-botanica-200 dark:border-botanica-700">
            Vista previa
          </p>
          <div className="flex items-stretch" style={{ background: '#0f1f0d', minHeight: '80px' }}>
            <div className="flex-1 px-4 py-3 flex flex-col justify-center">
              {form.tag && (
                <span className="inline-block self-start text-[9px] px-2 py-0.5 rounded-full mb-1"
                  style={{ background: `${form.accent}25`, color: form.accent, border: `1px solid ${form.accent}35` }}>
                  {form.tag}
                </span>
              )}
              <p className="font-display text-white text-sm leading-tight">{form.title || '—'}</p>
              {form.subtitle && (
                <p className="text-[10px] mt-0.5" style={{ color: form.accent }}>{form.subtitle}</p>
              )}
              {form.cta && (
                <span className="inline-block self-start mt-2 text-[10px] px-2.5 py-1 rounded-full"
                  style={{ background: form.accent, color: '#fff' }}>
                  {form.cta} →
                </span>
              )}
            </div>
            {form.image && (
              <div className="w-24 shrink-0 relative overflow-hidden">
                <img src={form.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-y-0 left-0 w-8 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, #0f1f0d, transparent)' }} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={!form.title} className="btn-primary text-xs disabled:opacity-40">
          {saveLabel}
        </button>
        <button onClick={onCancel} className="btn-ghost text-xs">Cancelar</button>
      </div>
    </div>
  )
}

export default function BannerManager() {
  const { banners, addBanner, updateBanner, deleteBanner, moveBanner } = useBanners()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg sm:text-xl text-botanica-800 dark:text-botanica-200">
          Promociones
        </h2>
        {!adding && (
          <button onClick={() => { setAdding(true); setEditId(null) }} className="btn-primary text-xs px-3">
            + Nuevo banner
          </button>
        )}
      </div>

      {adding && (
        <div className="card p-4 sm:p-5 mb-4 border-2 border-botanica-400 dark:border-botanica-600">
          <h3 className="font-display text-base text-botanica-800 dark:text-botanica-200 mb-3">Nuevo banner</h3>
          <BannerForm
            onSave={async (data) => { await addBanner(data); setAdding(false) }}
            onCancel={() => setAdding(false)}
            saveLabel="Agregar banner"
          />
        </div>
      )}

      <div className="space-y-3">
        {banners.length === 0 && (
          <p className="text-sm text-botanica-400 dark:text-botanica-500 text-center py-8">
            No hay promos activas.
          </p>
        )}
        {banners.map((b, i) => (
          <div key={b.id} className={clsx(
            'card overflow-hidden transition-colors',
            editId === b.id && 'border-2 border-botanica-400 dark:border-botanica-600'
          )}>
            {editId === b.id ? (
              <div className="p-4 sm:p-5">
                <h3 className="font-display text-sm text-botanica-800 dark:text-botanica-200 mb-3">
                  Editando: {b.title}
                </h3>
                <BannerForm
                  initial={b}
                  onSave={async (data) => { await updateBanner(b.id, data); setEditId(null) }}
                  onCancel={() => setEditId(null)}
                  saveLabel="Guardar cambios"
                />
              </div>
            ) : (
              <div className="flex items-stretch">
                <div className="w-28 sm:w-36 shrink-0 relative overflow-hidden"
                  style={{ background: '#0f1f0d', minHeight: '72px' }}>
                  {b.image
                    ? <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    : <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">🌿</div>
                  }
                  <div className="absolute inset-0 p-2 flex flex-col justify-end"
                    style={{ background: 'linear-gradient(to top, #0f1f0d90, transparent)' }}>
                    <p className="text-white text-[10px] font-display leading-tight truncate">{b.title}</p>
                    {b.tag && <p className="text-[9px]" style={{ color: b.accent }}>{b.tag}</p>}
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-3 sm:px-4 py-3 flex flex-col justify-center gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: b.accent }} />
                    <span className="font-body font-medium text-xs sm:text-sm text-botanica-900 dark:text-botanica-100 truncate">
                      {b.title}
                    </span>
                  </div>
                  {b.subtitle && (
                    <p className="text-[10px] text-botanica-400 dark:text-botanica-500 truncate pl-5">{b.subtitle}</p>
                  )}
                  <p className="text-[10px] text-botanica-400 dark:text-botanica-500 pl-5 truncate">→ {b.to}</p>
                </div>

                <div className="flex items-center gap-1 px-2 sm:px-3 shrink-0">
                  <button onClick={() => moveBanner(b.id, -1)} disabled={i === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-botanica-100 dark:hover:bg-botanica-800 disabled:opacity-30 transition-colors text-botanica-500"
                    title="Subir">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button onClick={() => moveBanner(b.id, 1)} disabled={i === banners.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-botanica-100 dark:hover:bg-botanica-800 disabled:opacity-30 transition-colors text-botanica-500"
                    title="Bajar">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button onClick={() => { setEditId(b.id); setAdding(false) }} className="btn-ghost text-xs py-1 px-2">
                    Editar
                  </button>
                  <button onClick={() => { if (window.confirm(`¿Eliminar "${b.title}"?`)) deleteBanner(b.id) }}
                    className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-600">
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
