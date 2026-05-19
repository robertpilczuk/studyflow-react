import { useState } from 'react';

export default function FlashcardReview({ deck, dueCards, onReview, onClose }) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [done, setDone] = useState(false);

    if (dueCards.length === 0) return <p className="empty-text">Brak fiszek do powtórzenia!</p>;

    const card = dueCards[index];
    // Map card back to its deck index
    const deckIndex = deck.cards.indexOf(card);

    const rate = async (quality) => {
        await onReview(deckIndex, quality);
        if (index + 1 >= dueCards.length) {
            setDone(true);
        } else {
            setIndex(i => i + 1);
            setFlipped(false);
        }
    };

    if (done) {
        return (
            <div className="quiz-summary">
                <div className="summary-score">
                    <span className="score-big">🎉</span>
                    <span className="score-pct">Powtórka ukończona!</span>
                </div>
                <p className="empty-text">Przerobiłeś {dueCards.length} {dueCards.length === 1 ? 'fiszkę' : 'fiszek'}.</p>
                <div className="form-actions">
                    <button className="btn-primary" onClick={onClose}>Zamknij</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flashcard-review">
            <div className="quiz-progress">
                <span>{index + 1} / {dueCards.length}</span>
            </div>
            <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${(index / dueCards.length) * 100}%` }} />
            </div>

            <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
                <div className="flashcard-inner">
                    <div className="flashcard-front">
                        <span className="flashcard-label">Pytanie</span>
                        <p>{card.front}</p>
                    </div>
                    <div className="flashcard-back">
                        <span className="flashcard-label">Odpowiedź</span>
                        <p>{card.back}</p>
                    </div>
                </div>
                {!flipped && <span className="flashcard-hint">Kliknij, aby odsłonić</span>}
            </div>

            {flipped && (
                <div className="rating-buttons">
                    <p className="rating-label">Jak Ci poszło?</p>
                    <div className="rating-row">
                        <button className="rating-btn rating-bad" onClick={() => rate(1)}>😰 Nie pamiętam</button>
                        <button className="rating-btn rating-ok" onClick={() => rate(3)}>🙂 Jakoś</button>
                        <button className="rating-btn rating-good" onClick={() => rate(5)}>🎯 Doskonale</button>
                    </div>
                </div>
            )}

            <div className="form-actions">
                <button className="btn-secondary" onClick={onClose}>Przerwij</button>
            </div>
        </div>
    );
}