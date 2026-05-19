import { useState } from 'react';
import Modal from '../ui/Modal';
import { usePDF } from '../../hooks/usePDF';

export default function ExportPDFModal({ isOpen, onClose, notes }) {
    const { exportNotes } = usePDF();
    const [selected, setSelected] = useState(() => new Set(notes.map(n => n.id)));

    const toggle = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === notes.length) setSelected(new Set());
        else setSelected(new Set(notes.map(n => n.id)));
    };

    const handleExport = () => {
        const toExport = notes.filter(n => selected.has(n.id));
        exportNotes(toExport);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eksportuj notatki do PDF">
            <div className="editor-form">
                <div className="export-select-all">
                    <label className="form-checkbox">
                        <input
                            type="checkbox"
                            checked={selected.size === notes.length}
                            onChange={toggleAll}
                        />
                        Zaznacz wszystkie ({notes.length})
                    </label>
                </div>

                <div className="export-notes-list">
                    {notes.map(note => (
                        <label key={note.id} className="export-note-item">
                            <input
                                type="checkbox"
                                checked={selected.has(note.id)}
                                onChange={() => toggle(note.id)}
                            />
                            <div className="export-note-info">
                                <span className="export-note-title">{note.title || 'Bez tytułu'}</span>
                                {note.category && <span className="tag">{note.category}</span>}
                            </div>
                        </label>
                    ))}
                </div>

                <div className="form-actions">
                    <button className="btn-secondary" onClick={onClose}>Anuluj</button>
                    <button
                        className="btn-primary"
                        onClick={handleExport}
                        disabled={selected.size === 0}
                    >
                        📄 Pobierz PDF ({selected.size})
                    </button>
                </div>
            </div>
        </Modal>
    );
}