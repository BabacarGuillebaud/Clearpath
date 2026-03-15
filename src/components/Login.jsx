import { useState } from 'react'
import { supabase } from '../supabase'

const sans = 'DM Sans, sans-serif'
const green = '#1a7a4a'
const border = '#e4e2dc'
const bg = '#f7f6f3'
const muted = '#6b6860'

const PROFILES = [
  { email: 'babacar@clearpath.app', name: 'Babacar', role: 'France Budget · EUR', flag: '🇫🇷', currency: 'EUR', initials: 'BA', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
  { email: 'dorothy@clearpath.app', name: 'Dorothy', role: 'Australia Tax · AUD', flag: '🇦🇺', currency: 'AUD', initials: 'DO', avatarBg: '#fce7f3', avatarColor: '#9d174d' },
]

function Login({ onLogin }) {
  const [selected, setSelected] = useState('babacar@clearpath.app')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const profile = PROFILES.find(p => p.email === selected)
    const { data, error } = await supabase.auth.signInWithPassword({ email: selected, password })
    if (error) { setError('Incorrect password'); setLoading(false); return }
    onLogin({ ...profile, id: data.user.id, email: data.user.email })
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: sans }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '2rem 1.5rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: green, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 14h12L9 2z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 8v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '500', letterSpacing: '-0.02em' }}>Clearpath</span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '500', letterSpacing: '-0.03em', marginBottom: '6px' }}>Welcome back 👋</h1>
        <p style={{ fontSize: '14px', color: muted, marginBottom: '2rem' }}>Select your profile to continue</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
          {PROFILES.map(profile => (
            <button key={profile.email} onClick={() => setSelected(profile.email)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: selected === profile.email ? '#e8f5ee' : bg,
                border: `1px solid ${selected === profile.email ? green : border}`,
                borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', width: '100%', textAlign: 'left'
              }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', background: profile.avatarBg, color: profile.avatarColor, flexShrink: 0 }}>
                {profile.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{profile.name}</div>
                <div style={{ fontSize: '12px', color: muted }}>{profile.role}</div>
              </div>
              <span style={{ fontSize: '16px' }}>{profile.flag}</span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: muted, display: 'block', marginBottom: '6px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', fontFamily: sans, outline: 'none' }} />
        </div>

        {error && <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '12px' }}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '12px', background: green, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: sans, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Access my dashboard'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9e9b94', marginTop: '1rem' }}>
          Your data is encrypted and private
        </p>
      </div>
    </div>
  )
}

export default Login