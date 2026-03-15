import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CATEGORIES = [
  { value: 'logement', label: 'Logement', color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'alimentation', label: 'Alim.', color: '#15803d', bg: '#f0fdf4' },
  { value: 'abonnements', label: 'Abo.', color: '#92400e', bg: '#fef3c7' },
  { value: 'sante', label: 'Santé', color: '#7e22ce', bg: '#fdf4ff' },
  { value: 'transport', label: 'Transport', color: '#0e7490', bg: '#ecfeff' },
  { value: 'voyage', label: 'Voyage', color: '#c2410c', bg: '#fff7ed' },
  { value: 'credit', label: 'Crédit', color: '#9333ea', bg: '#faf5ff' },
  { value: 'epargne', label: 'Épargne', color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'salaire', label: 'Salaire', color: '#15803d', bg: '#f0fdf4' },
  { value: 'autre', label: 'Autre', color: '#6b6860', bg: '#f7f6f3' },
]

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const green = '#1a7a4a'
const border = '#e4e2dc'
const bg = '#f7f6f3'
const textMuted = '#6b6860'
const textHint = '#9e9b94'
const red = '#c0392b'
const sans = 'DM Sans, system-ui, sans-serif'
const mono = 'DM Mono, monospace'

function Badge({ category }) {
  const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1]
  return <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '500', background: cat.bg, color: cat.color, marginRight: '6px', whiteSpace: 'nowrap' }}>{cat.label}</span>
}

function Modal({ onClose, onSave, line, userId }) {
  const [form, setForm] = useState(line || { label: '', category: 'autre', type: 'expense', is_recurring: true })

  const handleSave = async () => {
    if (!form.label) return
    if (line?.id) {
      await supabase.from('budget_lines').update({ label: form.label, category: form.category, type: form.type, is_recurring: form.is_recurring }).eq('id', line.id)
    } else {
      await supabase.from('budget_lines').insert({ ...form, user_id: userId })
    }
    onSave()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontFamily: sans }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '20px' }}>{line?.id ? 'Modifier la ligne' : 'Ajouter une ligne'}</h2>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '6px' }}>Type</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ v: 'income', l: 'Revenu' }, { v: 'expense', l: 'Dépense' }, { v: 'savings', l: 'Épargne' }].map(t => (
              <button key={t.v} onClick={() => setForm({ ...form, type: t.v })}
                style={{ flex: 1, padding: '7px', borderRadius: '8px', border: `1px solid ${form.type === t.v ? green : border}`, background: form.type === t.v ? '#e8f5ee' : '#fff', color: form.type === t.v ? green : textMuted, fontFamily: sans, cursor: 'pointer', fontSize: '13px', fontWeight: form.type === t.v ? '500' : '400' }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '6px' }}>Libellé</label>
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
            placeholder="ex: Loyer, Salaire..."
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: sans, outline: 'none' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: textMuted, display: 'block', marginBottom: '6px' }}>Catégorie</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: sans, outline: 'none', background: '#fff' }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', border: `1px solid ${border}`, borderRadius: '8px', background: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '14px', color: textMuted }}>Annuler</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: green, color: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Sauvegarder</button>
        </div>
      </div>
    </div>
  )
}

function BudgetTable({ user }) {
  const now = new Date()
  const [startMonth, setStartMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [lines, setLines] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editLine, setEditLine] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [cellInput, setCellInput] = useState('')

  const visibleMonths = [0, 1, 2, 3, 4].map(i => {
    let m = startMonth + i
    let y = year
    if (m > 11) { m -= 12; y++ }
    return { month: m + 1, year: y, label: `${MONTHS[m]}-${String(y).slice(2)}` }
  })

  const fetchData = async () => {
    setLoading(true)
    const { data: linesData } = await supabase.from('budget_lines').select('*').eq('user_id', user.id).order('created_at')
    const { data: valuesData } = await supabase.from('budget_values').select('*').eq('user_id', user.id)
    setLines(linesData || [])
    const vMap = {}
    ;(valuesData || []).forEach(v => { vMap[`${v.line_id}-${v.month}-${v.year}`] = v.amount })
    setValues(vMap)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getValue = (lineId, month, year) => values[`${lineId}-${month}-${year}`] ?? 0

  const saveCell = async (lineId, month, year, amount) => {
    const key = `${lineId}-${month}-${year}`
    const parsed = parseFloat(amount) || 0
    setValues(prev => ({ ...prev, [key]: parsed }))
    await supabase.from('budget_values').upsert({ line_id: lineId, user_id: user.id, month, year, amount: parsed }, { onConflict: 'line_id,month,year' })
  }

  const deleteLine = async (id) => {
    await supabase.from('budget_lines').delete().eq('id', id)
    fetchData()
  }

  const getTotal = (lineId) => visibleMonths.reduce((s, m) => s + getValue(lineId, m.month, m.year), 0)
  const getSectionTotal = (type, monthObj) => lines.filter(l => l.type === type).reduce((s, l) => s + getValue(l.id, monthObj.month, monthObj.year), 0)
  const getSectionTotalAll = (type) => visibleMonths.reduce((s, m) => s + getSectionTotal(type, m), 0)
  const getFree = (monthObj) => getSectionTotal('income', monthObj) - getSectionTotal('expense', monthObj) - getSectionTotal('savings', monthObj)
  const getFreeTotal = () => visibleMonths.reduce((s, m) => s + getFree(m), 0)

  const currency = user.currency === 'AUD' ? 'A$' : '€'
  const fmt = (v) => v === 0 ? '0' : `${v < 0 ? '-' : ''}${Math.abs(Math.round(v)).toLocaleString('fr-FR')}`

  const cellKey = (lineId, month, year) => `${lineId}-${month}-${year}`

  const CellInput = ({ lineId, month, year }) => {
    const key = cellKey(lineId, month, year)
    const isEditing = editingCell === key
    const val = getValue(lineId, month, year)
    if (isEditing) {
      return (
        <input autoFocus value={cellInput}
          onChange={e => setCellInput(e.target.value)}
          onBlur={() => { saveCell(lineId, month, year, cellInput); setEditingCell(null) }}
          onKeyDown={e => { if (e.key === 'Enter') { saveCell(lineId, month, year, cellInput); setEditingCell(null) } if (e.key === 'Escape') setEditingCell(null) }}
          style={{ width: '70px', textAlign: 'right', fontFamily: mono, fontSize: '12px', border: `1px solid ${green}`, borderRadius: '4px', padding: '2px 4px', outline: 'none', background: '#f0fdf9' }} />
      )
    }
    return (
      <span onClick={() => { setEditingCell(key); setCellInput(String(val)) }}
        style={{ cursor: 'pointer', fontFamily: mono, fontSize: '12px', color: val < 0 ? red : val > 0 ? green : textHint, display: 'block', textAlign: 'right', minWidth: '60px' }}>
        {fmt(val)}
      </span>
    )
  }

  const thStyle = { fontSize: '11px', fontWeight: '500', color: textMuted, padding: '8px 10px', textAlign: 'right', borderBottom: `1px solid ${border}`, background: bg, whiteSpace: 'nowrap' }
  const tdStyle = { padding: '7px 10px', textAlign: 'right', borderBottom: `0.5px solid ${border}` }
  const totalRowStyle = { background: '#f0fdf4' }

  const SectionRows = ({ type }) => {
    const filtered = lines.filter(l => l.type === type)
    return (
      <>
        <tr style={{ background: bg }}>
          <td colSpan={7} style={{ padding: '8px 12px 4px', fontSize: '10px', fontWeight: '500', color: textHint, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `0.5px solid ${border}` }}>
            {type === 'income' ? 'Revenus' : type === 'expense' ? 'Dépenses' : 'Épargne'}
          </td>
        </tr>
        {filtered.map(line => (
          <tr key={line.id} style={{ transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = bg}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            <td style={{ ...tdStyle, textAlign: 'left', fontFamily: sans, fontSize: '12px', paddingLeft: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Badge category={line.category} />
                <span style={{ color: 'var(--color-text-primary)' }}>{line.label}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                  <button onClick={() => { setEditLine(line); setShowModal(true) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: textHint, fontSize: '11px', opacity: 0.5, padding: '0 2px' }}>✏️</button>
                  <button onClick={() => deleteLine(line.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: textHint, fontSize: '11px', opacity: 0.5, padding: '0 2px' }}>🗑️</button>
                </span>
              </div>
            </td>
            {visibleMonths.map(m => (
              <td key={m.label} style={tdStyle}>
                <CellInput lineId={line.id} month={m.month} year={m.year} />
              </td>
            ))}
            <td style={{ ...tdStyle, fontFamily: mono, fontSize: '12px', color: getTotal(line.id) < 0 ? red : getTotal(line.id) > 0 ? green : textHint, fontWeight: '500', background: '#f9f8f5' }}>
              {fmt(getTotal(line.id))}
            </td>
          </tr>
        ))}
        <tr style={totalRowStyle}>
          <td style={{ ...tdStyle, fontFamily: sans, fontWeight: '500', fontSize: '12px', paddingLeft: '12px', color: green }}>
            Total {type === 'income' ? 'revenus' : type === 'expense' ? 'dépenses' : 'épargne'}
          </td>
          {visibleMonths.map(m => (
            <td key={m.label} style={{ ...tdStyle, fontFamily: mono, fontWeight: '500', color: type === 'income' ? green : red }}>
              {fmt(getSectionTotal(type, m))}
            </td>
          ))}
          <td style={{ ...tdStyle, fontFamily: mono, fontWeight: '500', color: type === 'income' ? green : red, background: '#f0fdf4' }}>
            {fmt(getSectionTotalAll(type))}
          </td>
        </tr>
      </>
    )
  }

  return (
    <div style={{ fontFamily: sans }}>
      {showModal && <Modal onClose={() => { setShowModal(false); setEditLine(null) }} onSave={fetchData} line={editLine} userId={user.id} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setStartMonth(s => s - 1)} style={{ width: '28px', height: '28px', border: `1px solid ${border}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
          <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '120px', textAlign: 'center' }}>
            {visibleMonths[0].label} → {visibleMonths[4].label}
          </span>
          <button onClick={() => setStartMonth(s => s + 1)} style={{ width: '28px', height: '28px', border: `1px solid ${border}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>›</button>
        </div>
        <button onClick={() => { setEditLine(null); setShowModal(true) }}
          style={{ padding: '8px 16px', background: green, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: sans, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          + Ajouter une ligne
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: textMuted }}>Chargement...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '12px', width: '200px' }}>En {currency}</th>
                {visibleMonths.map(m => <th key={m.label} style={thStyle}>{m.label}</th>)}
                <th style={{ ...thStyle, background: '#e8f5ee', color: green }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <SectionRows type="income" />
              <SectionRows type="expense" />
              <tr style={{ background: '#f0fdf9' }}>
                <td style={{ ...tdStyle, fontFamily: sans, fontWeight: '500', fontSize: '12px', paddingLeft: '12px', color: green }}>Revenus après dépenses</td>
                {visibleMonths.map(m => (
                  <td key={m.label} style={{ ...tdStyle, fontFamily: mono, fontWeight: '500', color: green }}>{fmt(getSectionTotal('income', m) - getSectionTotal('expense', m))}</td>
                ))}
                <td style={{ ...tdStyle, fontFamily: mono, fontWeight: '500', color: green, background: '#e8f5ee' }}>{fmt(getSectionTotalAll('income') - getSectionTotalAll('expense'))}</td>
              </tr>
              <SectionRows type="savings" />
              <tr style={{ background: green }}>
                <td style={{ ...tdStyle, fontFamily: sans, fontWeight: '500', fontSize: '13px', paddingLeft: '12px', color: '#fff', borderBottom: 'none' }}>Revenus libres</td>
                {visibleMonths.map(m => (
                  <td key={m.label} style={{ ...tdStyle, fontFamily: mono, fontWeight: '500', color: '#fff', borderBottom: 'none' }}>{fmt(getFree(m))}</td>
                ))}
                <td style={{ ...tdStyle, fontFamily: mono, fontWeight: '700', color: '#fff', borderBottom: 'none' }}>{fmt(getFreeTotal())}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BudgetTable