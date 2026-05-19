import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const LIMIT = 20;

export default function GeminiUsage() {
    const { user } = useAuth();
    const [usage, setUsage] = useState({ quiz: 0, flashcard: 0 });

    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, 'users', user.uid)).then(snap => {
            const data = snap.data() || {};
            const today = new Date().toDateString();
            if (data.usageDate !== today) {
                setUsage({ quiz: 0, flashcard: 0 });
            } else {
                setUsage({ quiz: data.quizUsage || 0, flashcard: data.flashcardUsage || 0 });
            }
        });
    }, [user]);

    const bar = (used) => {
        const pct = Math.round((used / LIMIT) * 100);
        const color = used >= LIMIT ? 'var(--accent-red)' : used >= 15 ? 'var(--accent-amber)' : 'var(--accent-green)';
        return (
            <div className="gemini-bar-track">
                <div className="gemini-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        );
    };

    return (
        <div className="gemini-usage">
            <span className="gemini-label">✨ Limit AI dziś</span>
            <div className="gemini-counters">
                <div className="gemini-counter">
                    <span className="gemini-type">Quizy</span>
                    {bar(usage.quiz)}
                    <span className="gemini-num">{usage.quiz}/{LIMIT}</span>
                </div>
                <div className="gemini-counter">
                    <span className="gemini-type">Fiszki</span>
                    {bar(usage.flashcard)}
                    <span className="gemini-num">{usage.flashcard}/{LIMIT}</span>
                </div>
            </div>
        </div>
    );
}