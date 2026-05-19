import { useState } from 'react';

function QuestionItem({ q, index, onChange, onDelete }) {
    return (
        <div className="question-item">
            <div className="question-header">
                <span className="question-num">#{index + 1}</span>
                <button className="icon-btn danger" onClick={() => onDelete(index)}>✕</button>
            </div>
            <input
                className="form-input"
                value={q.question}
                onChange={e => onChange(index, { ...q, question: e.target.value })}
                placeholder="Treść pytania"
            />
            <div className="options-list">
                {q.options.map((opt, oi) => (
                    <label key={oi} className="option-label">
                        <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correct === oi}
                            onChange={() => onChange(index, { ...q, correct: oi })}
                        />
                        <input
                            className="form-input option-input"
                            value={opt}
                            onChange={e => {
                                const opts = [...q.options];
                                opts[oi] = e.target.value;
                                onChange(index, { ...q, options: opts });
                            }}
                            placeholder={`Opcja ${String.fromCharCode(65 + oi)}`}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function QuizEditor({ initial, onSave, onCancel }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [questions, setQuestions] = useState(initial?.questions || []);
    const [isPublic, setIsPublic] = useState(initial?.public || false);
    const [saving, setSaving] = useState(false);

    const addQuestion = () => {
        setQuestions(q => [...q, { question: '', options: ['', '', '', ''], correct: 0 }]);
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