import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const G = '#1a7a4a', R = '#c0392b', BDR = '#e4e2dc'
const BG2 = '#f7f6f3', MUTED = '#6b6860', HINT = '#9e9b94'
const SANS = 'DM Sans, sans-serif', MONO = 'DM Mono, monospace'

const BRACKETS = [
  { min: 0, max: 18200, rate: 0, label: '$0 – $18,200' },
  { min: 18201, max: 45000, rate: 0.19, label: '$18,201 – $45,000' },
  { min: 45001, max: 135000, rate: 0.325, label: '$45,001 – $135,000' },
  { min: 135001, max: 190000, rate: 0.37, label: '$135,001 – $190,000' },
  { min: 190001, max: Infinity, rate: 0.45, label: '$190,001+' },
]

function calcTax(income) {
  if (income <= 18200) return 0
  if (income <= 45000) return (income - 18200) * 0.19
  if (income <= 135000) return 5092 + (income - 45000) * 0.325
  if (income <= 190000) return 31092 + (income - 135000) * 0.37
  return 51442 + (income - 190000) * 0.45
}

function calcLITO(income) {
  if (income <= 37500) return 700
  if (income <= 45000) return 700 - (income - 37500) * 0.05
  if (income <= 66667) return 325 - (income - 45000) * 0.015
  return 0
}

function getActiveBracket(income) {
  return BRACKETS.findIndex(b => income >= b.min && income <= b.max)
}

const fmt = (v) => `A$${Math.round(Math.abs(v)).toLocaleString('en-AU')}`

function TaxPanel({ gross, deductions, source }) {
  const taxable = Math.max(0, gross - deductions)
  const baseTax = calcTax(taxable)
  const lito = calcLITO(taxable)
  const medicare = taxable * 0.02
  const totalTax = Math.max(0, baseTax - lito + medicare)
  const netIncome = gross - totalTax
  const effectiveRate = gross > 0 ? ((totalTax / gross) * 100).toFixed(1) : '0.0'
  const activeBracket = getActiveBracket(taxable)

  const metricStyle = { background: '#f0efeb', borderRadius: '10px', padding: '14px 16px' }
  const labelStyle = { fontSize: '10px', color: HINT, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }
  const cardStyle = { background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px' }
  const cardTitle = { fontSize: '10px', fontWeight: '500', color: HINT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }
  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '13px', borderBottom: `0.5px solid #a7f3d0` }

  return (
    <div>
      {source && (
        <div style={{ fontSize: '12px', color: MUTED, background: BG2, padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: G, display: 'inline-block' }}></span>
          {source}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '10px', marginBottom: '18px' }}>
        {[
          { label: 'Gross income', value: fmt(gross), color: '#1a1917' },
          { label: 'Total tax', value: fmt(totalTax), color: R },
          { label: 'Effective rate', value: `${effectiveRate}%`, color: '#1a1917' },
          { label: 'Net income', value: fmt(netIncome), color: G },
        ].map(m => (
          <div key={m.label} style={metricStyle}>
            <div style={labelStyle}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '500', fontFamily: MONO, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '14px' }}>
        <div style={cardStyle}>
          <div style={cardTitle}>Tax breakdown</div>
          <div style={{ background: '#e8f5ee', border: '0.5px solid #a7f3d0', borderRadius: '10px', padding: '14px' }}>
            {[
              { label: 'Taxable income', value: fmt(taxable), color: '#1a1917' },
              { label: 'Income tax', value: `−${fmt(baseTax)}`, color: R },
              { label: 'Low income offset', value: lito > 0 ? `+${fmt(lito)}` : '—', color: G },
              { label: 'Medicare levy (2%)', value: `−${fmt(medicare)}`, color: R },
            ].map(r => (
              <div key={r.label} style={rowStyle}>
                <span>{r.label}</span>
                <span style={{ fontFamily: MONO, fontWeight: '500', color: r.color }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', fontSize: '14px', fontWeight: '500' }}>
              <span>Net income</span>
              <span style={{ fontFamily: MONO, color: G }}>{fmt(netIncome)}</span>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={cardTitle}>Deductions</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '13px', borderBottom: `0.5px solid ${BDR}` }}>
              <span>Total deductions</span>
              <span style={{ fontFamily: MONO, color: G }}>+{fmt(deductions)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '13px', borderBottom: `0.5px solid ${BDR}` }}>
              <span>Tax saving</span>
              <span style={{ fontFamily: MONO, color: G }}>+{fmt(deductions * (BRACKETS[activeBracket]?.rate || 0))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '13px' }}>
              <span>Marginal rate</span>
              <span style={{ fontFamily: MONO, fontWeight: '500' }}>{((BRACKETS[activeBracket]?.rate || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Tax brackets FY 2025–26</div>
          {BRACKETS.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
              borderRadius: '6px', marginBottom: '4px',
              background: i === activeBracket ? '#e8f5ee' : 'transparent',
              border: i === activeBracket ? `0.5px solid #a7f3d0` : '0.5px solid transparent'
            }}>
              <span style={{ fontFamily: MONO, fontSize: '11px', color: i === activeBracket ? G : MUTED, minWidth: '155px' }}>{b.label}</span>
              <span style={{ fontSize: '12px', fontWeight: '500', minWidth: '38px', color: i === activeBracket ? G : '#1a1917' }}>{(b.rate * 100).toFixed(0)}%</span>
              <div style={{ flex: 1, height: '4px', background: BG2, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.rate * 100}%`, background: i === activeBracket ? G : '#d0cec6', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function IncomeTax({ user }) {
  const [tab, setTab] = useState('simulation')
  const [simGross, setSimGross] = useState(75000)
  const [simDeductions, setSimDeductions] = useState(3000)
  const [forecastGross, setForecastGross] = useState(0)
  const [forecastDeductions, setForecastDeductions] = useState(0)
  const [forecastSource, setForecastSource] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true)
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const { data: lines } = await supabase
        .from('budget_lines')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')

      if (!lines || lines.length === 0) { setLoading(false); return }

      const lineIds = lines.map(l => l.id)
      let totalAnnual = 0
      let closedMonths = 0
      let forecastMonths = 0

      for (let m = 1; m <= 12; m++) {
        const isPast = m < currentMonth
        const table = isPast ? 'actual' : 'forecast'
        const isForecast = !isPast

        const { data: vals } = await supabase
          .from('budget_values')
          .select('*')
          .in('line_id', lineIds)
          .eq('month', m)
          .eq('year', currentYear)
          .eq('is_forecast', isForecast)

        const monthTotal = vals?.reduce((s, v) => s + v.amount, 0) || 0
        totalAnnual += monthTotal

        if (isPast) closedMonths++
        else forecastMonths++
      }

      const { data: atoData } = await supabase
        .from('ato_data')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setForecastGross(totalAnnual)
      setForecastDeductions(atoData?.deductions || 0)
      setForecastSource(
        `${closedMonths} month${closedMonths !== 1 ? 's' : ''} closed (actual) · ${forecastMonths} month${forecastMonths !== 1 ? 's' : ''} forecasted · auto-updates on 1st of each month`
      )
      setLoading(false)
    }

    loadForecast()
  }, [user.id])

  const saveSimulation = async () => {
    const existing = await supabase.from('ato_data').select('id').eq('user_id', user.id).single()
    const payload = { user_id: user.id, financial_year: 'FY2025-26', gross_income: simGross, deductions: simDeductions }
    if (existing.data) {
      await supabase.from('ato_data').update(payload).eq('id', existing.data.id)
    } else {
      await supabase.from('ato_data').insert(payload)
    }
    alert('Simulation saved!')
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
      style={{
        padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontFamily: SANS, fontSize: '13px', fontWeight: tab === id ? '500' : '400',
        background: tab === id ? G : 'transparent',
        color: tab === id ? '#fff' : MUTED,
        transition: 'all 0.15s'
      }}>
      {label}
    </button>
  )

  return (
    <div style={{ fontFamily: SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: BG2, borderRadius: '10px', padding: '4px', gap: '2px' }}>
          {tabBtn('simulation', 'Simulation')}
          {tabBtn('forecast', 'Tax Forecast')}
        </div>
        <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: '#eff6ff', color: '#1d4ed8', fontWeight: '500' }}>FY 2025–26</span>
        {tab === 'simulation' && (
          <button onClick={saveSimulation}
            style={{ marginLeft: 'auto', padding: '7px 16px', background: G, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: SANS, fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            Save
          </button>
        )}
      </div>

      {tab === 'simulation' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '14px', marginBottom: '18px' }}>
            <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px' }}>
              <div style={{ fontSize: '10px', fontWeight: '500', color: HINT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Adjust parameters</div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: MUTED, marginBottom: '5px' }}>
                  <span>Gross income</span>
                  <span style={{ fontFamily: MONO, fontWeight: '500', color: '#1a1917' }}>{fmt(simGross)}</span>
                </div>
                <input type="range" min="0" max="250000" value={simGross} step="1000"
                  onChange={e => setSimGross(Number(e.target.value))}
                  style={{ width: '100%', accentColor: G }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: MUTED, marginBottom: '5px' }}>
                  <span>Deductions</span>
                  <span style={{ fontFamily: MONO, fontWeight: '500', color: '#1a1917' }}>{fmt(simDeductions)}</span>
                </div>
                <input type="range" min="0" max="50000" value={simDeductions} step="500"
                  onChange={e => setSimDeductions(Number(e.target.value))}
                  style={{ width: '100%', accentColor: G }} />
              </div>
            </div>
            <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px' }}>
              <div style={{ fontSize: '10px', fontWeight: '500', color: HINT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>What if scenarios</div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: '1.6' }}>
                Use the sliders to simulate different income and deduction scenarios. Click Save to store your figures for the Tax Forecast tab.
              </div>
              <div style={{ marginTop: '12px', padding: '10px', background: BG2, borderRadius: '8px', fontSize: '12px', color: MUTED }}>
                Tip: increase deductions to see how much tax you can save at your marginal rate.
              </div>
            </div>
          </div>
          <TaxPanel gross={simGross} deductions={simDeductions} />
        </div>
      )}

      {tab === 'forecast' && (
        loading
          ? <div style={{ padding: '60px', textAlign: 'center', color: MUTED }}>Loading forecast from your budget...</div>
          : forecastGross === 0
            ? <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '40px', textAlign: 'center', color: MUTED }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>No forecast data yet</div>
                <div style={{ fontSize: '12px' }}>Add income lines to your Forecasted Budget to see your tax forecast here.</div>
              </div>
            : <TaxPanel gross={forecastGross} deductions={forecastDeductions} source={forecastSource} />
      )}
    </div>
  )
}