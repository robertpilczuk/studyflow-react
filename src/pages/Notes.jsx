import { useState, useMemo } from 'react';
import { useNotes } from '../hooks/useNotes';
import Modal from '../components/ui/Modal';
import NoteEditor from '../components/notes/NoteEditor';
import ExportPDFModal from '../components/notes/ExportPDFModal';

export default function Notes() {
    const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [sort, setSort] = useState('updatedAt');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);

    const categories = useMemo(() => [...new Set(notes.map(n => n.category).filter(Boolean))], [notes]);

    const filtered = useMemo(() => {
        let list = notes;
        if (search) list = list.filter(n =>
            n.title?.toLowerCase().includes(search.toLowerCase()) ||
            n.content?.toLowerCase().includes(search.toLowerCase())
        );
        if (filterCat) list = list.filter(n => n.category === filterCat);
        if (sort === 'title') list = [...list].sort((a, b) => a.title?.localeCompare(b.title));
        return list;
    }, [notes, search, filterCat, sort]);

    const openNew = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (note) => { setEditing(note); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSave = async (data) => {
        if (editing) await updateNote(editing.id, data);
        else await addNote(data);
        closeModal();
    };

    const handleDelete = async (id) => {
        if (confirm('Usunąć tę notatkę?')) await deleteNote(id);
    };

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Notatki</h1>
                    <p className="page-subtitle">{notes.length} notatek</p>
                </div>
                <div className="header-actions">
                    {notes.length > 0 && (
                        <button className="btn-secondary" onClick={() => setExportOpen(true)}>
                            📄 Eksportuj PDF
                        </button>
                    )}
                    <button className="btn-primary" onClick={openNew}>+ Nowa notatka</button>
                </div>
            </header>

            <div className="toolbar">
                <input
                    className="search-input"
                    placeholder="Szukaj notatek..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">Wszystkie kategorie</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="updatedAt">Ostatnio edytowane</option>
                    <option value="title">Alfabetycznie</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state">Ładowanie...</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📝</span>
                    <p>Brak notatek{search || filterCat ? ' pasujących do filtrów' : ''}.</p>
                    {!search && !filterCat && <button className="btn-primary" onClick={openNew}>Dodaj pierwszą</button>}
                </div>
            ) : (
                <div className="notes-grid">
                    {filtered.map(note => (
                        <div key={note.id} className="note-card" onClick={() => openEdit(note)}>
                            <div className="note-card-header">
                                <h3 className="note-card-title">{note.title || 'Bez tytułu'}</h3>
                                <div className="note-card-btns">
                                    <button
                                        className="icon-btn danger"
                                        onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                                        title="Usuń"
                                    >✕</button>
                                </div>
                            </div>
                            <p className="note-card-preview">{note.content?.slice(0, 120) || '—'}</p>
                            <div className="note-card-footer">
                                {note.category && <span className="tag">{note.category}</span>}
                                {note.tags?.map(t => <span key={t} className="tag tag-secondary">{t}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edytuj notatkę' : 'Nowa notatka'}>
                <NoteEditor
                    initial={editing}
                    categories={categories}
                    onSave={handleSave}
                    onCancel={closeModal}
                />
            </Modal>

            <ExportPDFModal
                isOpen={exportOpen}
                onClose={() => setExportOpen(false)}
                notes={notes}
            />
        </div>
    );
}