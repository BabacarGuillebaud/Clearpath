import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

const PROFILES = {
  'babacar@clearpath.app': { name: 'Babacar', role: 'Budget France · EUR', flag: '🇫🇷', currency: 'EUR', initials: 'BA', avatarBg: '#dbeafe', avatarColor: '#1e40af' },
  'dorothy@clearpath.app': { name: 'Dorothy', role: 'Fiscalité Australie · AUD', flag: '🇦🇺', currency: 'AUD', initials: 'DO', avatarBg: '#fce7f3', avatarColor: '#9d174d' },
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const profile = PROFILES[session.user.email]
        setUser({ ...profile, id: session.user.id, email: session.user.email })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const profile = PROFILES[session.user.email]
        setUser({ ...profile, id: session.user.id, email: session.user.email })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#6b6860' }}>
      Chargement...
    </div>
  )

  return (
    <div>
      {!user
        ? <Login onLogin={setUser} />
        : <Dashboard user={user} onLogout={handleLogout} />
      }
    </div>
  )
}

export default App