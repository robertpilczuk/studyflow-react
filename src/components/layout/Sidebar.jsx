import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

const NAV = [
  { to: '/', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/notes', icon: '📝', label: 'Notatki' },
  { to: '/quizzes', icon: '🧠', label: 'Quizy' },
  { to: '/flashcards', icon: '🃏', label: 'Fiszki' },
  { to: '/analytics', icon: '📊', label: 'Analityka' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Study<span>Flow</span></div>

      <nav>
        <div className="nav-section-label">Nawigacja</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.displayName || 'Użytkownik'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={() => signOut(auth)}>
          Wyloguj się
        </button>
      </div>
    </aside>
  );
}