import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/dashboard',  label: 'Dashboard', icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/></svg> },
  { to: '/notes',      label: 'Notatki',   icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M4 5h12M4 9h12M4 13h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { to: '/quizzes',    label: 'Quizy',     icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8"/><path d="M10 6v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { to: '/flashcards', label: 'Fiszki',    icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M6 10h8M10 7v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { to: '/analytics',  label: 'Analityka', icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 15l4-6 4 3 4-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
         style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around py-2">
        {nav.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors ${isActive ? '' : ''}`}
            style={({ isActive }) => ({ color: isActive ? 'var(--blue)' : 'var(--text-3)' })}>
            {icon}
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
