import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import TaxDeductions from './TaxDeductions'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORIES = [
  { value: 'housing', label: 'Housing', bg: '#eff6ff', color: '#1d4ed8' },
  { value: 'food', label: 'Food', bg: '#f0fdf4', color: '#15803d' },
  { value: 'subscriptions', label: 'Subs', bg: '#fef3c7', color: '#92400e' },
  { value: 'health', label: 'Health', bg: '#fdf4ff', color: '#7e22ce' },
  { value: 'savings', label: 'Savings', bg: '#eff6ff', color: '#1d4ed8' },
  { value: 'travel', label: 'Travel', bg: '#fff7ed', color: '#c2410c' },
  { value: 'salary', label: 'Salary', bg: '#f0fdf4', color: '#15803d' },
  { value: 'other', label: 'Other', bg: '#f7f6f3', color: '#6b6860' },
]

const G = '#1a7a4a', R = '#c0392b', BDR = '#e4e2dc'
const BG2 = '#f7f6f3', MUTED = '#6b6860', HINT = '#9e9b94'
const SANS = 'DM Sans, sans-serif', MONO = 'DM Mono, monospace'

const Badge = ({ category }) => {
  const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[7]
  return <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '500', background: cat.bg, color: cat.color, marginRight: '6px' }}>{cat.label}</span>
}

function AddLineModal({ onClose, onSave, userId, type }) {
  const [form, setForm] = useState({ label: '', category: 'other', type: type || 'expense' })
  const save = async () => {
    if (!form.label) return
    await supabase.from('budget_lines').insert({ ...form, user_id: userId })
    onSave(); onClose()
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: SANS }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '16px' }}>New line</h2>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {[{ v: 'income', l: 'Income' }, { v: 'expense', l: 'Expense' }, { v: 'savings', l: 'Savings' }].map(t => (
            <button key={t.v} onClick={() => setForm({ ...form, type: t.v })}
              style={{ flex: 1, padding: '7px', borderRadius: '7px', border: `1px solid ${form.type === t.v ? G : BDR}`, background: form.type === t.v ? '#e8f5ee' : '#fff', color: form.type === t.v ? G : MUTED, fontFamily: SANS, cursor: 'pointer', fontSize: '12px' }}>
              {t.l}
            </button>
          ))}
        </div>
        <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
          placeholder="Label (e.g. Rent, Salary...)" autoFocus
          style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BDR}`, borderRadius: '7px', fontSize: '13px', fontFamily: SANS, outline: 'none', marginBottom: '12px' }} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BDR}`, borderRadius: '7px', fontSize: '13px', fontFamily: SANS, outline: 'none', background: '#fff', marginBottom: '18px' }}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${BDR}`, borderRadius: '7px', background: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', color: MUTED }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: G, color: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Add</button>
        </div>
      </div>
    </div>
  )
}

function EditValueModal({ line, month, year, currentActual, currentForecast, onClose, onSave, userId }) {
  const [actual, setActual] = useState(currentActual || '')
  const [forecast, setForecast] = useState(currentForecast || '')
  const [repeat, setRepeat] = useState(1)

  const save = async () => {
    const upserts = []
    for (let i = 0; i < repeat; i++) {
      let m = month + i
      let y = year
      if (m > 12) { m -= 12; y += 1 }
      if (actual !== '') upserts.push({ line_id: line.id, user_id: userId, month: m, year: y, amount: parseFloat(actual) || 0, is_forecast: false })
      if (forecast !== '') upserts.push({ line_id: line.id, user_id: userId, month: m, year: y, amount: parseFloat(forecast) || 0, is_forecast: true })
    }
    if (upserts.length > 0) await supabase.from('budget_values').upsert(upserts, { onConflict: 'line_id,month,year,is_forecast' })
    onSave(); onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: SANS }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{line.label}</h2>
        <p style={{ fontSize: '12px', color: MUTED, marginBottom: '18px' }}>{MONTHS[month - 1]} {year}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Actual</label>
            <input value={actual} onChange={e => setActual(e.target.value)} type="number" placeholder="0" autoFocus
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BDR}`, borderRadius: '7px', fontSize: '16px', fontFamily: MONO, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Forecast</label>
            <input value={forecast} onChange={e => setForecast(e.target.value)} type="number" placeholder="0"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BDR}`, borderRadius: '7px', fontSize: '16px', fontFamily: MONO, outline: 'none', background: BG2 }} />
          </div>
        </div>

        <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '6px' }}>Repeat for</label>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '18px' }}>
          {[1, 2, 3, 4, 6, 12].map(n => (
            <button key={n} onClick={() => setRepeat(n)}
              style={{ flex: 1, padding: '6px 2px', borderRadius: '6px', border: `1px solid ${repeat === n ? G : BDR}`, background: repeat === n ? '#e8f5ee' : '#fff', color: repeat === n ? G : MUTED, fontFamily: SANS, cursor: 'pointer', fontSize: '11px' }}>
              {n === 1 ? '1m' : `${n}m`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${BDR}`, borderRadius: '7px', background: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', color: MUTED }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: G, color: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function BudgetTable({ user }) {
  const now = new Date()
  const [startMonth, setStartMonth] = useState(now.getMonth())
  const [year] = useState(now.getFullYear())
  const [visibleCount, setVisibleCount] = useState(6)
  const [lines, setLines] = useState([])
  const [actuals, setActuals] = useState({})
  const [forecasts, setForecasts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState('expense')
  const [editCell, setEditCell] = useState(null)
  const [expandedMonths, setExpandedMonths] = useState(new Set())

  const visibleMonths = Array.from({ length: visibleCount }, (_, i) => {
    let m = startMonth + i + 1
    let y = year
    if (m > 12) { m -= 12; y += 1 }
    return { month: m, year: y }
  })

  const fetchData = async () => {
    setLoading(true)
    const { data: linesData } = await supabase.from('budget_lines').select('*').eq('user_id', user.id).order('created_at')
    const { data: valuesData } = await supabase.from('budget_values').select('*').eq('user_id', user.id)
    const actualMap = {}, forecastMap = {}
    valuesData?.forEach(v => {
      const key = `${v.line_id}-${v.month}-${v.year}`
      if (v.is_forecast) forecastMap[key] = v.amount
      else actualMap[key] = v.amount
    })
    setLines(linesData || [])
    setActuals(actualMap)
    setForecasts(forecastMap)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getActual = (lid, m, y) => actuals[`${lid}-${m}-${y}`] ?? 0
  const getForecast = (lid, m, y) => forecasts[`${lid}-${m}-${y}`] ?? 0

  const secActual = (type, m, y) => lines.filter(l => l.type === type).reduce((s, l) => s + getActual(l.id, m, y), 0)
  const secForecast = (type, m, y) => lines.filter(l => l.type === type).reduce((s, l) => s + getForecast(l.id, m, y), 0)

  const rowActualTotal = (lid) => visibleMonths.reduce((s, { month, year }) => s + getActual(lid, month, year), 0)

  const toggleMonth = (key) => {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const fmtN = (v, sign = 1) => {
    const val = v * sign
    if (val === 0) return <span style={{ color: HINT }}>—</span>
    return <span style={{ color: val > 0 ? G : R }}>{val < 0 ? '−' : ''}{Math.abs(Math.round(val)).toLocaleString('en-AU')}</span>
  }

  const fmtVar = (actual, forecast, sign = 1) => {
    if (actual === 0 && forecast === 0) return <span style={{ color: HINT }}>—</span>
    const variance = (actual - forecast) * sign
    if (variance === 0) return <span style={{ color: HINT }}>0</span>
    return <span style={{ color: variance > 0 ? G : R, fontWeight: '500' }}>{variance > 0 ? '+' : '−'}{Math.abs(Math.round(variance)).toLocaleString('en-AU')}</span>
  }

  const fmtTot = (v) => <span style={{ color: v > 0 ? G : v < 0 ? R : HINT, fontWeight: '500' }}>{v < 0 ? '−' : ''}{Math.abs(Math.round(v)).toLocaleString('en-AU')}</span>

  const incLines = lines.filter(l => l.type === 'income')
  const expLines = lines.filter(l => l.type === 'expense')
  const savLines = lines.filter(l => l.type === 'savings')
  const currency = user.currency === 'AUD' ? 'A$' : '€'

  const TH = { fontSize: '11px', fontWeight: '500', color: HINT, padding: '6px 8px', textAlign: 'right', borderBottom: `1px solid ${BDR}`, background: BG2, whiteSpace: 'nowrap', width: '75px' }
  const TD = { padding: '5px 8px', textAlign: 'right', borderBottom: `0.5px solid ${BDR}`, fontFamily: MONO, fontSize: '12px', cursor: 'pointer', width: '75px' }
  const TDL = { padding: '5px 12px', textAlign: 'left', borderBottom: `0.5px solid ${BDR}`, fontFamily: SANS, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }

  const SectionHeader = ({ label, type }) => (
    <tr>
      <td colSpan={100} style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: HINT, padding: '10px 12px 4px', background: BG2, borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{label}</span>
          <button onClick={() => { setAddType(type); setShowAdd(true) }}
            style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', border: `0.5px solid ${BDR}`, background: 'transparent', cursor: 'pointer', color: MUTED, fontFamily: SANS }}>
            + Add
          </button>
        </div>
      </td>
    </tr>
  )

  const variances = []
  visibleMonths.forEach(({ month, year }) => {
    const key = `${month}-${year}`
    if (expandedMonths.has(key)) {
      const incA = secActual('income', month, year), incF = secForecast('income', month, year)
      const expA = secActual('expense', month, year), expF = secForecast('expense', month, year)
      const freeA = incA - expA, freeF = incF - expF
      if (freeA !== freeF && freeF !== 0) {
        variances.push({ month, year, diff: freeA - freeF })
      }
    }
  })

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: MUTED, fontFamily: SANS }}>Loading...</div>

  return (
    <div style={{ fontFamily: SANS }}>
      {showAdd && <AddLineModal onClose={() => setShowAdd(false)} onSave={fetchData} userId={user.id} type={addType} />}
      {editCell && (
        <EditValueModal
          line={editCell.line} month={editCell.month} year={editCell.year}
          currentActual={editCell.actual} currentForecast={editCell.forecast}
          onClose={() => setEditCell(null)} onSave={fetchData} userId={user.id}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1917' }}>Actual Budget {year} · {currency}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setStartMonth(m => m - 1)}
            style={{ width: '28px', height: '28px', border: `0.5px solid ${BDR}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: MUTED }}>‹</button>
          <span style={{ fontSize: '12px', color: MUTED, minWidth: '140px', textAlign: 'center' }}>
            {MONTHS[visibleMonths[0].month - 1]} → {MONTHS[visibleMonths[visibleCount - 1].month - 1]} {visibleMonths[visibleCount - 1].year}
          </span>
          <button onClick={() => setStartMonth(m => m + 1)}
            style={{ width: '28px', height: '28px', border: `0.5px solid ${BDR}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: MUTED }}>›</button>
          <select value={visibleCount} onChange={e => setVisibleCount(Number(e.target.value))}
            style={{ padding: '5px 8px', border: `0.5px solid ${BDR}`, borderRadius: '6px', fontSize: '12px', fontFamily: SANS, background: '#fff', color: MUTED, cursor: 'pointer', outline: 'none' }}>
            {[3, 4, 5, 6, 9, 12].map(n => <option key={n} value={n}>{n} months</option>)}
          </select>
          <span style={{ fontSize: '11px', color: HINT }}>Click month to expand</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `0.5px solid ${BDR}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: 'left', paddingLeft: '12px', width: '150px' }}>In {currency}</th>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                const expanded = expandedMonths.has(key)
                return expanded ? (
                  <>
                    <th key={`${key}-label`} colSpan={3}
                      onClick={() => toggleMonth(key)}
                      style={{ ...TH, textAlign: 'center', cursor: 'pointer', background: G, color: '#fff', borderRight: `1px solid ${BDR}` }}>
                      {MONTHS[month - 1]}-{String(year).slice(2)} ▴
                    </th>
                  </>
                ) : (
                  <th key={key} onClick={() => toggleMonth(key)}
                    style={{ ...TH, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.target.style.background = '#e8f5ee'; e.target.style.color = G }}
                    onMouseLeave={e => { e.target.style.background = BG2; e.target.style.color = HINT }}>
                    {MONTHS[month - 1]}-{String(year).slice(2)}
                  </th>
                )
              })}
              <th style={{ ...TH, background: '#e8f5ee', color: G, width: '80px' }}>Total</th>
            </tr>
            <tr>
              <th style={{ ...TH, borderTop: 'none', borderBottom: `1px solid ${BDR}` }}></th>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                return expandedMonths.has(key) ? (
                  <>
                    <th key={`${key}-f`} style={{ ...TH, fontSize: '9px', background: BG2, borderTop: 'none' }}>Forecast</th>
                    <th key={`${key}-a`} style={{ ...TH, fontSize: '9px', background: '#fff', borderTop: 'none' }}>Actual</th>
                    <th key={`${key}-v`} style={{ ...TH, fontSize: '9px', background: '#e8f5ee', color: G, borderTop: 'none', borderRight: `1px solid ${BDR}` }}>Var.</th>
                  </>
                ) : (
                  <th key={key} style={{ ...TH, borderTop: 'none' }}></th>
                )
              })}
              <th style={{ ...TH, background: '#e8f5ee', borderTop: 'none' }}></th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="Income" type="income" />
            {incLines.map(line => (
              <tr key={line.id}>
                <td style={TDL}>
                  <Badge category={line.category} />{line.label}
                  <span onClick={() => supabase.from('budget_lines').delete().eq('id', line.id).then(fetchData)}
                    style={{ marginLeft: '6px', cursor: 'pointer', fontSize: '10px', color: R, opacity: 0.4 }}>✕</span>
                </td>
                {visibleMonths.map(({ month, year }) => {
                  const key = `${month}-${year}`
                  const a = getActual(line.id, month, year)
                  const f = getForecast(line.id, month, year)
                  return expandedMonths.has(key) ? (
                    <>
                      <td key={`${key}-f`} style={{ ...TD, background: BG2 }} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(f)}</td>
                      <td key={`${key}-a`} style={TD} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(a)}</td>
                      <td key={`${key}-v`} style={{ ...TD, background: '#e8f5ee', borderRight: `1px solid ${BDR}` }}>{fmtVar(a, f)}</td>
                    </>
                  ) : (
                    <td key={key} style={TD} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(a)}</td>
                  )
                })}
                <td style={{ ...TD, background: '#f0fdf4' }}>{fmtTot(rowActualTotal(line.id))}</td>
              </tr>
            ))}
            {incLines.length === 0 && <tr><td colSpan={100} style={{ ...TDL, color: HINT, fontStyle: 'italic' }}>No income lines yet</td></tr>}

            <tr style={{ background: '#f0fdf4' }}>
              <td style={{ ...TDL, fontWeight: '500', background: '#f0fdf4', borderTop: `1px solid ${BDR}` }}>Total income</td>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                const a = secActual('income', month, year)
                const f = secForecast('income', month, year)
                return expandedMonths.has(key) ? (
                  <>
                    <td key={`${key}-f`} style={{ ...TD, background: BG2, fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(f)}</td>
                    <td key={`${key}-a`} style={{ ...TD, background: '#f0fdf4', fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(a)}</td>
                    <td key={`${key}-v`} style={{ ...TD, background: '#e8f5ee', fontWeight: '500', borderTop: `1px solid ${BDR}`, borderRight: `1px solid ${BDR}` }}>{fmtVar(a, f)}</td>
                  </>
                ) : (
                  <td key={key} style={{ ...TD, background: '#f0fdf4', fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(a)}</td>
                )
              })}
              <td style={{ ...TD, background: '#f0fdf4', fontWeight: '600', borderTop: `1px solid ${BDR}` }}>{fmtTot(visibleMonths.reduce((s, { month, year }) => s + secActual('income', month, year), 0))}</td>
            </tr>

            <SectionHeader label="Expenses" type="expense" />
            {expLines.map(line => (
              <tr key={line.id}>
                <td style={TDL}>
                  <Badge category={line.category} />{line.label}
                  <span onClick={() => supabase.from('budget_lines').delete().eq('id', line.id).then(fetchData)}
                    style={{ marginLeft: '6px', cursor: 'pointer', fontSize: '10px', color: R, opacity: 0.4 }}>✕</span>
                </td>
                {visibleMonths.map(({ month, year }) => {
                  const key = `${month}-${year}`
                  const a = getActual(line.id, month, year)
                  const f = getForecast(line.id, month, year)
                  return expandedMonths.has(key) ? (
                    <>
                      <td key={`${key}-f`} style={{ ...TD, background: BG2 }} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(f, -1)}</td>
                      <td key={`${key}-a`} style={TD} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(a, -1)}</td>
                      <td key={`${key}-v`} style={{ ...TD, background: a <= f ? '#e8f5ee' : '#fdf0ee', borderRight: `1px solid ${BDR}` }}>{fmtVar(f, a)}</td>
                    </>
                  ) : (
                    <td key={key} style={TD} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(a, -1)}</td>
                  )
                })}
                <td style={{ ...TD, background: '#fdf0ee' }}>{fmtTot(-visibleMonths.reduce((s, { month, year }) => s + getActual(line.id, month, year), 0))}</td>
              </tr>
            ))}
            {expLines.length === 0 && <tr><td colSpan={100} style={{ ...TDL, color: HINT, fontStyle: 'italic' }}>No expense lines yet</td></tr>}

            <tr style={{ background: '#fdf0ee' }}>
              <td style={{ ...TDL, fontWeight: '500', background: '#fdf0ee', borderTop: `1px solid ${BDR}` }}>Total expenses</td>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                const a = secActual('expense', month, year)
                const f = secForecast('expense', month, year)
                return expandedMonths.has(key) ? (
                  <>
                    <td key={`${key}-f`} style={{ ...TD, background: BG2, fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(f, -1)}</td>
                    <td key={`${key}-a`} style={{ ...TD, background: '#fdf0ee', fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(a, -1)}</td>
                    <td key={`${key}-v`} style={{ ...TD, background: a <= f ? '#e8f5ee' : '#fdf0ee', fontWeight: '500', borderTop: `1px solid ${BDR}`, borderRight: `1px solid ${BDR}` }}>{fmtVar(f, a)}</td>
                  </>
                ) : (
                  <td key={key} style={{ ...TD, background: '#fdf0ee', fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(a, -1)}</td>
                )
              })}
              <td style={{ ...TD, background: '#fdf0ee', fontWeight: '600', borderTop: `1px solid ${BDR}` }}>{fmtTot(-visibleMonths.reduce((s, { month, year }) => s + secActual('expense', month, year), 0))}</td>
            </tr>

            <tr style={{ background: BG2 }}>
              <td style={{ ...TDL, fontWeight: '500', background: BG2 }}>Income after expenses</td>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                const a = secActual('income', month, year) - secActual('expense', month, year)
                const f = secForecast('income', month, year) - secForecast('expense', month, year)
                return expandedMonths.has(key) ? (
                  <>
                    <td key={`${key}-f`} style={{ ...TD, background: BG2, fontWeight: '500' }}>{fmtN(f)}</td>
                    <td key={`${key}-a`} style={{ ...TD, background: BG2, fontWeight: '500' }}>{fmtN(a)}</td>
                    <td key={`${key}-v`} style={{ ...TD, background: a >= f ? '#e8f5ee' : '#fdf0ee', fontWeight: '500', borderRight: `1px solid ${BDR}` }}>{fmtVar(a, f)}</td>
                  </>
                ) : (
                  <td key={key} style={{ ...TD, background: BG2, fontWeight: '500' }}>{fmtN(a)}</td>
                )
              })}
              <td style={{ ...TD, background: BG2, fontWeight: '600' }}>{fmtTot(visibleMonths.reduce((s, { month, year }) => s + secActual('income', month, year) - secActual('expense', month, year), 0))}</td>
            </tr>

            <SectionHeader label="Savings" type="savings" />
            {savLines.map(line => (
              <tr key={line.id}>
                <td style={TDL}>
                  <Badge category={line.category} />{line.label}
                  <span onClick={() => supabase.from('budget_lines').delete().eq('id', line.id).then(fetchData)}
                    style={{ marginLeft: '6px', cursor: 'pointer', fontSize: '10px', color: R, opacity: 0.4 }}>✕</span>
                </td>
                {visibleMonths.map(({ month, year }) => {
                  const key = `${month}-${year}`
                  const a = getActual(line.id, month, year)
                  const f = getForecast(line.id, month, year)
                  return expandedMonths.has(key) ? (
                    <>
                      <td key={`${key}-f`} style={{ ...TD, background: BG2 }} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(f, -1)}</td>
                      <td key={`${key}-a`} style={TD} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(a, -1)}</td>
                      <td key={`${key}-v`} style={{ ...TD, background: '#e8f5ee', borderRight: `1px solid ${BDR}` }}>{fmtVar(f, a)}</td>
                    </>
                  ) : (
                    <td key={key} style={TD} onClick={() => setEditCell({ line, month, year, actual: a, forecast: f })}>{fmtN(a, -1)}</td>
                  )
                })}
                <td style={{ ...TD, background: '#eff6ff' }}>{fmtTot(-visibleMonths.reduce((s, { month, year }) => s + getActual(line.id, month, year), 0))}</td>
              </tr>
            ))}
            {savLines.length === 0 && <tr><td colSpan={100} style={{ ...TDL, color: HINT, fontStyle: 'italic' }}>No savings lines yet</td></tr>}

            <tr style={{ background: '#eff6ff' }}>
              <td style={{ ...TDL, fontWeight: '500', background: '#eff6ff', borderTop: `1px solid ${BDR}` }}>Total savings</td>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                const a = secActual('savings', month, year)
                const f = secForecast('savings', month, year)
                return expandedMonths.has(key) ? (
                  <>
                    <td key={`${key}-f`} style={{ ...TD, background: BG2, fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(f, -1)}</td>
                    <td key={`${key}-a`} style={{ ...TD, background: '#eff6ff', fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(a, -1)}</td>
                    <td key={`${key}-v`} style={{ ...TD, background: '#e8f5ee', fontWeight: '500', borderTop: `1px solid ${BDR}`, borderRight: `1px solid ${BDR}` }}>{fmtVar(f, a)}</td>
                  </>
                ) : (
                  <td key={key} style={{ ...TD, background: '#eff6ff', fontWeight: '500', borderTop: `1px solid ${BDR}` }}>{fmtN(a, -1)}</td>
                )
              })}
              <td style={{ ...TD, background: '#eff6ff', fontWeight: '600', borderTop: `1px solid ${BDR}` }}>{fmtTot(-visibleMonths.reduce((s, { month, year }) => s + secActual('savings', month, year), 0))}</td>
            </tr>

            <tr style={{ background: G }}>
              <td style={{ ...TDL, color: '#fff', fontWeight: '600', fontSize: '13px', maxWidth: '150px' }}>Free income</td>
              {visibleMonths.map(({ month, year }) => {
                const key = `${month}-${year}`
                const a = secActual('income', month, year) - secActual('expense', month, year) - secActual('savings', month, year)
                const f = secForecast('income', month, year) - secForecast('expense', month, year) - secForecast('savings', month, year)
                return expandedMonths.has(key) ? (
                  <>
                    <td key={`${key}-f`} style={{ ...TD, color: '#fff', fontWeight: '500', background: '#0f5e38' }}>{Math.round(f).toLocaleString('en-AU')}</td>
                    <td key={`${key}-a`} style={{ ...TD, color: '#fff', fontWeight: '500', background: G }}>{Math.round(a).toLocaleString('en-AU')}</td>
                    <td key={`${key}-v`} style={{ ...TD, color: a >= f ? '#86efac' : '#fca5a5', fontWeight: '600', background: '#0f5e38', borderRight: `1px solid rgba(255,255,255,0.2)` }}>
                      {a === f ? '0' : `${a > f ? '+' : '−'}${Math.abs(Math.round(a - f)).toLocaleString('en-AU')}`}
                    </td>
                  </>
                ) : (
                  <td key={key} style={{ ...TD, color: '#fff', fontWeight: '500', background: G }}>{Math.round(a).toLocaleString('en-AU')}</td>
                )
              })}
              <td style={{ ...TD, color: '#fff', fontWeight: '700', background: G }}>
                {Math.round(visibleMonths.reduce((s, { month, year }) =>
                  s + secActual('income', month, year) - secActual('expense', month, year) - secActual('savings', month, year), 0
                )).toLocaleString('en-AU')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {variances.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {variances.map(({ month, year, diff }) => (
            <div key={`${month}-${year}`} style={{ padding: '10px 14px', background: diff < 0 ? '#fdf0ee' : '#e8f5ee', borderRadius: '8px', fontSize: '12px', color: diff < 0 ? R : G, border: `0.5px solid ${diff < 0 ? '#fca5a5' : '#a7f3d0'}` }}>
              {MONTHS[month - 1]} {year} variance: Free income {diff > 0 ? '+' : ''}{Math.round(diff).toLocaleString('en-AU')} {currency} vs forecast
            </div>
          ))}
        </div>
      )}
      <TaxDeductions user={user} />
    </div>
  )
}