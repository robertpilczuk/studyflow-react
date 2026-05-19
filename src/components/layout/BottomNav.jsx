import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', icon: '🏠', label: 'Home', end: true },
  { to: '/notes', icon: '📝', label: 'Notatki' },
  { to: '/quizzes', icon: '🧠', label: 'Quizy' },
  { to: '/flashcards', icon: '🃏', label: 'Fiszki' },
  { to: '/analytics', icon: '📊', label: 'Stats' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-items">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}