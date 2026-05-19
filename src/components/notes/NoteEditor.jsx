import { useState } from 'react';

export default function NoteEditor({ initial, categories, onSave, onCancel }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [content, setContent] = useState(initial?.content || '');
    const [category, setCategory] = useState(initial?.category || '');
    const [newCat, setNewCat] = useState('');
    const [tags, setTags] = useState((initial?.tags || []).join(', '));
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const finalCat = newCat.trim() || category;
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
        await onSave({ title, content, category: finalCat, tags: tagList });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
                <label className="form-label">Tytuł</label>
                <input
                    className="form-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Tytuł notatki"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Treść</label>
                <textarea
                    className="form-textarea"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Zapisz swoje notatki..."
                    rows={8}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Kategoria</label>
                    <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Brak</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Nowa kategoria</label>
                    <input
                        className="form-input"
                        value={newCat}
                        onChange={e => setNewCat(e.target.value)}
                        placeholder="Lub wpisz nową..."
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Tagi (oddzielone przecinkami)</label>
                <input
                    className="form-input"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="programowanie, react, hooks"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>Anuluj</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
            </div>
        </form>
    );
}