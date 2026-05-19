import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import QuizPlayer from '../components/quizzes/QuizPlayer';

export default function PublicQuiz() {
    const [params] = useSearchParams();
    const quizId = params.get('quiz');
    const [quiz, setQuiz] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | found | notfound | done
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!quizId) { setStatus('notfound'); return; }
        getDoc(doc(db, 'quizzes', quizId)).then(snap => {
            if (!snap.exists() || !snap.data().public) {
                setStatus('notfound');
            } else {
                setQuiz({ id: snap.id, ...snap.data() });
                setStatus('found');
            }
        }).catch(() => setStatus('notfound'));
    }, [quizId]);

    const handleFinish = (score, total) => {
        setResult({ score, total, pct: Math.round((score / total) * 100) });
        setStatus('done');
    };

    return (
        <div className="public-shell">
            <header className="public-header">
                <span className="public-logo">Study<span>Flow</span></span>
            </header>

            <main className="public-main">
                {status === 'loading' && (
                    <div className="loading-state">Ładowanie quizu...</div>
                )}

                {status === 'notfound' && (
                    <div className="empty-state">
                        <span className="empty-icon">🔒</span>
                        <p>Quiz nie istnieje lub nie jest publiczny.</p>
                    </div>
                )}

                {status === 'found' && quiz && (
                    <div className="public-card">
                        <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>{quiz.title}</h1>
                        <QuizPlayer
                            quiz={quiz}
                            onFinish={handleFinish}
                            onClose={() => setStatus('notfound')}
                        />
                    </div>
                )}

                {status === 'done' && result && (
                    <div className="public-card">
                        <div className="quiz-summary">
                            <div className="summary-score">
                                <span className="score-big">{result.score}/{result.total}</span>
                                <span className="score-pct">{result.pct}%</span>
                            </div>
                            <p className="empty-text">
                                Dzięki za rozwiązanie quizu!{' '}
                                <a href="/" style={{ color: 'var(--accent)' }}>Zaloguj się, żeby śledzić postępy →</a>
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}