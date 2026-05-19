import { useState, useEffect } from 'react';

export default function QuizPlayer({ quiz, onFinish, onClose }) {
    const questions = quiz.questions || [];
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState([]); // always array
    const [phase, setPhase] = useState('quiz');
    const [timeLeft, setTimeLeft] = useState(quiz.timer || null);

    useEffect(() => {
        if (!quiz.timer || phase !== 'quiz') return;
        if (timeLeft <= 0) { handleNext(true); return; }
        const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, phase]);

    useEffect(() => {
        if (quiz.timer) setTimeLeft(quiz.timer);
        setSelected([]);
    }, [current]);

    const q = questions[current];
    const isMulti = q?.multiCorrect || false;

    const handleSelect = (oi) => {
        if (isMulti) {
            setSelected(prev =>
                prev.includes(oi) ? prev.filter(x => x !== oi) : [...prev, oi]
            );
        } else {
            setSelected([oi]);
        }
    };

    const isSelected = (oi) => selected.includes(oi);

    const handleNext = (timeout = false) => {
        const ans = timeout ? [] : selected;
        const newAnswers = [...answers, { questionIndex: current, selected: ans }];
        setAnswers(newAnswers);
        setSelected([]);
        if (current + 1 >= questions.length) setPhase('summary');
        else setCurrent(c => c + 1);
    };

    // Check if answer is correct
    const isCorrect = (q, selectedArr) => {
        if (q.multiCorrect) {
            const correct = Array.isArray(q.correct) ? q.correct : [q.correct];
            return correct.length === selectedArr.length &&
                correct.every(c => selectedArr.includes(c));
        }
        return selectedArr[0] === q.correct;
    };

    if (questions.length === 0) return <p className="empty-text">Ten quiz nie ma pytań.</p>;

    if (phase === 'summary') {
        const score = answers.filter((a, i) => isCorrect(questions[i], a.selected)).length;
        return (
            <div className="quiz-summary">
                <div className="summary-score">
                    <span className="score-big">{score}/{questions.length}</span>
                    <span className="score-pct">{Math.round((score / questions.length) * 100)}%</span>
                </div>

                <div className="review-list">
                    {questions.map((q, i) => {
                        const userSel = answers[i]?.selected || [];
                        const correct = q.multiCorrect
                            ? (Array.isArray(q.correct) ? q.correct : [q.correct])
                            : [q.correct];
                        const ok = isCorrect(q, userSel);
                        return (
                            <div key={i} className={`review-item ${ok ? 'review-correct' : 'review-wrong'}`}>
                                <p className="review-question">{q.question || q.text}</p>
                                <p className="review-answer">
                                    {ok ? '✅' : '❌'} Twoja: {userSel.length ? userSel.map(s => q.options[s]).join(', ') : '(czas)'}
                                    {!ok && <> · Poprawna: <strong>{correct.map(c => q.options[c]).join(', ')}</strong></>}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="form-actions">
                    <button className="btn-primary" onClick={() => onFinish(score, questions.length, answers)}>
                        Zapisz wynik
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-player">
            <div className="quiz-progress">
                <span>Pytanie {current + 1} / {questions.length}</span>
                {timeLeft !== null && (
                    <span className={`quiz-timer ${timeLeft <= 5 ? 'timer-urgent' : ''}`}>⏱ {timeLeft}s</span>
                )}
            </div>
            <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
            </div>

            <h3 className="quiz-question">{q.question || q.text}</h3>
            {isMulti && <p className="quiz-multi-hint">Zaznacz wszystkie poprawne odpowiedzi</p>}

            <div className="quiz-options">
                {q.options.map((opt, i) => (
                    <button
                        key={i}
                        className={`quiz-option ${isSelected(i) ? 'quiz-option-selected' : ''}`}
                        onClick={() => handleSelect(i)}
                    >
                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                        {opt}
                    </button>
                ))}
            </div>

            <div className="form-actions">
                <button className="btn-secondary" onClick={onClose}>Przerwij</button>
                <button
                    className="btn-primary"
                    onClick={() => handleNext()}
                    disabled={selected.length === 0}
                >
                    {current + 1 === questions.length ? 'Zakończ' : 'Następne →'}
                </button>
            </div>
        </div>
    );
}