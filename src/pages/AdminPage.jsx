import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authFetch, logout } from '../utils/auth'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-brand-navy">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── User detail modal ────────────────────────────────────────────────────────
function UserModal({ userId, onClose }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`/api/admin/usuarios/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">{loading ? 'Carregando...' : user?.nome}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Perfil completo do usuário</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <svg className="animate-spin w-8 h-8 text-brand-yellow" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* Personal */}
            <Section title="Dados Pessoais">
              <Row label="Nome"          value={user.nome} />
              <Row label="CPF"           value={user.cpf} />
              <Row label="Nascimento"    value={fmtDate(user.nascimento)} />
              <Row label="Sexo"          value={user.sexo} />
              <Row label="Estado civil"  value={user.estado_civil} />
            </Section>

            {/* Contact */}
            <Section title="Contato">
              <Row label="Email"     value={user.email} />
              <Row label="Telefone"  value={user.telefone ? `(${user.telefone.slice(0,2)}) ${user.telefone.slice(2,7)}-${user.telefone.slice(7)}` : null} />
              <Row label="WhatsApp"  value={user.whatsapp ? `(${user.whatsapp.slice(0,2)}) ${user.whatsapp.slice(2,7)}-${user.whatsapp.slice(7)}` : null} />
            </Section>

            {/* Address */}
            {user.endereco && (
              <Section title="Endereço">
                <Row label="Rua"    value={`${user.endereco.rua}, ${user.endereco.numero}`} />
                <Row label="Bairro" value={user.endereco.bairro} />
                <Row label="Cidade" value={`${user.endereco.cidade} — ${user.endereco.estado}`} />
                <Row label="CEP"    value={user.endereco.cep?.replace(/(\d{5})(\d{3})/, '$1-$2')} />
              </Section>
            )}

            {/* Additional */}
            <Section title="Informações Adicionais">
              <Row label="Profissão"        value={user.profissao} />
              <Row label="Renda mensal"     value={user.renda} />
              <Row label="Possui seguro"    value={user.possui_seguro ? 'Sim' : 'Não'} />
              <Row label="Seguradora atual" value={user.seguradora_atual} />
              <Row label="Aceita ofertas"   value={user.receber_ofertas ? 'Sim' : 'Não'} />
            </Section>

            {/* Meta */}
            <Section title="Metadados">
              <Row label="Cadastro"       value={fmt(user.created_at)} />
              <Row label="Último login"   value={fmt(user.last_login_at)} />
              <Row label="Email verificado" value={user.email_verificado ? 'Sim' : 'Não'} />
            </Section>

            {/* Login history */}
            {user.historico_login?.length > 0 && (
              <Section title="Histórico de acesso (últimos 10)">
                <div className="space-y-1.5">
                  {user.historico_login.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${l.event === 'LOGIN_OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {l.event === 'LOGIN_OK' ? 'Sucesso' : 'Falha'}
                      </span>
                      <span className="text-gray-400">{fmt(l.created_at)}</span>
                      <span className="text-gray-300">{l.ip_address}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        ) : (
          <p className="p-6 text-gray-500 text-sm">Usuário não encontrado.</p>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-xs text-gray-800 font-semibold text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
  )
}

// ─── Main admin page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [search,   setSearch]   = useState('')
  const [query,    setQuery]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  const loadStats = useCallback(async () => {
    try {
      const r = await authFetch('/api/admin/stats')
      if (r.status === 401 || r.status === 403) { navigate('/', { replace: true }); return }
      setStats(await r.json())
    } catch { navigate('/', { replace: true }) }
  }, [navigate])

  const loadUsuarios = useCallback(async (pg = 1, q = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 20, ...(q ? { search: q } : {}) })
      const r = await authFetch(`/api/admin/usuarios?${params}`)
      if (r.status === 401 || r.status === 403) { navigate('/', { replace: true }); return }
      const data = await r.json()
      setUsuarios(data.data)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { loadStats(); loadUsuarios() }, [loadStats, loadUsuarios])

  function handleSearch(e) {
    e.preventDefault()
    setQuery(search)
    loadUsuarios(1, search)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top bar ── */}
      <header className="bg-brand-navy border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-navy" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">DamDidier</p>
            <p className="text-brand-yellow/70 text-[10px] font-semibold tracking-widest uppercase">Painel Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
          </svg>
          Sair
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total de cadastros"
            value={stats?.total}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
          />
          <StatCard
            label="Cadastros hoje"
            value={stats?.hoje}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>}
          />
          <StatCard
            label="Últimos 7 dias"
            value={stats?.semana}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-brand-navy">Usuários cadastrados</h2>
              <p className="text-xs text-gray-400 mt-0.5">{total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou CPF..."
                className="text-sm border border-gray-200 rounded-xl px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
              />
              <button type="submit" className="px-4 py-2 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-mid transition-colors">
                Buscar
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <svg className="animate-spin w-8 h-8 text-brand-yellow" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
              </svg>
              <p className="text-sm font-medium">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Nome', 'Email', 'Cidade / UF', 'Cadastro', 'Último login', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-brand-navy">{u.nome}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{u.cpf_mascarado}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5 text-gray-500">{u.cidade && u.estado ? `${u.cidade} — ${u.estado}` : '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{fmt(u.created_at)}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{fmt(u.last_login_at)}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelected(u.id)}
                          className="text-xs font-semibold text-brand-yellow hover:text-brand-yellow-dark opacity-0 group-hover:opacity-100 transition-all"
                        >
                          Ver detalhes →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Página {page} de {pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { const p = page - 1; setPage(p); loadUsuarios(p, query) }}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:border-brand-navy/30 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => { const p = page + 1; setPage(p); loadUsuarios(p, query) }}
                  disabled={page >= pages}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:border-brand-navy/30 transition-colors"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selected && <UserModal userId={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
