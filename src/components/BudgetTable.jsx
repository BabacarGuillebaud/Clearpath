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

const green = '#1a7a4a'
const red = '#c0392b'
const border = '#e4e2dc'
const bg2 = '#f7f6f3'
const muted = '#6b6860'
const hint = '#9e9b94'
const sans = 'DM Sans, system-ui, sans-serif'
const mono = 'DM Mono, monospace'

function Badge({ category }) {
  const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1]
  return <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '500', background: cat.bg, color: cat.color, marginRight: '6px', whiteSpace: 'nowrap' }}>{cat.label}</span>
}

function AddLineModal({ onClose, onSave, userId, type }) {
  const [form, setForm] = useState({ label: '', category: 'other', type: type || 'expense', is_recurring: true })

  const save = async () => {
    if (!form.label) return
    await supabase.from('budget_lines').insert({ ...form, user_id: userId })
    onSave()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: sans }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '18px' }}>New line</h2>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Type</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{ v: 'income', l: 'Income' }, { v: 'expense', l: 'Expense' }, { v: 'savings', l: 'Savings' }].map(t => (
              <button key={t.v} onClick={() => setForm({ ...form, type: t.v })}
                style={{ flex: 1, padding: '7px', borderRadius: '7px', border: `1px solid ${form.type === t.v ? green : border}`, background: form.type === t.v ? '#e8f5ee' : '#fff', color: form.type === t.v ? green : muted, fontFamily: sans, cursor: 'pointer', fontSize: '12px' }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Label</label>
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. Rent, Salary..."
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '13px', fontFamily: sans, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '13px', fontFamily: sans, outline: 'none', background: '#fff' }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${border}`, borderRadius: '7px', background: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '13px', color: muted }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: green, color: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Add</button>
        </div>
      </div>
    </div>
  )
}

function EditValueModal({ line, month, year, currentValue, onClose, onSave, userId }) {
  const [amount, setAmount] = useState(currentValue || '')

  const save = async () => {
    const val = parseFloat(amount) || 0
    await supabase.from('budget_values').upsert({
      line_id: line.id, user_id: userId, month, year, amount: val
    }, { onConflict: 'line_id,month,year' })
    onSave()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: sans }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>{line.label}</h2>
        <p style={{ fontSize: '12px', color: muted, marginBottom: '18px' }}>{MONTHS[month - 1]} {year}</p>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Amount</label>
          <input value={amount} onChange={e => setAmount(e.target.value)}
            type="number" placeholder="0" autoFocus
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '16px', fontFamily: mono, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${border}`, borderRadius: '7px', background: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '13px', color: muted }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: green, color: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function BudgetTable({ user }) {
  const now = new Date()
  const [startMonth, setStartMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [lines, setLines] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState('expense')
  const [editCell, setEditCell] = useState(null)

  const visibleMonths = Array.from({ length: 5 }, (_, i) => {
    let m = startMonth + i + 1
    let y = year
    if (m > 12) { m -= 12; y += 1 }
    return { month: m, year: y }
  })

  const fetchData = async () => {
    setLoading(true)
    const { data: linesData } = await supabase.from('budget_lines').select('*').eq('user_id', user.id).order('created_at')
    const { data: valuesData } = await supabase.from('budget_values').select('*').eq('user_id', user.id)
    const valMap = {}
    valuesData?.forEach(v => { valMap[`${v.line_id}-${v.month}-${v.year}`] = v.amount })
    setLines(linesData || [])
    setValues(valMap)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getValue = (lineId, month, year) => values[`${lineId}-${month}-${year}`] ?? 0
  const getRowTotal = (lineId) => visibleMonths.reduce((sum, { month, year }) => sum + getValue(lineId, month, year), 0)
  const getSectionTotal = (type, month, year) => lines.filter(l => l.type === type).reduce((sum, l) => sum + getValue(l.id, month, year), 0)

  const deleteLine = async (id) => {
    await supabase.from('budget_lines').delete().eq('id', id)
    fetchData()
  }

  const formatValue = (v) => {
    if (v === 0) return <span style={{ color: hint }}>0</span>
    return <span style={{ color: v > 0 ? green : red }}>{v < 0 ? '−' : ''}{Math.abs(Math.round(v)).toLocaleString('en-AU')}</span>
  }

  const formatTotal = (v, bold) => {
    const color = v > 0 ? green : v < 0 ? red : hint
    return <span style={{ color, fontWeight: bold ? '500' : '400' }}>{v < 0 ? '−' : ''}{Math.abs(Math.round(v)).toLocaleString('en-AU')}</span>
  }

  const incomeLines = lines.filter(l => l.type === 'income')
  const expenseLines = lines.filter(l => l.type === 'expense')
  const savingsLines = lines.filter(l => l.type === 'savings')

  const thStyle = { fontSize: '11px', fontWeight: '500', color: hint, padding: '8px 10px', textAlign: 'right', borderBottom: `1px solid ${border}`, background: bg2, whiteSpace: 'nowrap' }
  const tdStyle = { padding: '7px 10px', textAlign: 'right', borderBottom: `0.5px solid ${border}`, fontFamily: mono, fontSize: '12px', cursor: 'pointer' }
  const tdLabelStyle = { padding: '7px 12px', textAlign: 'left', borderBottom: `0.5px solid ${border}`, fontFamily: sans, fontSize: '12px' }

  const SectionHeader = ({ label, type }) => (
    <tr>
      <td colSpan={visibleMonths.length + 2} style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: hint, padding: '10px 12px 4px', background: bg2, borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{label}</span>
          <button onClick={() => { setAddType(type); setShowAddModal(true) }}
            style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', border: `0.5px solid ${border}`, background: 'transparent', cursor: 'pointer', color: muted, fontFamily: sans }}>
            + Add
          </button>
        </div>
      </td>
    </tr>
  )

  const TotalRow = ({ label, type, highlight }) => {
    const totals = visibleMonths.map(({ month, year }) => getSectionTotal(type, month, year))
    const grandTotal = totals.reduce((s, v) => s + v, 0)
    return (
      <tr style={{ background: highlight || '#f0fdf4' }}>
        <td style={{ ...tdLabelStyle, fontWeight: '500', background: highlight || '#f0fdf4', borderTop: `1px solid ${border}` }}>{label}</td>
        {totals.map((v, i) => <td key={i} style={{ ...tdStyle, fontWeight: '500', background: highlight || '#f0fdf4', borderTop: `1px solid ${border}` }}>{formatTotal(v)}</td>)}
        <td style={{ ...tdStyle, fontWeight: '500', background: highlight || '#f0fdf4', borderTop: `1px solid ${border}` }}>{formatTotal(grandTotal, true)}</td>
      </tr>
    )
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: muted, fontFamily: sans }}>Loading...</div>

  const currency = user.currency === 'AUD' ? 'A$' : '€'

  return (
    <div style={{ fontFamily: sans }}>
      {showAddModal && <AddLineModal onClose={() => setShowAddModal(false)} onSave={fetchData} userId={user.id} type={addType} />}
      {editCell && <EditValueModal line={editCell.line} month={editCell.month} year={editCell.year} currentValue={editCell.value} onClose={() => setEditCell(null)} onSave={fetchData} userId={user.id} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: '500' }}>Budget {year} · {currency}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setStartMonth(m => m - 1)}
            style={{ width: '26px', height: '26px', border: `0.5px solid ${border}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: muted }}>‹</button>
          <span style={{ fontSize: '12px', color: muted, minWidth: '120px', textAlign: 'center' }}>
            {MONTHS[visibleMonths[0].month - 1]} → {MONTHS[visibleMonths[4].month - 1]} {visibleMonths[4].year}
          </span>
          <button onClick={() => setStartMonth(m => m + 1)}
            style={{ width: '26px', height: '26px', border: `0.5px solid ${border}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: muted }}>›</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `0.5px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '12px', width: '180px' }}>In {currency}</th>
              {visibleMonths.map(({ month, year }) => (
                <th key={`${month}-${year}`} style={thStyle}>{MONTHS[month - 1]}-{String(year).slice(2)}</th>
              ))}
              <th style={{ ...thStyle, background: '#e8f5ee', color: green }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="Income" type="income" />
            {incomeLines.map(line => (
              <tr key={line.id}>
                <td style={tdLabelStyle}>
                  <Badge category={line.category} />
                  {line.label}
                  <span onClick={() => deleteLine(line.id)} style={{ marginLeft: '8px', cursor: 'pointer', fontSize: '11px', color: red, opacity: 0.4 }}>✕</span>
                </td>
                {visibleMonths.map(({ month, year }) => {
                  const v = getValue(line.id, month, year)
                  return <td key={`${month}-${year}`} style={tdStyle} onClick={() => setEditCell({ line, month, year, value: v })}>{formatValue(v)}</td>
                })}
                <td style={{ ...tdStyle, background: '#f0fdf4' }}>{formatTotal(getRowTotal(line.id))}</td>
              </tr>
            ))}
            {incomeLines.length === 0 && <tr><td colSpan={visibleMonths.length + 2} style={{ ...tdLabelStyle, color: hint }}>No income lines — click "+ Add" above</td></tr>}
            <TotalRow label="Total income" type="income" />

            <SectionHeader label="Expenses" type="expense" />
            {expenseLines.map(line => (
              <tr key={line.id}>
                <td style={tdLabelStyle}>
                  <Badge category={line.category} />
                  {line.label}
                  <span onClick={() => deleteLine(line.id)} style={{ marginLeft: '8px', cursor: 'pointer', fontSize: '11px', color: red, opacity: 0.4 }}>✕</span>
                </td>
                {visibleMonths.map(({ month, year }) => {
                  const v = getValue(line.id, month, year)
                  return <td key={`${month}-${year}`} style={tdStyle} onClick={() => setEditCell({ line, month, year, value: v })}>{formatValue(-v)}</td>
                })}
                <td style={{ ...tdStyle, background: '#fdf0ee' }}>{formatTotal(-getRowTotal(line.id))}</td>
              </tr>
            ))}
            {expenseLines.length === 0 && <tr><td colSpan={visibleMonths.length + 2} style={{ ...tdLabelStyle, color: hint }}>No expense lines — click "+ Add" above</td></tr>}
            <TotalRow label="Total expenses" type="expense" highlight="#fdf0ee" />

            <tr style={{ background: bg2 }}>
              <td style={{ ...tdLabelStyle, fontWeight: '500', background: bg2 }}>Income after expenses</td>
              {visibleMonths.map(({ month, year }) => {
                const v = getSectionTotal('income', month, year) - getSectionTotal('expense', month, year)
                return <td key={`${month}-${year}`} style={{ ...tdStyle, background: bg2, fontWeight: '500' }}>{formatTotal(v)}</td>
              })}
              <td style={{ ...tdStyle, background: bg2, fontWeight: '500' }}>
                {formatTotal(visibleMonths.reduce((s, { month, year }) => s + getSectionTotal('income', month, year) - getSectionTotal('expense', month, year), 0), true)}
              </td>
            </tr>

            <SectionHeader label="Savings" type="savings" />
            {savingsLines.map(line => (
              <tr key={line.id}>
                <td style={tdLabelStyle}>
                  <Badge category={line.category} />
                  {line.label}
                  <span onClick={() => deleteLine(line.id)} style={{ marginLeft: '8px', cursor: 'pointer', fontSize: '11px', color: red, opacity: 0.4 }}>✕</span>
                </td>
                {visibleMonths.map(({ month, year }) => {
                  const v = getValue(line.id, month, year)
                  return <td key={`${month}-${year}`} style={tdStyle} onClick={() => setEditCell({ line, month, year, value: v })}>{formatValue(-v)}</td>
                })}
                <td style={{ ...tdStyle, background: '#eff6ff' }}>{formatTotal(-getRowTotal(line.id))}</td>
              </tr>
            ))}
            {savingsLines.length === 0 && <tr><td colSpan={visibleMonths.length + 2} style={{ ...tdLabelStyle, color: hint }}>No savings lines — click "+ Add" above</td></tr>}
            <TotalRow label="Total savings" type="savings" highlight="#eff6ff" />

            <tr style={{ background: green }}>
              <td style={{ ...tdLabelStyle, color: '#fff', fontWeight: '500', fontSize: '13px' }}>Free income</td>
              {visibleMonths.map(({ month, year }) => {
                const v = getSectionTotal('income', month, year) - getSectionTotal('expense', month, year) - getSectionTotal('savings', month, year)
                return <td key={`${month}-${year}`} style={{ ...tdStyle, color: '#fff', fontWeight: '500' }}>{Math.round(v).toLocaleString('en-AU')}</td>
              })}
              <td style={{ ...tdStyle, color: '#fff', fontWeight: '700' }}>
                {Math.round(visibleMonths.reduce((s, { month, year }) =>
                  s + getSectionTotal('income', month, year) - getSectionTotal('expense', month, year) - getSectionTotal('savings', month, year), 0
                )).toLocaleString('en-AU')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}