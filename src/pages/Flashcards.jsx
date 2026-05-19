import { useState } from 'react';
import { useFlashcards } from '../hooks/useFlashcards';
import { useGemini } from '../hooks/useGemini';
import { useConfirm } from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import DeckEditor from '../components/flashcards/DeckEditor';
import FlashcardReview from '../components/flashcards/FlashcardReview';

export default function Flashcards() {
    const { decks, loading, addDeck, updateDeck, deleteDeck, reviewCard, getDueCards } = useFlashcards();
    const { generateFlashcards } = useGemini();
    const confirm = useConfirm();
    const [modalMode, setModalMode] = useState(null);
    const [selected, setSelected] = useState(null);
    const [genTopic, setGenTopic] = useState('');
    const [genCount, setGenCount] = useState(10);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');

    const closeModal = () => { setModalMode(null); setSelected(null); setGenError(''); };

    const handleSaveDeck = async (data) => {
        if (selected) await updateDeck(selected.id, data);
        else await addDeck(data);
        closeModal();
    };

    const handleDelete = async (id) => {
        const ok = await confirm('Usunąć tę talię?', { confirmLabel: 'Usuń' });
        if (ok) await deleteDeck(id);
    };

    const handleGenerate = async () => {
        if (!genTopic.trim()) return;
        setGenerating(true);
        setGenError('');
        try {
            const cards = await generateFlashcards(genTopic, genCount);
            await addDeck({ title: `Fiszki: ${genTopic}`, cards });
            closeModal();
        } catch (e) {
            setGenError(e.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleReview = async (deckId, cardIndex, quality) => {
        const deck = decks.find(d => d.id === deckId);
        if (deck) await reviewCard(deckId, cardIndex, quality, deck);
    };

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Fiszki</h1>
                    <p className="page-subtitle">{decks.length} talii</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setModalMode('generate')}>✨ Generuj AI</button>
                    <button className="btn-primary" onClick={() => setModalMode('new')}>+ Nowa talia</button>
                </div>
            </header>

            {loading ? (
                <div className="loading-state">Ładowanie...</div>
            ) : decks.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🃏</span>
                    <p>Brak talii fiszek.</p>
                </div>
            ) : (
                <div className="quiz-grid">
                    {decks.map(deck => {
                        const due = getDueCards(deck).length;
                        const total = deck.cards?.length || 0;
                        return (
                            <div key={deck.id} className="quiz-card">
                                <div className="quiz-card-header">
                                    <h3 className="quiz-card-title">{deck.title || 'Bez nazwy'}</h3>
                                    {due > 0 && <span className="tag tag-warning">{due} do powtórki</span>}
                                </div>
                                <p className="quiz-card-meta">{total} fiszek</p>
                                <div className="quiz-card-actions">
                                    {due > 0 && (
                                        <button
                                            className="btn-primary btn-sm"
                                            onClick={() => { setSelected(deck); setModalMode('review'); }}
                                        >▶ Ucz się</button>
                                    )}
                                    <button
                                        className="btn-secondary btn-sm"
                                        onClick={() => { setSelected(deck); setModalMode('edit'); }}
                                    >✏ Edytuj</button>
                                    <button className="icon-btn danger" onClick={() => handleDelete(deck.id)}>✕</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={modalMode === 'new' || modalMode === 'edit'}
                onClose={closeModal}
                title={modalMode === 'edit' ? 'Edytuj talię' : 'Nowa talia'}
            >
                <DeckEditor initial={selected} onSave={handleSaveDeck} onCancel={closeModal} />
            </Modal>

            <Modal isOpen={modalMode === 'review'} onClose={closeModal} title={selected?.title || 'Powtórka'}>
                {selected && (
                    <FlashcardReview
                        deck={selected}
                        dueCards={getDueCards(selected)}
                        onReview={(cardIndex, quality) => handleReview(selected.id, cardIndex, quality)}
                        onClose={closeModal}
                    />
                )}
            </Modal>

            <Modal isOpen={modalMode === 'generate'} onClose={closeModal} title="Generuj fiszki z AI">
                <div className="editor-form">
                    <div className="form-group">
                        <label className="form-label">Temat</label>
                        <input
                            className="form-input"
                            value={genTopic}
                            onChange={e => setGenTopic(e.target.value)}
                            placeholder="np. Stolice Europy, Wzory matematyczne..."
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Liczba fiszek: {genCount}</label>
                        <input
                            type="range" min={5} max={20} value={genCount}
                            onChange={e => setGenCount(Number(e.target.value))}
                            className="form-range"
                        />
                    </div>
                    {genError && <p className="error-text">{genError}</p>}
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={closeModal}>Anuluj</button>
                        <button
                            className="btn-primary"
                            onClick={handleGenerate}
                            disabled={generating || !genTopic.trim()}
                        >
                            {generating ? '⏳ Generowanie...' : '✨ Generuj'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}