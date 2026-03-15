import { useState } from 'react'
import { supabase } from './supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (profile) => {
    setUser(profile)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div>
      {!user 
        ? <Login onLogin={handleLogin} />
        : <Dashboard user={user} onLogout={handleLogout} />
      }
    </div>
  )
}

export default App