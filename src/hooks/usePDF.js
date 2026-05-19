import { useCallback } from 'react';

export function usePDF() {
    const exportNote = useCallback(async (note) => {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.es.min.js');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - margin * 2;
        let y = margin;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(note.title || 'Notatka', margin, y);
        y += 10;

        // Meta
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(120);
        const date = note.updatedAt?.toDate?.()?.toLocaleDateString('pl-PL') || '';
        const meta = [note.category, date].filter(Boolean).join(' · ');
        if (meta) { doc.text(meta, margin, y); y += 6; }

        if (note.tags?.length) {
            doc.text(`Tagi: ${note.tags.join(', ')}`, margin, y);
            y += 6;
        }

        // Divider
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Content
        doc.setTextColor(30);
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(note.content || '', maxWidth);
        lines.forEach(line => {
            if (y > 270) { doc.addPage(); y = margin; }
            doc.text(line, margin, y);
            y += 6;
        });

        doc.save(`${note.title || 'notatka'}.pdf`);
    }, []);

    const exportAllNotes = useCallback(async (notes) => {
        const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.es.min.js');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - margin * 2;

        notes.forEach((note, index) => {
            if (index > 0) doc.addPage();
            let y = margin;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(30);
            doc.text(note.title || 'Notatka', margin, y);
            y += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(120);
            const date = note.updatedAt?.toDate?.()?.toLocaleDateString('pl-PL') || '';
            const meta = [note.category, date].filter(Boolean).join(' · ');
            if (meta) { doc.text(meta, margin, y); y += 6; }

            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            doc.setTextColor(30);
            doc.setFontSize(12);
            const lines = doc.splitTextToSize(note.content || '', maxWidth);
            lines.forEach(line => {
                if (y > 270) { doc.addPage(); y = margin; }
                doc.text(line, margin, y);
                y += 6;
            });
        });

        doc.save('notatki-studyflow.pdf');
    }, []);

    return { exportNote, exportAllNotes };
}