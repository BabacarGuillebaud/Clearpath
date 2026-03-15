import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const green = '#1a7a4a'
const greenLight = '#e8f5ee'
const border = '#e4e2dc'
const bg = '#f7f6f3'
const muted = '#6b6860'
const hint = '#9e9b94'
const sans = 'DM Sans, sans-serif'
const mono = 'DM Mono, monospace'

function AddGoalModal({ onClose, onSave, userId, currency }) {
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '' })

  const save = async () => {
    if (!form.name || !form.target_amount) return
    await supabase.from('savings_goals').insert({
      user_id: userId,
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      currency,
      deadline: form.deadline || null,
    })
    onSave()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: sans }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '18px' }}>New savings goal</h2>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Goal name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Emergency fund, Trip to Bali..."
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '13px', fontFamily: sans, outline: 'none' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Target amount</label>
            <input value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })}
              type="number" placeholder="10,000"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '13px', fontFamily: mono, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Current amount</label>
            <input value={form.current_amount} onChange={e => setForm({ ...form, current_amount: e.target.value })}
              type="number" placeholder="0"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '13px', fontFamily: mono, outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', color: muted, display: 'block', marginBottom: '5px' }}>Target date (optional)</label>
          <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
            type="date"
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${border}`, borderRadius: '7px', fontSize: '13px', fontFamily: sans, outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: `1px solid ${border}`, borderRadius: '7px', background: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '13px', color: muted }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '7px', background: green, color: '#fff', fontFamily: sans, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Save goal</button>
        </div>
      </div>
    </div>
  )
}

function GoalCard({ goal, currency, onDelete, onUpdate }) {
  const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
  const remaining = goal.target_amount - goal.current_amount
  const barColor = pct >= 75 ? green : pct >= 40 ? '#f59e0b' : '#1d4ed8'

  const [editing, setEditing] = useState(false)
  const [newAmount, setNewAmount] = useState(goal.current_amount)

  const saveAmount = async () => {
    await supabase.from('savings_goals').update({ current_amount: parseFloat(newAmount) }).eq('id', goal.id)
    onUpdate()
    setEditing(false)
  }

  return (
    <div style={{ background: '#fff', border: `0.5px solid ${border}`, borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1917' }}>{goal.name}</div>
          {goal.deadline && <div style={{ fontSize: '11px', color: hint, marginTop: '2px' }}>Target: {new Date(goal.deadline).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontFamily: mono, color: muted }}>{currency}{Math.round(goal.current_amount).toLocaleString('en-AU')} / {currency}{Math.round(goal.target_amount).toLocaleString('en-AU')}</span>
          <button onClick={() => onDelete(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: hint, opacity: 0.6 }}>✕</button>
        </div>
      </div>

      <div style={{ height: '6px', background: bg, borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: hint }}>{pct}% reached · {currency}{Math.round(remaining).toLocaleString('en-AU')} remaining</span>
        {editing ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input value={newAmount} onChange={e => setNewAmount(e.target.value)} type="number"
              style={{ width: '90px', padding: '4px 8px', border: `1px solid ${border}`, borderRadius: '6px', fontSize: '12px', fontFamily: mono, outline: 'none' }} />
            <button onClick={saveAmount} style={{ padding: '4px 10px', background: green, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: sans }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ padding: '4px 8px', background: 'none', border: `1px solid ${border}`, borderRadius: '6px', fontSize: '11px', cursor: 'pointer', color: muted, fontFamily: sans }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{ fontSize: '11px', padding: '3px 10px', border: `0.5px solid ${border}`, borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: muted, fontFamily: sans }}>Update amount</button>
        )}
      </div>
    </div>
  )
}

export default function Savings({ user }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const currency = user.currency === 'AUD' ? 'A$' : '€'

  const fetchGoals = async () => {
    setLoading(true)
    const { data } = await supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at')
    setGoals(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchGoals() }, [])

  const deleteGoal = async (id) => {
    await supabase.from('savings_goals').delete().eq('id', id)
    fetchGoals()
  }

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  return (
    <div style={{ fontFamily: sans }}>
      {showModal && <AddGoalModal onClose={() => setShowModal(false)} onSave={fetchGoals} userId={user.id} currency={user.currency} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total saved', value: `${currency}${Math.round(totalSaved).toLocaleString('en-AU')}`, color: green },
          { label: 'Total target', value: `${currency}${Math.round(totalTarget).toLocaleString('en-AU')}`, color: '#1a1917' },
          { label: 'Overall progress', value: `${overallPct}%`, color: overallPct >= 50 ? green : '#f59e0b' },
          { label: 'Goals', value: goals.length, color: '#1d4ed8' },
        ].map(m => (
          <div key={m.label} style={{ background: '#f0efeb', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: hint, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: m.color, fontFamily: mono }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500' }}>Savings goals</h2>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '8px 16px', background: green, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: sans, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          + New goal
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: muted }}>Loading...</div>
      ) : goals.length === 0 ? (
        <div style={{ background: '#fff', border: `0.5px solid ${border}`, borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: muted, marginBottom: '12px' }}>No savings goals yet</div>
          <button onClick={() => setShowModal(true)}
            style={{ padding: '8px 16px', background: green, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: sans, fontSize: '13px', cursor: 'pointer' }}>
            Create your first goal
          </button>
        </div>
      ) : (
        goals.map(goal => <GoalCard key={goal.id} goal={goal} currency={currency} onDelete={deleteGoal} onUpdate={fetchGoals} />)
      )}
    </div>
  )
}