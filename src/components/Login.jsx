import { useState } from 'react'

const profiles = [
  { id: 'babacar', name: 'Babacar', role: 'Budget France · EUR', flag: '🇫🇷', currency: 'EUR', country: 'FR', avatarClass: 'av-t' },
  { id: 'dorothy', name: 'Dorothy', role: 'Fiscalité Australie · AUD', flag: '🇦🇺', currency: 'AUD', country: 'AU', avatarClass: 'av-d' },
]

function Login({ onLogin }) {
  const [selected, setSelected] = useState('babacar')

  const handleLogin = () => {
    const profile = profiles.find(p => p.id === selected)
    onLogin(profile)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '2rem 1.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: '#1a7a4a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 14h12L9 2z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 8v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '500', letterSpacing: '-0.02em' }}>Clearpath</span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '500', letterSpacing: '-0.03em', marginBottom: '6px' }}>Bonjour 👋</h1>
        <p style={{ fontSize: '14px', color: '#6b6860', marginBottom: '2rem' }}>Choisissez votre profil pour continuer</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => setSelected(profile.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: selected === profile.id ? '#e8f5ee' : '#f7f6f3',
                border: selected === profile.id ? '1px solid #1a7a4a' : '1px solid #e4e2dc',
                borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                width: '100%', textAlign: 'left', transition: 'all 0.15s'
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500',
                background: profile.id === 'babacar' ? '#dbeafe' : '#fce7f3',
                color: profile.id === 'babacar' ? '#1e40af' : '#9d174d',
                flexShrink: 0
              }}>
                {profile.id === 'babacar' ? 'BA' : 'DO'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{profile.name}</div>
                <div style={{ fontSize: '12px', color: '#6b6860' }}>{profile.role}</div>
              </div>
              <span style={{ fontSize: '16px' }}>{profile.flag}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '12px', background: '#1a7a4a', color: '#fff',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
          }}
        >
          Accéder à mon tableau de bord
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9e9b94', marginTop: '1rem' }}>
          Vos données sont chiffrées et privées
        </p>
      </div>
    </div>
  )
}

export default Login