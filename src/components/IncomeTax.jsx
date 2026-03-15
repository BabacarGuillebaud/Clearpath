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
  { min: 190001, max: 250000, rate: 0.45, label: '$190,001+' },
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

function calcMLS(income, hasPrivateHealth) {
  if (hasPrivateHealth || income <= 93000) return 0
  if (income <= 108000) return income * 0.01
  if (income <= 144000) return income * 0.0125
  return income * 0.015
}

function getBracketFill(bracket, taxableIncome) {
  if (taxableIncome <= bracket.min) return 0
  const used = Math.min(taxableIncome, bracket.max) - bracket.min
  const total = bracket.max - bracket.min
  return Math.min(100, Math.round((used / total) * 100))
}

const fmt = (v) => `A$${Math.round(Math.abs(v)).toLocaleString('en-AU')}`

function TaxBrackets({ taxableIncome }) {
  return (
    <div>
      {BRACKETS.map((b, i) => {
        const fill = getBracketFill(b, taxableIncome)
        const isActive = taxableIncome >= b.min && taxableIncome <= b.max
        const isUsed = taxableIncome > b.min
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
            borderRadius: '6px', marginBottom: '4px',
            background: isActive ? '#e8f5ee' : 'transparent',
            border: isActive ? `0.5px solid #a7f3d0` : '0.5px solid transparent'
          }}>
            <span style={{ fontFamily: MONO, fontSize: '11px', color: isActive ? G : MUTED, minWidth: '155px' }}>{b.label}</span>
            <span style={{ fontSize: '12px', fontWeight: '500', minWidth: '38px', color: isActive ? G : isUsed ? '#1a1917' : HINT }}>
              {(b.rate * 100).toFixed(0)}%
            </span>
            <div style={{ flex: 1, height: '4px', background: BG2, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${fill}%`,
                background: isActive ? G : isUsed ? '#a7f3d0' : '#e4e2dc',
                borderRadius: '2px', transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{ fontSize: '11px', fontFamily: MONO, color: isUsed ? G : HINT, minWidth: '32px', textAlign: 'right' }}>
              {fill > 0 ? `${fill}%` : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TaxBreakdown({ gross, deductions, salarySacrifice, hasPrivateHealth, source }) {
  const salaryTax = salarySacrifice * 0.15
  const taxable = Math.max(0, gross - deductions - salarySacrifice)
  const baseTax = calcTax(taxable)
  const lito = calcLITO(taxable)
  const medicare = taxable * 0.02
  const mls = calcMLS(taxable, hasPrivateHealth)
  const totalTax = Math.max(0, baseTax - lito + medicare + mls + salaryTax)
  const netIncome = gross - totalTax
  const effectiveRate = gross > 0 ? ((totalTax / gross) * 100).toFixed(1) : '0.0'
  const activeBracketRate = BRACKETS.find(b => taxable >= b.min && taxable <= b.max)?.rate || 0.325
  const taxSaving = (deductions + salarySacrifice) * activeBracketRate

  const metricStyle = { background: '#f0efeb', borderRadius: '8px', padding: '12px 14px' }
  const labelStyle = { fontSize: '10px', color: HINT, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }
  const cardStyle = { background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px' }
  const cardTitle = { fontSize: '10px', fontWeight: '500', color: HINT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }

  const Row = ({ label, value, color, indent }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: indent ? '5px 10px 5px 22px' : '5px 10px',
      fontSize: indent ? '12px' : '12.5px',
      color: indent ? MUTED : '#1a1917'
    }}>
      <span>{label}</span>
      <span style={{ fontFamily: MONO, fontWeight: '500', color: color || '#1a1917' }}>{value}</span>
    </div>
  )

  const SectionHeader = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500', background: BG2, borderRadius: '6px', margin: '8px 0 2px', padding: '7px 10px', fontSize: '13px' }}>
      <span>{label}</span>
      {value && <span style={{ fontFamily: MONO }}>{value}</span>}
    </div>
  )

  const Divider = () => <div style={{ borderTop: `1px solid ${BDR}`, margin: '6px 0' }} />

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Gross income', value: fmt(gross), color: '#1a1917' },
          { label: 'Total tax', value: fmt(totalTax), color: R },
          { label: 'Effective rate', value: `${effectiveRate}%`, color: '#1a1917' },
          { label: 'Net income', value: fmt(netIncome), color: G },
        ].map(m => (
          <div key={m.label} style={metricStyle}>
            <div style={labelStyle}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '500', fontFamily: MONO, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: '14px' }}>
        <div style={cardStyle}>
          <div style={cardTitle}>
            <span>Tax return FY 2025–26</span>
            {source && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f0fdf4', color: G, border: '0.5px solid #a7f3d0' }}>From budget</span>}
          </div>

          <SectionHeader label="Gross earnings" value={fmt(gross)} />

          <SectionHeader label="Deductions" />
          {deductions > 0
            ? <Row label="Work-related deductions" value={`−${fmt(deductions)}`} color={G} indent />
            : <Row label="No deductions recorded" value="—" color={HINT} indent />
          }
          {salarySacrifice > 0 && <Row label="Salary sacrifice (concessional)" value={`−${fmt(salarySacrifice)}`} color={G} indent />}
          <Divider />
          <Row label="Total deductions" value={deductions + salarySacrifice > 0 ? `−${fmt(deductions + salarySacrifice)}` : '—'} color={deductions + salarySacrifice > 0 ? G : HINT} />

          <SectionHeader label="Taxable income" value={fmt(taxable)} />
          <Row label="Income tax" value={baseTax > 0 ? `−${fmt(baseTax)}` : '—'} color={baseTax > 0 ? R : HINT} indent />
          <Row label="Medicare levy (2%)" value={medicare > 0 ? `−${fmt(medicare)}` : '—'} color={medicare > 0 ? R : HINT} indent />
          <Row
            label={`Medicare levy surcharge${hasPrivateHealth ? ' (exempt — private health)' : mls === 0 && taxable <= 93000 ? ' (exempt — under threshold)' : ''}`}
            value={mls > 0 ? `−${fmt(mls)}` : '—'}
            color={mls > 0 ? R : HINT}
            indent
          />
          <Row label="Low income offset" value={lito > 0 ? `+${fmt(lito)}` : '—'} color={lito > 0 ? G : HINT} indent />
          {salarySacrifice > 0 && <Row label="Tax on salary sacrifice (15%)" value={`−${fmt(salaryTax)}`} color={R} indent />}
          <Divider />
          <Row label="Tax paid total" value={`−${fmt(totalTax)}`} color={R} />

          <div style={{ background: '#e8f5ee', borderRadius: '8px', padding: '11px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
            <span>Net income</span>
            <span style={{ fontFamily: MONO, color: G }}>{fmt(netIncome)}</span>
          </div>

          <div style={{ borderRadius: '8px', padding: '10px 12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', background: '#e8f5ee', color: G }}>
            <span>Estimated tax return — Credit</span>
            <span style={{ fontFamily: MONO }}>{fmt(taxSaving)}</span>
          </div>

          {taxSaving > 0 && (
            <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '11px', color: G, border: '0.5px solid #a7f3d0' }}>
              Deductions saved you {fmt(taxSaving)} in tax this year
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Tax brackets FY 2025–26</div>
          <TaxBrackets taxableIncome={taxable} />

          <div style={{ marginTop: '16px', padding: '12px', background: BG2, borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: '500', color: HINT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Data sources</div>
            {source ? (
              <>
                <div style={{ fontSize: '12px', color: MUTED, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Income</span>
                  <span style={{ fontFamily: MONO, color: G }}>{source}</span>
                </div>
                <div style={{ fontSize: '12px', color: MUTED, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Deductions (ATO tab)</span>
                  <span style={{ fontFamily: MONO, color: G }}>{fmt(deductions + salarySacrifice)}</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '12px', color: MUTED }}>Adjust sliders to simulate different scenarios</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IncomeTax({ user }) {
  const [tab, setTab] = useState('simulation')
  const [simGross, setSimGross] = useState(75000)
  const [simDeductions, setSimDeductions] = useState(3000)
  const [simSalarySacrifice, setSimSalarySacrifice] = useState(0)
  const [simPrivateHealth, setSimPrivateHealth] = useState(false)
  const [forecastGross, setForecastGross] = useState(0)
  const [forecastDeductions, setForecastDeductions] = useState(0)
  const [forecastSalarySacrifice, setForecastSalarySacrifice] = useState(0)
  const [forecastPrivateHealth, setForecastPrivateHealth] = useState(false)
  const [forecastSource, setForecastSource] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true)
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const { data: lines } = await supabase.from('budget_lines').select('*').eq('user_id', user.id).eq('type', 'income')
      if (!lines || lines.length === 0) { setLoading(false); return }

      const lineIds = lines.map(l => l.id)
      let totalAnnual = 0
      let closedMonths = 0
      let forecastMonths = 0

      for (let m = 1; m <= 12; m++) {
        const isPast = m < currentMonth
        const { data: vals } = await supabase.from('budget_values').select('*').in('line_id', lineIds).eq('month', m).eq('year', currentYear).eq('is_forecast', !isPast)
        totalAnnual += vals?.reduce((s, v) => s + v.amount, 0) || 0
        if (isPast) closedMonths++
        else forecastMonths++
      }

      const { data: taxDeds } = await supabase.from('tax_deductions').select('amount, category').eq('user_id', user.id).eq('financial_year', 'FY2025-26')
      const totalDeds = taxDeds?.filter(d => d.category !== 'salary_sacrifice').reduce((s, d) => s + d.amount, 0) || 0
      const totalSS = taxDeds?.filter(d => d.category === 'salary_sacrifice').reduce((s, d) => s + d.amount, 0) || 0

      const { data: atoData } = await supabase.from('ato_data').select('*').eq('user_id', user.id).single()

      setForecastGross(totalAnnual)
      setForecastDeductions(totalDeds)
      setForecastSalarySacrifice(totalSS)
      setForecastPrivateHealth(atoData?.has_private_health || false)
      setForecastSource(`${closedMonths}m actual · ${forecastMonths}m forecasted`)
      setLoading(false)
    }
    loadForecast()
  }, [user.id])

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
      style={{
        padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontFamily: SANS, fontSize: '13px', fontWeight: tab === id ? '500' : '400',
        background: tab === id ? G : 'transparent',
        color: tab === id ? '#fff' : MUTED, transition: 'all 0.15s'
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
      </div>

      {tab === 'simulation' && (
        <div>
          <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '500', color: HINT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Adjust parameters</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '14px' }}>
              {[
                { label: 'Gross income', value: simGross, set: setSimGross, max: 250000, step: 1000 },
                { label: 'Salary sacrifice', value: simSalarySacrifice, set: setSimSalarySacrifice, max: 30000, step: 500 },
                { label: 'Other deductions', value: simDeductions, set: setSimDeductions, max: 50000, step: 500 },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: MUTED, marginBottom: '5px' }}>
                    <span>{s.label}</span>
                    <span style={{ fontFamily: MONO, fontWeight: '500', color: '#1a1917' }}>{fmt(s.value)}</span>
                  </div>
                  <input type="range" min="0" max={s.max} value={s.value} step={s.step}
                    onChange={e => s.set(Number(e.target.value))}
                    style={{ width: '100%', accentColor: G }} />
                </div>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: MUTED }}>
              <input type="checkbox" checked={simPrivateHealth} onChange={e => setSimPrivateHealth(e.target.checked)}
                style={{ accentColor: G, width: '14px', height: '14px' }} />
              I have private health insurance (exempt from Medicare Levy Surcharge)
            </label>
          </div>
          <TaxBreakdown gross={simGross} deductions={simDeductions} salarySacrifice={simSalarySacrifice} hasPrivateHealth={simPrivateHealth} />
        </div>
      )}

      {tab === 'forecast' && (
        loading
          ? <div style={{ padding: '60px', textAlign: 'center', color: MUTED }}>Loading forecast from your budget...</div>
          : forecastGross === 0
            ? <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '40px', textAlign: 'center', color: MUTED }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>No forecast data yet</div>
                <div style={{ fontSize: '12px' }}>Add income lines to your Forecasted Budget to see your tax forecast here.</div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: MUTED, justifyContent: 'center' }}>
                    <input type="checkbox" checked={forecastPrivateHealth} onChange={e => setForecastPrivateHealth(e.target.checked)}
                      style={{ accentColor: G, width: '14px', height: '14px' }} />
                    Private health insurance
                  </label>
                </div>
              </div>
            : <div>
                <div style={{ background: '#fff', border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: MUTED }}>
                    <input type="checkbox" checked={forecastPrivateHealth} onChange={e => setForecastPrivateHealth(e.target.checked)}
                      style={{ accentColor: G, width: '14px', height: '14px' }} />
                    I have private health insurance (exempt from Medicare Levy Surcharge)
                  </label>
                </div>
                <TaxBreakdown gross={forecastGross} deductions={forecastDeductions} salarySacrifice={forecastSalarySacrifice} hasPrivateHealth={forecastPrivateHealth} source={forecastSource} />
              </div>
      )}
    </div>
  )
}