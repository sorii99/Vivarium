import { useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'

const clsx = (...c) => c.flat().filter(Boolean).join(' ')

export default function Clientes() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    if (!supabase) { setClients([]); setLoading(false); return }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, updated_at')
      .order('updated_at', { ascending: false })
    if (!error) setClients(data || [])
    setLoading(false)
  }

  async function saveRole(id) {
    setSaving(true)
    await supabase.from('profiles').update({ role: editRole }).eq('id', id)
    setEditId(null)
    setSaving(false)
    fetchClients()
  }

  const filtered = clients.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const roleLabel = { admin: 'Admin', retail: 'Cliente', wholesale: 'Cliente' }
  const roleColor = {
    admin: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    retail: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    wholesale: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl mb-1">Clientes</h1>
          <p className="text-botanica-500 dark:text-botanica-400 text-sm">
            {clients.length} usuarios registrados
          </p>
        </div>
        <button onClick={fetchClients} className="btn-ghost text-xs">↻ Actualizar</button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-botanica-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type="text" placeholder="Buscar por nombre o ID…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 text-sm" />
      </div>

      {!supabase ? (
        <div className="card p-8 text-center">
          <p className="text-botanica-400 text-sm">Supabase no está configurado.</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-14 animate-pulse bg-botanica-100 dark:bg-botanica-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">👥</span>
          <p className="text-botanica-500 dark:text-botanica-400 text-sm">
            {search ? 'Sin resultados' : 'No hay clientes registrados'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-botanica-50 dark:bg-botanica-800 border-b border-botanica-100 dark:border-botanica-700">
                  <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Nombre</th>
                  <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400 hidden sm:table-cell">ID</th>
                  <th className="text-center px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Rol</th>
                  <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400 hidden md:table-cell">Última actividad</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id}
                    className="border-b border-botanica-50 dark:border-botanica-800 last:border-0 hover:bg-botanica-50/50 dark:hover:bg-botanica-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-body font-medium text-botanica-900 dark:text-botanica-100">
                        {client.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-[10px] text-botanica-400 dark:text-botanica-500 truncate block max-w-[120px]">
                        {client.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editId === client.id ? (
                        <select value={editRole} onChange={e => setEditRole(e.target.value)}
                          className="input-field text-xs py-1 w-24 mx-auto">
                          <option value="retail">Cliente</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${roleColor[client.role] || roleColor.retail}`}>
                          {roleLabel[client.role] || 'Cliente'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-botanica-400 dark:text-botanica-500">
                        {client.updated_at ? new Date(client.updated_at).toLocaleDateString('es-AR') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editId === client.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => saveRole(client.id)} disabled={saving}
                            className="bg-botanica-600 hover:bg-botanica-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
                            {saving ? '…' : 'Guardar'}
                          </button>
                          <button onClick={() => setEditId(null)} className="btn-ghost text-xs py-1.5">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(client.id); setEditRole(client.role === 'admin' ? 'admin' : 'retail') }}
                          className="btn-ghost text-xs py-1">
                          Editar rol
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
