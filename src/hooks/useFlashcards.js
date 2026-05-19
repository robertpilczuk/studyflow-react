import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    collection, query, where, orderBy, onSnapshot,
    addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Simple SM-2 spaced repetition
function sm2(card, quality) {
    // quality 0-5; 0-1 = wrong, 2-5 = correct
    let { interval = 1, repetitions = 0, easiness = 2.5, nextReview } = card;
    if (quality >= 3) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easiness);
        repetitions += 1;
        easiness = Math.max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
        interval = 1;
        repetitions = 0;
    }
    const next = new Date();
    next.setDate(next.getDate() + interval);
    return { interval, repetitions, easiness, nextReview: next.toISOString() };
}

export function useFlashcards() {
    const { user } = useAuth();
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'decks'),
            where('uid', '==', user.uid),
            orderBy('updatedAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setDecks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, [user]);

    const addDeck = useCallback(async (data) => {
        return addDoc(collection(db, 'decks'), {
            ...data,
            uid: user.uid,
            cards: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }, [user]);

    const updateDeck = useCallback(async (id, data) => {
        return updateDoc(doc(db, 'decks', id), { ...data, updatedAt: serverTimestamp() });
    }, []);

    const deleteDeck = useCallback(async (id) => {
        return deleteDoc(doc(db, 'decks', id));
    }, []);

    const reviewCard = useCallback(async (deckId, cardIndex, quality, deck) => {
        const cards = [...(deck.cards || [])];
        const srData = sm2(cards[cardIndex], quality);
        cards[cardIndex] = { ...cards[cardIndex], ...srData };
        return updateDoc(doc(db, 'decks', deckId), { cards, updatedAt: serverTimestamp() });
    }, []);

    const getDueCards = useCallback((deck) => {
        const now = new Date().toISOString();
        return (deck.cards || []).filter(c => !c.nextReview || c.nextReview <= now);
    }, []);

    return { decks, loading, addDeck, updateDeck, deleteDeck, reviewCard, getDueCards };
}