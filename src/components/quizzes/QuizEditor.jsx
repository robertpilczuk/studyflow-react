import { useState } from 'react';

function QuestionItem({ q, index, onChange, onDelete }) {
    const isMulti = q.multiCorrect || false;

    const toggleCorrect = (oi) => {
        if (isMulti) {
            const current = Array.isArray(q.correct) ? q.correct : [q.correct];
            const next = current.includes(oi)
                ? current.filter(c => c !== oi)
                : [...current, oi];
            onChange(index, { ...q, correct: next });
        } else {
            onChange(index, { ...q, correct: oi });
        }
    };

    const isChecked = (oi) => {
        if (isMulti) {
            const c = Array.isArray(q.correct) ? q.correct : [q.correct];
            return c.includes(oi);
        }
        return q.correct === oi;
    };

    const toggleMulti = () => {
        onChange(index, {
            ...q,
            multiCorrect: !isMulti,
            correct: !isMulti ? (q.correct !== undefined ? [q.correct] : []) : (Array.isArray(q.correct) ? q.correct[0] ?? 0 : q.correct),
        });
    };

    return (
        <div className="question-item">
            <div className="question-header">
                <span className="question-num">Pytanie #{index + 1}</span>
                <label className="form-checkbox" style={{ fontSize: 12 }}>
                    <input type="checkbox" checked={isMulti} onChange={toggleMulti} />
                    Wiele poprawnych
                </label>
                <button type="button" className="icon-btn danger" onClick={() => onDelete(index)}>✕</button>
            </div>

            <div className="form-group">
                <label className="form-label">Treść pytania</label>
                <input
                    className="form-input"
                    value={q.question}
                    onChange={e => onChange(index, { ...q, question: e.target.value })}
                    placeholder="Wpisz pytanie..."
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    Odpowiedzi — {isMulti ? 'zaznacz wszystkie poprawne' : 'zaznacz jedną poprawną'}
                </label>
                <div className="options-list">
                    {q.options.map((opt, oi) => (
                        <div key={oi} className={`option-row ${isChecked(oi) ? 'option-row-correct' : ''}`}>
                            <input
                                type={isMulti ? 'checkbox' : 'radio'}
                                name={`correct-${index}`}
                                checked={isChecked(oi)}
                                onChange={() => toggleCorrect(oi)}
                                title={isMulti ? 'Poprawna odpowiedź' : 'Poprawna odpowiedź'}
                            />
                            <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                            <input
                                className="form-input option-input"
                                value={opt}
                                onChange={e => {
                                    const opts = [...q.options];
                                    opts[oi] = e.target.value;
                                    onChange(index, { ...q, options: opts });
                                }}
                                placeholder={`Odpowiedź ${String.fromCharCode(65 + oi)}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function QuizEditor({ initial, onSave, onCancel }) {
    const [title, setTitle] = useState(initial?.title || initial?.name || '');
    const [questions, setQuestions] = useState(initial?.questions || []);
    const [isPublic, setIsPublic] = useState(initial?.public || false);
    const [saving, setSaving] = useState(false);

    const addQuestion = () => {
        setQuestions(q => [...q, {
            question: '',
            options: ['', '', '', ''],
            correct: 0,
            multiCorrect: false,
        }]);
    };

    const updateQuestion = (i, q) => {
        setQuestions(prev => prev.map((item, idx) => idx === i ? q : item));
    };

    const deleteQuestion = (i) => {
        setQuestions(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ title, questions, public: isPublic });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
                <label className="form-label">Tytuł quizu</label>
                <input
                    className="form-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Nazwa quizu"
                    required
                />
            </div>

            <label className="form-checkbox">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                Publiczny (dostęp przez link bez logowania)
            </label>

            <div className="questions-list">
                {questions.map((q, i) => (
                    <QuestionItem key={i} q={q} index={i} onChange={updateQuestion} onDelete={deleteQuestion} />
                ))}
            </div>

            <button type="button" className="btn-secondary btn-block" onClick={addQuestion}>
                + Dodaj pytanie
            </button>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>Anuluj</button>
                <button type="submit" className="btn-primary" disabled={saving || !title || questions.length === 0}>
                    {saving ? 'Zapisywanie...' : 'Zapisz quiz'}
                </button>
            </div>
        </form>
    );
}