import { useState, useEffect } from 'react';

export default function QuizPlayer({ quiz, onFinish, onClose }) {
    const questions = quiz.questions || [];
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [phase, setPhase] = useState('quiz'); // 'quiz' | 'summary'
    const [timeLeft, setTimeLeft] = useState(quiz.timer || null);

    // Timer
    useEffect(() => {
        if (!quiz.timer || phase !== 'quiz') return;
        if (timeLeft <= 0) { handleNext(true); return; }
        const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, phase]);

    useEffect(() => {
        if (quiz.timer) setTimeLeft(quiz.timer);
    }, [current]);

    const handleSelect = (i) => setSelected(i);

    const handleNext = (timeout = false) => {
        const ans = timeout ? -1 : selected;
        const newAnswers = [...answers, { questionIndex: current, selected: ans }];
        setAnswers(newAnswers);
        setSelected(null);

        if (current + 1 >= questions.length) {
            setPhase('summary');
        } else {
            setCurrent(c => c + 1);
        }
    };

    if (questions.length === 0) return <p className="empty-text">Ten quiz nie ma pytań.</p>;

    if (phase === 'summary') {
        const score = answers.filter(a => questions[a.questionIndex].correct === a.selected).length;
        return (
            <div className="quiz-summary">
                <div className="summary-score">
                    <span className="score-big">{score}/{questions.length}</span>
                    <span className="score-pct">{Math.round((score / questions.length) * 100)}%</span>
                </div>

                <div className="review-list">
                    {questions.map((q, i) => {
                        const userAnswer = answers[i]?.selected;
                        const correct = q.correct;
                        const isCorrect = userAnswer === correct;
                        return (
                            <div key={i} className={`review-item ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
                                <p className="review-question">{q.question}</p>
                                <p className="review-answer">
                                    {isCorrect ? '✅' : '❌'} Twoja: {userAnswer >= 0 ? q.options[userAnswer] : '(czas)'}
                                    {!isCorrect && <> · Poprawna: <strong>{q.options[correct]}</strong></>}
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

    const q = questions[current];
    return (
        <div className="quiz-player">
            <div className="quiz-progress">
                <span>Pytanie {current + 1} / {questions.length}</span>
                {timeLeft !== null && <span className={`quiz-timer ${timeLeft <= 5 ? 'timer-urgent' : ''}`}>⏱ {timeLeft}s</span>}
            </div>
            <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${((current) / questions.length) * 100}%` }} />
            </div>

            <h3 className="quiz-question">{q.question}</h3>

            <div className="quiz-options">
                {q.options.map((opt, i) => (
                    <button
                        key={i}
                        className={`quiz-option ${selected === i ? 'quiz-option-selected' : ''}`}
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
                    disabled={selected === null}
                >
                    {current + 1 === questions.length ? 'Zakończ' : 'Następne →'}
                </button>
            </div>
        </div>
    );
}