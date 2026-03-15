import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const G = '#1a7a4a', R = '#c0392b', BDR = '#e4e2dc'
const BG2 = '#f7f6f3', MUTED = '#6b6860', HINT = '#9e9b94'
const SANS = 'DM Sans, sans-serif', MONO = 'DM Mono, monospace'

const ATO_CATEGORIES = [
  { value: 'wfh', label: 'Work from home', bg: '#e8f5ee', color: '#1a7a4a' },
  { value: 'tools', label: 'Tools & equipment', bg: '#eff6ff', color: '#1d4ed8' },
  { value: 'education', label: 'Education', bg: '#fef3c7', color: '#92400e' },
  { value: 'transport', label: 'Transport', bg: '#fdf4ff', color: '#7e22ce' },
  { value: 'phone', label: 'Phone & internet', bg: '#fff7ed', color: '#c2410c' },
  { value: 'clothing', label: 'Clothing & uniform', bg: '#fdf0ee', color: '#c0392b' },
  { value: 'other', label: 'Other', bg: BG2, color: MUTED },
]

const fmt = (v) => `A$${Math.round(Math.abs(v)).toLocaleString('en-AU')}`

function AddDeductionModal({ onClose, onSave, userId }) {
  const [form, setForm] = useState({ label: '', amount: '', category: 'wfh', date: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.label || !form.amount) return
    setSaving(true)
    await supabase.from('tax_deductions').insert({
      user_id: userId,
      financial_year: 'FY2025-26',
      label: form.label,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date || null,
      notes: form.notes || null,
    })
    onSave()
    onClose()
    setSaving(false)
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${BDR}`, borderRadius: '7px', fontSize: '13px', fontFamily: SANS, outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: SANS }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '18px' }}>Add tax deduction</h2>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Description</label>
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. Home office expenses, MacBook Pro..." autoFocus style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Amount (AUD)</label>
            <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              type="number" placeholder="0" style={{ ...inputStyle, fontFamily: MONO }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Date</label>
            <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              type="date" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>ATO Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ ...inputStyle, background: '#fff' }}>
            {ATO_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', color: MUTED, display: 'block', marginBottom: '5px' }}>Notes (optional)</label>
          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. 80% work use, purchased for project X..." style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${BDR}`, borderRadius: '7px', background: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', color: MUTED }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: G, color: '#fff', fontFamily: SANS, cursor: 'pointer', fontSize: '13px', fontWeight: '500', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Add deduction'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeductionRow({ item, onDelete, onReceiptUpload }) {
  const cat = ATO_CATEGORIES.find(c => c.value === item.category) || ATO_CATEGORIES[6]
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `${item.user_id}/${item.id}/${file.name}`
    const { error } = await supabase.storage.from('receipts').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path)
      await supabase.from('tax_deductions').update({ receipt_url: path }).eq('id', item.id)
      onReceiptUpload()
    }
    setUploading(false)
  }

  const viewReceipt = async () => {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(item.receipt_url, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `0.5px solid ${BDR}`, flexWrap: 'wrap' }}>
      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: '500', background: cat.bg, color: cat.color, whiteSpace: 'nowrap' }}>{cat.label}</span>
      <div style={{ flex: 1, minWidth: '120px' }}>
        <div style={{ fontSize: '13px', color: '#1a1917' }}>{item.label}</div>
        {item.notes && <div style={{ fontSize: '11px', color: HINT, marginTop: '2px' }}>{item.notes}</div>}
      </div>
      {item.date && <span style={{ fontSize: '11px', color: HINT, whiteSpace: 'nowrap' }}>{new Date(item.date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>}
      <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: '500', color: G, minWidth: '80px', textAlign: 'right' }}>{fmt(item.amount)}</span>

      <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*,.pdf" style={{ display: 'none' }} />
      {item.receipt_url ? (
        <button onClick={viewReceipt}
          style={{ fontSize: '11px', padding: '4px 10px', border: '0.5px solid #a7f3d0', borderRadius: '6px', background: '#e8f5ee', color: G, cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}>
          Receipt ✓
        </button>
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ fontSize: '11px', padding: '4px 10px', border: `0.5px solid ${BDR}`, borderRadius: '6px', background: 'transparent', color: MUTED, cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}>
          {uploading ? 'Uploading...' : 'Upload receipt'}
        </button>
      )}
      <button onClick={() => onDelete(item.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: HINT, opacity: 0.5, padding: '2px 4px' }}>✕</button>
    </div>
  )
}

export default function TaxDeductions({ user }) {
  const [deductions, setDeductions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchDeductions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id)
      .eq('financial_year', 'FY2025-26')
      .order('created_at', { ascending: false })
    setDeductions(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDeductions() }, [])

  const deleteDeduction = async (id) => {
    await supabase.from('tax_deductions').delete().eq('id', id)
    fetchDeductions()
  }

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0)
  const taxSaved = totalDeductions * 0.325
  const withReceipts = deductions.filter(d => d.receipt_url).length
  const missingReceipts = deductions.filter(d => !d.receipt_url && d.amount >= 300).length

  const metricStyle = { background: '#f0efeb', borderRadius: '8px', padding: '12px 14px' }
  const labelStyle = { fontSize: '10px', color: HINT, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }

  return (
    <div style={{ fontFamily: SANS, marginTop: '24px', borderTop: `1px solid ${BDR}`, paddingTop: '24px' }}>
      {showModal && <AddDeductionModal onClose={() => setShowModal(false)} onSave={fetchDeductions} userId={user.id} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '500' }}>Tax Deductions</div>
          <div style={{ fontSize: '12px', color: MUTED, marginTop: '2px' }}>FY 2025–26 · ATO deductible expenses</div>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '8px 16px', background: G, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: SANS, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          + Add deduction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={metricStyle}><div style={labelStyle}>Total deductions</div><div style={{ fontSize: '18px', fontWeight: '500', fontFamily: MONO, color: G }}>{fmt(totalDeductions)}</div></div>
        <div style={metricStyle}><div style={labelStyle}>Est. tax saved</div><div style={{ fontSize: '18px', fontWeight: '500', fontFamily: MONO, color: G }}>{fmt(taxSaved)}</div></div>
        <div style={metricStyle}><div style={labelStyle}>Receipts uploaded</div><div style={{ fontSize: '18px', fontWeight: '500', fontFamily: MONO, color: '#1a1917' }}>{withReceipts} / {deductions.length}</div></div>
      </div>

      {missingReceipts > 0 && (
        <div style={{ padding: '10px 14px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e', border: '0.5px solid #fde68a', marginBottom: '14px' }}>
          {missingReceipts} receipt{missingReceipts > 1 ? 's' : ''} missing — ATO requires proof for all deductions over A$300
        </div>
      )}

      <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: MUTED }}>Loading...</div>
        ) : deductions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: MUTED }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>No deductions yet</div>
            <div style={{ fontSize: '12px' }}>Add your work-related expenses to maximise your tax return</div>
          </div>
        ) : (
          deductions.map(d => (
            <DeductionRow key={d.id} item={d} onDelete={deleteDeduction} onReceiptUpload={fetchDeductions} />
          ))
        )}
      </div>
    </div>
  )
}