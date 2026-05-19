import { useState } from 'react';
import { useQuizzes } from '../hooks/useQuizzes';
import { useGemini } from '../hooks/useGemini';
import { useConfirm } from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import QuizEditor from '../components/quizzes/QuizEditor';
import QuizPlayer from '../components/quizzes/QuizPlayer';

export default function Quizzes() {
    const { quizzes, loading, addQuiz, updateQuiz, deleteQuiz, saveResult } = useQuizzes();
    const { generateQuiz } = useGemini();
    const confirm = useConfirm();
    const [modalMode, setModalMode] = useState(null); // null | 'new' | 'edit' | 'play' | 'generate'
    const [selected, setSelected] = useState(null);
    const [genTopic, setGenTopic] = useState('');
    const [genCount, setGenCount] = useState(5);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');

    const closeModal = () => { setModalMode(null); setSelected(null); setGenError(''); };

    const handleSave = async (data) => {
        if (selected) await updateQuiz(selected.id, data);
        else await addQuiz(data);
        closeModal();
    };

    const handleDelete = async (id) => {
        const ok = await confirm('Usunąć ten quiz?', { confirmLabel: 'Usuń' });
        if (ok) await deleteQuiz(id);
    };

    const handleGenerate = async () => {
        if (!genTopic.trim()) return;
        setGenerating(true);
        setGenError('');
        try {
            const questions = await generateQuiz(genTopic, genCount);
            await addQuiz({ title: `Quiz: ${genTopic}`, questions });
            closeModal();
        } catch (e) {
            setGenError(e.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleFinish = async (score, total, review) => {
        if (selected) await saveResult(selected.id, score, total);
        closeModal();
    };

    const copyShareLink = (id) => {
        const url = `${window.location.origin}/quiz?quiz=${id}`;
        navigator.clipboard.writeText(url);
        alert('Link skopiowany!');
    };

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Quizy</h1>
                    <p className="page-subtitle">{quizzes.length} quizów</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setModalMode('generate')}>✨ Generuj AI</button>
                    <button className="btn-primary" onClick={() => setModalMode('new')}>+ Nowy quiz</button>
                </div>
            </header>

            {loading ? (
                <div className="loading-state">Ładowanie...</div>
            ) : quizzes.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🧠</span>
                    <p>Brak quizów. Stwórz własny lub wygeneruj za pomocą AI.</p>
                </div>
            ) : (
                <div className="quiz-grid">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="quiz-card">
                            <div className="quiz-card-header">
                                <h3 className="quiz-card-title">{quiz.title || 'Bez tytułu'}</h3>
                                {quiz.public && <span className="tag tag-success">Publiczny</span>}
                            </div>
                            <p className="quiz-card-meta">{quiz.questions?.length || 0} pytań</p>
                            <div className="quiz-card-actions">
                                <button
                                    className="btn-primary btn-sm"
                                    onClick={() => { setSelected(quiz); setModalMode('play'); }}
                                >▶ Start</button>
                                <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => { setSelected(quiz); setModalMode('edit'); }}
                                >✏ Edytuj</button>
                                <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => copyShareLink(quiz.id)}
                                    title="Kopiuj link"
                                >🔗</button>
                                <button
                                    className="icon-btn danger btn-sm"
                                    onClick={() => handleDelete(quiz.id)}
                                >✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New / Edit quiz */}
            <Modal
                isOpen={modalMode === 'new' || modalMode === 'edit'}
                onClose={closeModal}
                title={modalMode === 'edit' ? 'Edytuj quiz' : 'Nowy quiz'}
            >
                <QuizEditor initial={selected} onSave={handleSave} onCancel={closeModal} />
            </Modal>

            {/* Play quiz */}
            <Modal isOpen={modalMode === 'play'} onClose={closeModal} title={selected?.title || 'Quiz'}>
                {selected && (
                    <QuizPlayer quiz={selected} onFinish={handleFinish} onClose={closeModal} />
                )}
            </Modal>

            {/* Generate with AI */}
            <Modal isOpen={modalMode === 'generate'} onClose={closeModal} title="Generuj quiz z AI">
                <div className="editor-form">
                    <div className="form-group">
                        <label className="form-label">Temat</label>
                        <input
                            className="form-input"
                            value={genTopic}
                            onChange={e => setGenTopic(e.target.value)}
                            placeholder="np. Fotosynteza, React hooks, II Wojna Światowa..."
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Liczba pytań: {genCount}</label>
                        <input
                            type="range" min={3} max={15} value={genCount}
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