import { useState } from 'react'
import BudgetTable from './BudgetTable'

const mono = 'DM Mono, monospace'
const sans = 'DM Sans, sans-serif'
const green = '#1a7a4a'
const greenLight = '#e8f5ee'
const border = '#e4e2dc'
const bg = '#f7f6f3'
const muted = '#6b6860'
const hint = '#9e9b94'

function Metric({ label, value, color }) {
  return (
    <div style={{ background: '#f0efeb', borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '11px', color: hint, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '500', letterSpacing: '-0.03em', color, fontFamily: mono }}>{value}</div>
    </div>
  )
}

function NavItem({ id, label, activePage, setActivePage }) {
  const isActive = activePage === id
  return (
    <button onClick={() => setActivePage(id)}
      style={{
        display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px',
        cursor: 'pointer', fontSize: '13.5px', border: 'none',
        background: isActive ? greenLight : 'transparent',
        color: isActive ? green : muted,
        fontWeight: isActive ? '500' : '400',
        width: '100%', textAlign: 'left', fontFamily: sans
      }}>
      {label}
    </button>
  )
}

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')

  const babacarMetrics = [
    { label: 'Monthly income', value: '3,441 EUR', color: '#1a1917' },
    { label: 'Expenses', value: '-1,696 EUR', color: '#c0392b' },
    { label: 'Savings', value: '-340 EUR', color: green },
    { label: 'Free income', value: '1,405 EUR', color: green },
  ]

  const dorothyMetrics = [
    { label: 'Monthly income', value: 'AUD 6,250', color: '#1a1917' },
    { label: 'Expenses', value: '-AUD 2,100', color: '#c0392b' },
    { label: 'Savings', value: 'AUD 800', color: green },
    { label: 'Free income', value: 'AUD 3,350', color: green },
  ]

  const metrics = user.id === 'dorothy' ? dorothyMetrics : babacarMetrics

  const pageTitles = {
    dashboard: `Welcome, ${user.name}`,
    budget: 'Monthly Budget',
    savings: 'Savings & Goals',
    projections: 'Projections & Simulations',
    tax: 'Income Tax',
    super: 'Superannuation',
    salary: 'Salary Sacrifice',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: sans, background: bg }}>

      <aside style={{ width: '220px', background: '#fff', borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 20px 16px', borderBottom: `1px solid ${border}` }}>
          <div style={{ width: '26px', height: '26px', background: green, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 14h12L9 2z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 8v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '500' }}>Clearpath</span>
        </div>

        <div style={{ margin: '12px 12px 0', padding: '10px 12px', background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: user.initials === 'BA' ? '#dbeafe' : '#fce7f3', color: user.initials === 'BA' ? '#1e40af' : '#9d174d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500' }}>
            {user.initials}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '500', flex: 1 }}>{user.name}</span>
          <button onClick={onLogout} style={{ fontSize: '11px', color: green, fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>Switch</button>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '10px', fontWeight: '500', color: hint, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px 6px' }}>Overview</div>
          <NavItem id="dashboard" label="Dashboard" activePage={activePage} setActivePage={setActivePage} />
          <div style={{ fontSize: '10px', fontWeight: '500', color: hint, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 8px 6px' }}>Finances</div>
          <NavItem id="budget" label="Monthly Budget" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="savings" label="Savings & Goals" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="projections" label="Projections" activePage={activePage} setActivePage={setActivePage} />
          <div style={{ fontSize: '10px', fontWeight: '500', color: hint, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 8px 6px' }}>Australia (ATO)</div>
          <NavItem id="tax" label="Income Tax" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="super" label="Superannuation" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="salary" label="Salary Sacrifice" activePage={activePage} setActivePage={setActivePage} />
        </nav>

        <div style={{ padding: '12px', borderTop: `1px solid ${border}` }}>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', color: muted, fontSize: '13px', width: '100%', background: 'none', border: 'none', fontFamily: sans }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '-0.03em' }}>
            {pageTitles[activePage]}
          </h1>
          {activePage === 'dashboard' && (
            <p style={{ fontSize: '13px', color: muted, marginTop: '2px' }}>March 2026 · Your financial overview</p>
          )}
        </div>

        {activePage === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {metrics.map(m => <Metric key={m.label} {...m} />)}
          </div>
        )}

        {activePage === 'budget' && <BudgetTable user={user} />}

        {['savings', 'projections', 'tax', 'super', 'salary'].map(page => (
          activePage === page && (
            <div key={page} style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '16px', padding: '20px', color: muted }}>
              {pageTitles[page]} — coming soon
            </div>
          )
        ))}
      </main>
    </div>
  )
}

export default Dashboard