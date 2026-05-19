import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import ActivityFeed from '../components/ui/ActivityFeed';

function StatCard({ label, value, icon, to }) {
    const card = (
        <div className="stat-card">
            <span className="stat-icon">{icon}</span>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
    return to ? <Link to={to} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

export default function Dashboard() {
    const { user } = useAuth();
    const { notes: { notes }, quizzes: { quizzes }, results: { results }, flashcards: { decks, getDueCards } } = useAppContext();

    const avgScore = results.length
        ? (() => {
            const valid = results.filter(r => typeof r.percentage === 'number' && !isNaN(r.percentage));
            return valid.length ? Math.round(valid.reduce((a, r) => a + r.percentage, 0) / valid.length) : null;
        })()
        : null;

    const dueCards = decks.reduce((acc, d) => acc + getDueCards(d).length, 0);

    const recentResults = results.slice(0, 5);

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        Cześć, {user?.displayName?.split(' ')[0] || 'Użytkowniku'} 👋
                    </h1>
                    <p className="page-subtitle">Twoje postępy w nauce</p>
                </div>
            </header>

            <div className="stats-grid">
                <StatCard label="Notatki" value={notes.length} icon="📝" to="/notes" />
                <StatCard label="Quizy" value={quizzes.length} icon="🧠" to="/quizzes" />
                <StatCard label="Talie fiszek" value={decks.length} icon="🃏" to="/flashcards" />
                <StatCard
                    label="Średni wynik"
                    value={avgScore !== null ? `${avgScore}%` : '—'}
                    icon="📊"
                    to="/analytics"
                />
            </div>

            {dueCards > 0 && (
                <Link to="/flashcards" className="due-banner">
                    <span>🔔</span>
                    <span>Masz <strong>{dueCards}</strong> {dueCards === 1 ? 'fiszkę' : 'fiszki'} do powtórzenia dziś</span>
                    <span className="due-arrow">→</span>
                </Link>
            )}

            <div className="dashboard-grid">
                <section className="card">
                    <h2 className="card-title">Ostatnie notatki</h2>
                    {notes.length === 0 ? (
                        <p className="empty-text">Brak notatek. <Link to="/notes">Dodaj pierwszą →</Link></p>
                    ) : (
                        <ul className="item-list">
                            {notes.slice(0, 5).map(n => (
                                <li key={n.id} className="item-row">
                                    <span className="item-icon">📝</span>
                                    <span className="item-title">{n.title}</span>
                                    {n.category && <span className="tag">{n.category}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card">
                    <h2 className="card-title">Ostatnie wyniki</h2>
                    {recentResults.length === 0 ? (
                        <p className="empty-text">Brak wyników. <Link to="/quizzes">Rozwiąż quiz →</Link></p>
                    ) : (
                        <ul className="item-list">
                            {recentResults.map(r => (
                                <li key={r.id} className="item-row">
                                    <span className={`score-badge ${r.percentage >= 70 ? 'score-good' : 'score-bad'}`}>
                                        {r.percentage}%
                                    </span>
                                    <span className="item-title">{r.score}/{r.total} pkt</span>
                                    <span className="item-date">
                                        {r.createdAt?.toDate?.()?.toLocaleDateString('pl-PL') || ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <ActivityFeed />
            </div>
        </div>
    );
}