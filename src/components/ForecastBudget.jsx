import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

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

function EditValueModal({ line, month, year, currentValue, onClose, onSave, userId }) {
  const [amount, setAmount] = useState(currentValue || '')
  const [repeat, setRepeat] = useState(1)

  const save = async () => {
    const val = parseFloat(amount) || 0
    const upserts = []
    for (let i = 0; i < repeat; i++) {
      let m = month + i
      let y = year
      if (m > 12) { m -= 12; y += 1 }
      upserts.push({
        line_id: line.id,
        user_id: userId,
        month: m,
        year: y,
        amount: val,
        is_forecast: true
      })
    }
    await supabase.from('budget_values').upsert(upserts, { onConflict: 'line_id,month,year,is_forecast' })
    onSave(); onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: SANS }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{line.label}</h2>
        <p style={{ fontSize: '12px', color: MUTED, marginBottom: '16px' }}>{MONTHS[month - 1]} {year}</p>

        <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Forecasted amount</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0" autoFocus
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BDR}`, borderRadius: '7px', fontSize: '18px', fontFamily: MONO, outline: 'none', marginBottom: '14px', background: BG2 }} />

        <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '6px' }}>Repeat for</label>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '18px' }}>
          {[1, 2, 3, 4, 6, 12].map(n => (
            <button key={n} onClick={() => setRepeat(n)}
              style={{ flex: 1, padding: '6px 2px', borderRadius: '6px', border: `1px solid ${repeat === n ? G : BDR}`, background: repeat === n ? '#e8f5ee' : '#fff', color: repeat === n ? G : MUTED, fontFamily: SANS, cursor: 'pointer', fontSize: '11px' }}>
              {n === 1 ? '1m' : `${n}m`}
            </button>
          ))}
        </div>

        {repeat > 1 && (
          <div style={{ fontSize: '11px', color: MUTED, background: '#f0fdf4', padding: '8px 12px', borderRadius: '7px', marginBottom: '14px' }}>
            Applies from {MONTHS[month - 1]} to {MONTHS[((month - 1 + repeat - 1) % 12)]} {year + Math.floor((month - 1 + repeat - 1) / 12)}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${BDR}`, borderRadius: '7px', background: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', color: MUTED }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: G, color: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Save forecast</button>
        </div>
      </div>
    </div>
  )
}

export default function ForecastBudget({ user }) {
  const now = new Date()
  const [startMonth, setStartMonth] = useState(now.getMonth())
  const [year] = useState(now.getFullYear())
  const [visibleCount, setVisibleCount] = useState(6)
  const [lines, setLines] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState('expense')
  const [editCell, setEditCell] = useState(null)

  const visibleMonths = Array.from({ length: visibleCount }, (_, i) => {
    let m = startMonth + i + 1
    let y = year
    if (m > 12) { m -= 12; y += 1 }
    return { month: m, year: y }
  })

  const fetchData = async () => {
    setLoading(true)
    const { data: linesData } = await supabase.from('budget_lines').select('*').eq('user_id', user.id).order('created_at')
    const { data: valuesData } = await supabase.from('budget_values').select('*').eq('user_id', user.id).eq('is_forecast', true)
    const valMap = {}
    valuesData?.forEach(v => { valMap[`${v.line_id}-${v.month}-${v.year}`] = v.amount })
    setLines(linesData || [])
    setValues(valMap)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getVal = (lid, m, y) => values[`${lid}-${m}-${y}`] ?? 0
  const rowTotal = (lid) => visibleMonths.reduce((s, { month, year }) => s + getVal(lid, month, year), 0)
  const secTotal = (type, m, y) => lines.filter(l => l.type === type).reduce((s, l) => s + getVal(l.id, m, y), 0)

  const fmtVal = (v) => v === 0
    ? <span style={{ color: HINT }}>—</span>
    : <span style={{ color: v > 0 ? G : R }}>{v < 0 ? '−' : ''}{Math.abs(Math.round(v)).toLocaleString('en-AU')}</span>

  const fmtTot = (v) =>
    <span style={{ color: v > 0 ? G : v < 0 ? R : HINT, fontWeight: '500' }}>
      {v < 0 ? '−' : ''}{Math.abs(Math.round(v)).toLocaleString('en-AU')}
    </span>

  const incLines = lines.filter(l => l.type === 'income')
  const expLines = lines.filter(l => l.type === 'expense')
  const savLines = lines.filter(l => l.type === 'savings')
  const currency = user.currency === 'AUD' ? 'A$' : '€'

const TH = { fontSize: '11px', fontWeight: '500', color: HINT, padding: '6px 8px', textAlign: 'right', borderBottom: `1px solid ${BDR}`, background: BG2, whiteSpace: 'nowrap' }
const TD = { padding: '5px 8px', textAlign: 'right', borderBottom: `0.5px solid ${BDR}`, fontFamily: MONO, fontSize: '12px', cursor: 'pointer' }
const TDL = { padding: '5px 12px', textAlign: 'left', borderBottom: `0.5px solid ${BDR}`, fontFamily: SANS, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: '130px', maxWidth: '180px' }

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

  const TotalRow = ({ label, type, bg }) => {
    const tots = visibleMonths.map(({ month, year }) => secTotal(type, month, year))
    const grand = tots.reduce((s, v) => s + v, 0)
    return (
      <tr style={{ background: bg }}>
        <td style={{ ...TDL, fontWeight: '500', background: bg, borderTop: `1px solid ${BDR}`, maxWidth: '150px' }}>{label}</td>
        {tots.map((v, i) => <td key={i} style={{ ...TD, fontWeight: '500', background: bg, borderTop: `1px solid ${BDR}` }}>{fmtTot(v)}</td>)}
        <td style={{ ...TD, fontWeight: '600', background: bg, borderTop: `1px solid ${BDR}` }}>{fmtTot(grand)}</td>
      </tr>
    )
  }

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: MUTED, fontFamily: SANS }}>Loading...</div>

  return (
    <div style={{ fontFamily: SANS }}>
      {showAdd && <AddLineModal onClose={() => setShowAdd(false)} onSave={fetchData} userId={user.id} type={addType} />}
      {editCell && (
        <EditValueModal
          line={editCell.line} month={editCell.month} year={editCell.year}
          currentValue={editCell.value}
          onClose={() => setEditCell(null)} onSave={fetchData} userId={user.id}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1917' }}>Forecasted Budget {year} · {currency}</div>
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
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `0.5px solid ${BDR}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: 'left', paddingLeft: '12px', width: '150px' }}>In {currency}</th>
              {visibleMonths.map(({ month, year }) => (
                <th key={`${month}-${year}`} style={TH}>{MONTHS[month - 1]}-{String(year).slice(2)}</th>
              ))}
              <th style={{ ...TH, background: '#e8f5ee', color: G, width: '80px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="Income" type="income" />
            {incLines.map(line => (
              <tr key={line.id}>
                <td style={TDL}><Badge category={line.category} />{line.label}</td>
                {visibleMonths.map(({ month, year }) => {
                  const v = getVal(line.id, month, year)
                  return <td key={`${month}-${year}`} style={TD} onClick={() => setEditCell({ line, month, year, value: v })}>{fmtVal(v)}</td>
                })}
                <td style={{ ...TD, background: '#f0fdf4' }}>{fmtTot(rowTotal(line.id))}</td>
              </tr>
            ))}
            {incLines.length === 0 && <tr><td colSpan={100} style={{ ...TDL, color: HINT, fontStyle: 'italic' }}>No income lines yet</td></tr>}
            <TotalRow label="Total income" type="income" bg="#f0fdf4" />

            <SectionHeader label="Expenses" type="expense" />
            {expLines.map(line => (
              <tr key={line.id}>
                <td style={TDL}><Badge category={line.category} />{line.label}</td>
                {visibleMonths.map(({ month, year }) => {
                  const v = getVal(line.id, month, year)
                  return <td key={`${month}-${year}`} style={TD} onClick={() => setEditCell({ line, month, year, value: v })}>{fmtVal(-v)}</td>
                })}
                <td style={{ ...TD, background: '#fdf0ee' }}>{fmtTot(-rowTotal(line.id))}</td>
              </tr>
            ))}
            {expLines.length === 0 && <tr><td colSpan={100} style={{ ...TDL, color: HINT, fontStyle: 'italic' }}>No expense lines yet</td></tr>}
            <TotalRow label="Total expenses" type="expense" bg="#fdf0ee" />

            <tr style={{ background: BG2 }}>
              <td style={{ ...TDL, fontWeight: '500', background: BG2 }}>Income after expenses</td>
              {visibleMonths.map(({ month, year }) => {
                const v = secTotal('income', month, year) - secTotal('expense', month, year)
                return <td key={`${month}-${year}`} style={{ ...TD, background: BG2, fontWeight: '500' }}>{fmtTot(v)}</td>
              })}
              <td style={{ ...TD, background: BG2, fontWeight: '600' }}>
                {fmtTot(visibleMonths.reduce((s, { month, year }) => s + secTotal('income', month, year) - secTotal('expense', month, year), 0))}
              </td>
            </tr>

            <SectionHeader label="Savings" type="savings" />
            {savLines.map(line => (
              <tr key={line.id}>
                <td style={TDL}><Badge category={line.category} />{line.label}</td>
                {visibleMonths.map(({ month, year }) => {
                  const v = getVal(line.id, month, year)
                  return <td key={`${month}-${year}`} style={TD} onClick={() => setEditCell({ line, month, year, value: v })}>{fmtVal(-v)}</td>
                })}
                <td style={{ ...TD, background: '#eff6ff' }}>{fmtTot(-rowTotal(line.id))}</td>
              </tr>
            ))}
            {savLines.length === 0 && <tr><td colSpan={100} style={{ ...TDL, color: HINT, fontStyle: 'italic' }}>No savings lines yet</td></tr>}
            <TotalRow label="Total savings" type="savings" bg="#eff6ff" />

            <tr style={{ background: G }}>
              <td style={{ ...TDL, color: '#fff', fontWeight: '600', fontSize: '13px', maxWidth: '150px' }}>Free income</td>
              {visibleMonths.map(({ month, year }) => {
                const v = secTotal('income', month, year) - secTotal('expense', month, year) - secTotal('savings', month, year)
                return <td key={`${month}-${year}`} style={{ ...TD, color: '#fff', fontWeight: '500' }}>{Math.round(v).toLocaleString('en-AU')}</td>
              })}
              <td style={{ ...TD, color: '#fff', fontWeight: '700' }}>
                {Math.round(visibleMonths.reduce((s, { month, year }) =>
                  s + secTotal('income', month, year) - secTotal('expense', month, year) - secTotal('savings', month, year), 0
                )).toLocaleString('en-AU')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}