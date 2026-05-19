import { NavLink } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/dashboard',  label: 'Dashboard',  icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/></svg> },
  { to: '/notes',      label: 'Notatki',    icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M4 5h12M4 9h12M4 13h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { to: '/quizzes',    label: 'Quizy',      icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8"/><path d="M10 6v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { to: '/flashcards', label: 'Fiszki',     icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M6 10h8M10 7v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { to: '/analytics',  label: 'Analityka',  icon: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M3 15l4-6 4 3 4-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export default function Sidebar({ onClose }) {
  const { user } = useAuth()
  const name = user?.displayName || user?.email || 'Użytkownik'

  return (
    <aside className="flex flex-col h-full p-4" style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
             style={{ background: 'var(--blue)', fontFamily: 'Plus Jakarta Sans' }}>SF</div>
        <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>StudyFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {nav.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                isActive
                  ? 'text-accent-blue bg-blue-500/10'
                  : 'hover:bg-white/5'
              }`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--blue)' : 'var(--text-2)' })}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center gap-2 p-2 rounded-md" style={{ background: 'var(--bg-3)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
               style={{ background: 'var(--blue)' }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-3)', fontFamily: 'JetBrains Mono' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut(auth)}
          className="w-full py-2 text-xs rounded-md transition-colors"
          style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', background: 'transparent' }}
          onMouseOver={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
          onMouseOut={e => e.target.style.background = 'transparent'}>
          Wyloguj
        </button>
      </div>
    </aside>
  )
}
