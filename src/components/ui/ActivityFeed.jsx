import { useActivityFeed } from '../../hooks/useActivityFeed';

const ICONS = {
    note_add: '📝',
    note_edit: '✏️',
    quiz_complete: '🧠',
    flashcard_review: '🃏',
    deck_add: '➕',
    ai_quiz: '✨',
    ai_flashcard: '✨',
};

function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'przed chwilą';
    if (m < 60) return `${m} min temu`;
    if (h < 24) return `${h} godz. temu`;
    return `${d} dni temu`;
}

export default function ActivityFeed() {
    const { feed } = useActivityFeed();
    if (feed.length === 0) return null;

    return (
        <section className="card">
            <h2 className="card-title">Ostatnia aktywność</h2>
            <ul className="item-list">
                {feed.slice(0, 8).map(item => (
                    <li key={item.id} className="item-row">
                        <span className="item-icon">{ICONS[item.type] || '📌'}</span>
                        <span className="item-title">{item.label}</span>
                        <span className="item-date">{timeAgo(item.timestamp)}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}