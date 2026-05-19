import { useState } from 'react';

export default function DeckEditor({ initial, onSave, onCancel }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [cards, setCards] = useState(initial?.cards || []);
    const [saving, setSaving] = useState(false);

    const addCard = () => setCards(c => [...c, { front: '', back: '' }]);

    const updateCard = (i, field, val) => {
        setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
    };

    const removeCard = (i) => setCards(prev => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ title, cards });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
                <label className="form-label">Nazwa talii</label>
                <input
                    className="form-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Nazwa talii fiszek"
                    required
                />
            </div>

            <div className="questions-list">
                {cards.map((card, i) => (
                    <div key={i} className="question-item">
                        <div className="question-header">
                            <span className="question-num">#{i + 1}</span>
                            <button type="button" className="icon-btn danger" onClick={() => removeCard(i)}>✕</button>
                        </div>
                        <input
                            className="form-input"
                            value={card.front}
                            onChange={e => updateCard(i, 'front', e.target.value)}
                            placeholder="Przód (pytanie / pojęcie)"
                        />
                        <textarea
                            className="form-textarea"
                            value={card.back}
                            onChange={e => updateCard(i, 'back', e.target.value)}
                            placeholder="Tył (odpowiedź / definicja)"
                            rows={2}
                        />
                    </div>
                ))}
            </div>

            <button type="button" className="btn-secondary btn-block" onClick={addCard}>
                + Dodaj fiszkę
            </button>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>Anuluj</button>
                <button type="submit" className="btn-primary" disabled={saving || !title || cards.length === 0}>
                    {saving ? 'Zapisywanie...' : 'Zapisz talię'}
                </button>
            </div>
        </form>
    );
}