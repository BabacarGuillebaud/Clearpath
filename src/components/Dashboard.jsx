import { useState } from 'react'

const monoFont = 'DM Mono, monospace'
const sansFont = 'DM Sans, sans-serif'

const green = '#1a7a4a'
const greenLight = '#e8f5ee'
const border = '#e4e2dc'
const bg = '#f7f6f3'
const textMuted = '#6b6860'
const textHint = '#9e9b94'

function Metric({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '11px', color: textHint, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '500', letterSpacing: '-0.03em', color: color, fontFamily: monoFont }}>{value}</div>
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
        color: isActive ? green : textMuted,
        fontWeight: isActive ? '500' : '400',
        width: '100%', textAlign: 'left', fontFamily: sansFont
      }}>
      {label}
    </button>
  )
}

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const isAustralia = true

  const babacarMetrics = [
    { label: 'Revenu mensuel', value: '3 441 EUR', color: '#1a1917' },
    { label: 'Depenses', value: '-1 696 EUR', color: '#c0392b' },
    { label: 'Epargne', value: '-340 EUR', color: green },
    { label: 'Revenus libres', value: '1 405 EUR', color: green },
  ]

  const dorothyMetrics = [
    { label: 'Revenu mensuel', value: 'AUD 6 250', color: '#1a1917' },
    { label: 'Depenses', value: '-AUD 2 100', color: '#c0392b' },
    { label: 'Epargne', value: 'AUD 800', color: green },
    { label: 'Revenus libres', value: 'AUD 3 350', color: green },
  ]

  const metrics = isAustralia ? dorothyMetrics : babacarMetrics

  const pageTitle = {
    dashboard: `Bonjour, ${user.name}`,
    budget: 'Budget mensuel',
    savings: 'Epargne et Objectifs',
    projections: 'Projections et Simulations',
    tax: 'Impot sur le revenu',
    super: 'Superannuation',
    salary: 'Salary sacrifice',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: sansFont, background: bg }}>

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
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: user.id === 'babacar' ? '#dbeafe' : '#fce7f3',
            color: user.id === 'babacar' ? '#1e40af' : '#9d174d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '500'
          }}>
            {user.id === 'babacar' ? 'BA' : 'DO'}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '500', flex: 1 }}>{user.name}</span>
          <button onClick={onLogout} style={{ fontSize: '11px', color: green, fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>Changer</button>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <NavItem id="dashboard" label="Dashboard" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="budget" label="Budget mensuel" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="savings" label="Epargne" activePage={activePage} setActivePage={setActivePage} />
          <NavItem id="projections" label="Projections" activePage={activePage} setActivePage={setActivePage} />

          {isAustralia && (
            <>
              <div style={{ fontSize: '10px', fontWeight: '500', color: textHint, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 8px 4px', marginTop: '8px' }}>
                Australie (ATO)
              </div>
              <NavItem id="tax" label="Impot sur le revenu" activePage={activePage} setActivePage={setActivePage} />
              <NavItem id="super" label="Superannuation" activePage={activePage} setActivePage={setActivePage} />
              <NavItem id="salary" label="Salary sacrifice" activePage={activePage} setActivePage={setActivePage} />
            </>
          )}
        </nav>

        <div style={{ padding: '12px', borderTop: `1px solid ${border}` }}>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', color: textMuted, fontSize: '13px', width: '100%', background: 'none', border: 'none', fontFamily: sansFont }}>
            Se deconnecter
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '-0.03em' }}>
            {pageTitle[activePage]}
          </h1>
          {activePage === 'dashboard' && (
            <p style={{ fontSize: '13px', color: textMuted, marginTop: '2px' }}>Mars 2026 · Votre situation financiere</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {metrics.map(m => <Metric key={m.label} {...m} />)}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            {pageTitle[activePage]}
          </div>
          <p style={{ fontSize: '14px', color: textMuted, lineHeight: '1.6' }}>
            Ce module sera connecte a Supabase dans les prochaines etapes.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard