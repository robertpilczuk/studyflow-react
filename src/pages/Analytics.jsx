import { useMemo } from 'react';
import { useResults, useQuizzes } from '../hooks/useQuizzes';
import { useNotes } from '../hooks/useNotes';
import { useFlashcards } from '../hooks/useFlashcards';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line,
} from 'recharts';

export default function Analytics() {
    const { results, loading } = useResults();
    const { quizzes } = useQuizzes();
    const { notes } = useNotes();
    const { decks, getDueCards } = useFlashcards();

    const avgScore = useMemo(() => {
        const valid = results.filter(r => typeof r.percentage === 'number' && !isNaN(r.percentage));
        if (!valid.length) return null;
        return Math.round(valid.reduce((a, r) => a + r.percentage, 0) / valid.length);
    }, [results]);

    const best = useMemo(() => {
        const valid = results.filter(r => typeof r.percentage === 'number' && !isNaN(r.percentage));
        return valid.length ? Math.max(...valid.map(r => r.percentage)) : null;
    }, [results]);

    const totalDue = useMemo(() => decks.reduce((a, d) => a + getDueCards(d).length, 0), [decks, getDueCards]);

    // Last 10 results for chart
    const chartData = useMemo(() =>
        [...results].slice(0, 10).reverse().map((r, i) => {
            const pct = typeof r.percentage === 'number' && !isNaN(r.percentage)
                ? r.percentage
                : (r.score != null && r.total ? Math.round((r.score / r.total) * 100) : 0);
            return { name: `#${i + 1}`, wynik: pct };
        })
        , [results]);

    // Results by quiz
    const byQuiz = useMemo(() => {
        const map = {};
        results.forEach(r => {
            const pct = typeof r.percentage === 'number' && !isNaN(r.percentage)
                ? r.percentage
                : (r.score != null && r.total ? Math.round((r.score / r.total) * 100) : null);
            if (pct === null) return;
            if (!map[r.quizId]) map[r.quizId] = { scores: [], quizId: r.quizId };
            map[r.quizId].scores.push(pct);
        });
        return Object.values(map)
            .map(entry => {
                const quiz = quizzes.find(q => q.id === entry.quizId);
                if (!quiz) return null;
                const quizName = quiz.title || quiz.name;
                const nameStr = typeof quizName === 'string' ? quizName : String(quizName || '');
                const label = nameStr
                    ? (nameStr.length > 16 ? nameStr.slice(0, 16) + '…' : nameStr)
                    : entry.quizId.slice(0, 8);
                return {
                    name: label,
                    avg: Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length),
                    attempts: entry.scores.length,
                };
            })
            .filter(Boolean);
    }, [results, quizzes]);

    if (loading) return <div className="loading-state">Ładowanie...</div>;

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Analityka</h1>
                    <p className="page-subtitle">Twoje postępy w nauce</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">📊</span>
                    <span className="stat-value">{avgScore !== null ? `${avgScore}%` : '—'}</span>
                    <span className="stat-label">Średni wynik</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-value">{best !== null ? `${best}%` : '—'}</span>
                    <span className="stat-label">Najlepszy wynik</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📝</span>
                    <span className="stat-value">{results.length}</span>
                    <span className="stat-label">Rozwiązanych quizów</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📓</span>
                    <span className="stat-value">{notes.length}</span>
                    <span className="stat-label">Notatek</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🃏</span>
                    <span className="stat-value">{decks.reduce((a, d) => a + (d.cards?.length || 0), 0)}</span>
                    <span className="stat-label">Fiszek łącznie</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🔔</span>
                    <span className="stat-value">{totalDue}</span>
                    <span className="stat-label">Do powtórzenia</span>
                </div>
            </div>

            {chartData.length > 0 && (
                <section className="card analytics-chart">
                    <h2 className="card-title">Postęp wyników (ostatnie 10)</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 12 }} unit="%" />
                            <Tooltip
                                contentStyle={{ background: '#161b27', border: '1px solid #2a3244', borderRadius: 8 }}
                                labelStyle={{ color: '#c9d1e0' }}
                                itemStyle={{ color: '#4f9cf9' }}
                            />
                            <Line type="monotone" dataKey="wynik" stroke="#4f9cf9" strokeWidth={2} dot={{ fill: '#4f9cf9', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            )}

            {byQuiz.length > 0 && (
                <section className="card analytics-chart">
                    <h2 className="card-title">Średni wynik per quiz</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={byQuiz}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 12 }} unit="%" />
                            <Tooltip
                                contentStyle={{ background: '#161b27', border: '1px solid #2a3244', borderRadius: 8 }}
                                labelStyle={{ color: '#c9d1e0' }}
                                itemStyle={{ color: '#a78bfa' }}
                            />
                            <Bar dataKey="avg" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </section>
            )}

            {results.length === 0 && (
                <div className="empty-state">
                    <span className="empty-icon">📊</span>
                    <p>Brak danych. Rozwiąż kilka quizów, żeby zobaczyć statystyki.</p>
                </div>
            )}
        </div>
    );
}