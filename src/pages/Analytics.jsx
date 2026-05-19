import { useMemo } from 'react';
import { useResults } from '../hooks/useQuizzes';
import { useNotes } from '../hooks/useNotes';
import { useFlashcards } from '../hooks/useFlashcards';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line,
} from 'recharts';

export default function Analytics() {
    const { results, loading } = useResults();
    const { notes } = useNotes();
    const { decks, getDueCards } = useFlashcards();

    const avgScore = useMemo(() => {
        if (!results.length) return null;
        return Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length);
    }, [results]);

    const best = useMemo(() => results.length ? Math.max(...results.map(r => r.percentage)) : null, [results]);

    const totalDue = useMemo(() => decks.reduce((a, d) => a + getDueCards(d).length, 0), [decks, getDueCards]);

    // Last 10 results for chart
    const chartData = useMemo(() =>
        [...results].slice(0, 10).reverse().map((r, i) => ({
            name: `#${i + 1}`,
            wynik: r.percentage,
        }))
        , [results]);

    // Results by quiz
    const byQuiz = useMemo(() => {
        const map = {};
        results.forEach(r => {
            if (!map[r.quizId]) map[r.quizId] = { scores: [], quizId: r.quizId };
            map[r.quizId].scores.push(r.percentage);
        });
        return Object.values(map).map(entry => ({
            quizId: entry.quizId.slice(0, 8),
            avg: Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length),
            attempts: entry.scores.length,
        }));
    }, [results]);

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
                            <XAxis dataKey="quizId" tick={{ fill: '#8892a4', fontSize: 12 }} />
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