import { useEffect, useState, type FormEvent } from 'react'
import { api, localToday } from '../api'
import type { JournalEntry } from '../types'

const MARKET_STATES = ['Trending up', 'Trending down', 'Rangebound', 'High-volatility']

const empty = {
  niftyMove: '',
  whyGuess: '',
  fiiDii: '',
  sectors: '',
  surprise: '',
  marketState: '',
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [date, setDate] = useState(localToday)
  const [form, setForm] = useState(empty)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<JournalEntry[]>('/api/journal').then(setEntries).catch((e) => setError(e.message))
  }, [])

  // When the picked date already has an entry, load it for editing.
  useEffect(() => {
    const existing = entries.find((e) => e.entryDate === date)
    setForm(existing ? { ...existing } : empty)
  }, [date, entries])

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm({ ...form, [key]: value })
    setSaved(false)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const savedEntry = await api.post<JournalEntry>('/api/journal', { entryDate: date, ...form })
      setEntries([savedEntry, ...entries.filter((x) => x.entryDate !== date)]
        .sort((a, b) => b.entryDate.localeCompare(a.entryDate)))
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function remove(id: number) {
    await api.delete(`/api/journal/${id}`)
    setEntries(entries.filter((e) => e.id !== id))
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>📓 Daily Trading Journal</h1>
          <p className="muted">
            The 5-line habit from Module 0 — after 6 months of this you'll have market intuition no course can teach.
          </p>
        </div>
      </header>

      {error && <div className="form-error">{error}</div>}

      <div className="journal-grid">
        <form className="journal-form card" onSubmit={submit}>
          <label>
            Entry date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            1 · What did NIFTY do today? (points, %)
            <input value={form.niftyMove} onChange={(e) => set('niftyMove', e.target.value)}
              placeholder="e.g. +182 pts (+0.8%), closed near day high" />
          </label>
          <label>
            2 · Why? (your best guess)
            <textarea value={form.whyGuess} onChange={(e) => set('whyGuess', e.target.value)}
              placeholder="e.g. Soft US inflation print overnight; banks led the bounce" rows={2} />
          </label>
          <label>
            3 · FII / DII net figures
            <input value={form.fiiDii} onChange={(e) => set('fiiDii', e.target.value)}
              placeholder="e.g. FII −1,240 cr · DII +1,610 cr" />
          </label>
          <label>
            4 · Which sectors led / lagged?
            <input value={form.sectors} onChange={(e) => set('sectors', e.target.value)}
              placeholder="e.g. PSU banks & autos led; IT lagged" />
          </label>
          <label>
            5 · What surprised you?
            <textarea value={form.surprise} onChange={(e) => set('surprise', e.target.value)}
              placeholder="e.g. Midcaps fell even on an index up-day" rows={2} />
          </label>
          <label>
            Market state (from the field guide's four states)
            <select value={form.marketState} onChange={(e) => set('marketState', e.target.value)}>
              <option value="">— pick one —</option>
              {MARKET_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button className="btn btn-primary">{saved ? 'Saved ✓' : 'Save entry'}</button>
        </form>

        <div className="journal-history">
          <h2 className="section-title">History ({entries.length} entries)</h2>
          {entries.length === 0 && <p className="muted">No entries yet. Today is a good day to start the streak.</p>}
          {entries.map((e) => (
            <div key={e.id} className="journal-entry card">
              <div className="journal-entry-head">
                <strong>{e.entryDate}</strong>
                <div>
                  {e.marketState && <span className="state-badge">{e.marketState}</span>}
                  <button className="btn btn-ghost btn-small" onClick={() => setDate(e.entryDate)}>Edit</button>
                  <button className="btn btn-ghost btn-small danger" onClick={() => remove(e.id)}>Delete</button>
                </div>
              </div>
              <ol className="journal-lines">
                {e.niftyMove && <li>{e.niftyMove}</li>}
                {e.whyGuess && <li>{e.whyGuess}</li>}
                {e.fiiDii && <li>{e.fiiDii}</li>}
                {e.sectors && <li>{e.sectors}</li>}
                {e.surprise && <li>{e.surprise}</li>}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
