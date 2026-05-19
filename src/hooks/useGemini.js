import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DAILY_LIMIT = 20;

async function getUsage(uid, type) {
    const snap = await getDoc(doc(db, 'users', uid));
    const data = snap.data() || {};
    const today = new Date().toDateString();
    if (data.usageDate !== today) return 0;
    return type === 'quiz' ? (data.quizUsage || 0) : (data.flashcardUsage || 0);
}

async function incrementUsage(uid, type) {
    const snap = await getDoc(doc(db, 'users', uid));
    const data = snap.data() || {};
    const today = new Date().toDateString();
    const field = type === 'quiz' ? 'quizUsage' : 'flashcardUsage';
    if (data.usageDate !== today) {
        await updateDoc(doc(db, 'users', uid), { usageDate: today, quizUsage: 0, flashcardUsage: 0 });
    }
    await updateDoc(doc(db, 'users', uid), { [field]: increment(1) });
}

async function callGemini(prompt) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
    );
    if (!res.ok) throw new Error('Gemini API error');
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export function useGemini() {
    const { user } = useAuth();

    const generateQuiz = useCallback(async (topic, count = 5) => {
        const usage = await getUsage(user.uid, 'quiz');
        if (usage >= DAILY_LIMIT) throw new Error('Dzienny limit quizów wyczerpany (20/dzień)');
        const prompt = `Wygeneruj ${count} pytań quizowych na temat: "${topic}".
Odpowiedź tylko w JSON (tablica), format każdego elementu:
{"question": "...", "options": ["A","B","C","D"], "correct": 0}
"correct" to indeks poprawnej odpowiedzi (0-3). Bez żadnego tekstu poza JSON.`;
        const raw = await callGemini(prompt);
        const clean = raw.replace(/```json|```/g, '').trim();
        const questions = JSON.parse(clean);
        await incrementUsage(user.uid, 'quiz');
        return questions;
    }, [user]);

    const generateFlashcards = useCallback(async (topic, count = 10) => {
        const usage = await getUsage(user.uid, 'flashcard');
        if (usage >= DAILY_LIMIT) throw new Error('Dzienny limit fiszek wyczerpany (20/dzień)');
        const prompt = `Wygeneruj ${count} fiszek edukacyjnych na temat: "${topic}".
Odpowiedź tylko w JSON (tablica), format każdego elementu:
{"front": "pytanie/pojęcie", "back": "odpowiedź/definicja"}
Bez żadnego tekstu poza JSON.`;
        const raw = await callGemini(prompt);
        const clean = raw.replace(/```json|```/g, '').trim();
        const cards = JSON.parse(clean);
        await incrementUsage(user.uid, 'flashcard');
        return cards;
    }, [user]);

    return { generateQuiz, generateFlashcards };
}