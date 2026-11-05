import { StrictMode, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import './admin.css'

interface Row {
  id: number
  name: string
  attending: number
  guests: number
  needs_stay?: number
  message: string | null
  lang: string
  revision: number
  created_at: string
  updated_at: string
}
interface Data {
  summary: { responses: number; attending: number; declined: number; guests: number; stay?: number; stayGuests?: number }
  rows: Row[]
}

const TOKEN_KEY = 'nwd-admin-token'
const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [input, setInput] = useState('')
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [q, setQ] = useState('')

  const load = useCallback(async (tk: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rsvps', { headers: { Authorization: `Bearer ${tk}` } })
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken('')
        throw new Error('That access key is not correct.')
      }
      if (!res.ok) throw new Error('Could not load responses. Please try again.')
      setData((await res.json()) as Data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) void load(token)
  }, [token, load])

  const signIn = (e: FormEvent) => {
    e.preventDefault()
    const tk = input.trim()
    if (!tk) return
    sessionStorage.setItem(TOKEN_KEY, tk)
    setToken(tk)
  }

  const exportCsv = async () => {
    const res = await fetch('/api/admin/rsvps?format=csv', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return setError('Export failed.')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const rows = useMemo(() => {
    const list = data?.rows ?? []
    return list.filter(
      (r) => (filter === 'all' || (filter === 'yes' ? r.attending === 1 : r.attending === 0)) && r.name.toLowerCase().includes(q.toLowerCase()),
    )
  }, [data, filter, q])

  if (!token) {
    return (
      <main className="wrap login">
        <h1>
          N<span>&amp;</span>D · RSVPs
        </h1>
        <form onSubmit={signIn}>
          <label htmlFor="tk">Access key</label>
          <input id="tk" type="password" autoComplete="current-password" value={input} onChange={(e) => setInput(e.target.value)} />
          <button type="submit">View responses</button>
          {error && <p className="err">{error}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="wrap">
      <header>
        <h1>
          N<span>&amp;</span>D · RSVPs
        </h1>
        <div className="actions">
          <button onClick={() => load(token)} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button onClick={exportCsv} className="primary">
            Export CSV
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem(TOKEN_KEY)
              setToken('')
              setData(null)
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      {error && <p className="err">{error}</p>}
      {data && (
        <>
          <section className="stats">
            <div>
              <b>{data.summary.responses}</b>Responses
            </div>
            <div>
              <b>{data.summary.attending}</b>Attending
            </div>
            <div>
              <b>{data.summary.guests}</b>Total guests
            </div>
            <div>
              <b>{data.summary.declined}</b>Declined
            </div>
            <div>
              <b>{data.summary.stay ?? 0}</b>Need a stay ({data.summary.stayGuests ?? 0} guests)
            </div>
          </section>
          <div className="tools">
            <input placeholder="Search name…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All</option>
              <option value="yes">Attending</option>
              <option value="no">Declined</option>
            </select>
          </div>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Attending</th>
                  <th>Guests</th>
                  <th>Stay</th>
                  <th>Message</th>
                  <th>Lang</th>
                  <th>Updated (IST)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>
                      <span className={`pill ${r.attending ? 'yes' : 'no'}`}>{r.attending ? 'Yes' : 'No'}</span>
                    </td>
                    <td>{r.attending ? r.guests : '—'}</td>
                    <td>{r.attending && r.needs_stay ? <span className="pill stay">Needs stay</span> : '—'}</td>
                    <td className="msg">{r.message || '—'}</td>
                    <td>{r.lang.toUpperCase()}</td>
                    <td>
                      {fmt(r.updated_at)}
                      {r.revision > 1 && <small> · edited</small>}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      No responses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}

createRoot(document.getElementById('admin')!).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
)
