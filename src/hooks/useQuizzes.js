import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    collection, query, where, orderBy, onSnapshot,
    addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export function useQuizzes() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'quizzes'),
            where('uid', '==', user.uid),
            orderBy('updatedAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, [user]);

    const addQuiz = useCallback(async (data) => {
        return addDoc(collection(db, 'quizzes'), {
            ...data,
            uid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }, [user]);

    const updateQuiz = useCallback(async (id, data) => {
        return updateDoc(doc(db, 'quizzes', id), { ...data, updatedAt: serverTimestamp() });
    }, []);

    const deleteQuiz = useCallback(async (id) => {
        return deleteDoc(doc(db, 'quizzes', id));
    }, []);

    const getPublicQuiz = useCallback(async (id) => {
        const snap = await getDoc(doc(db, 'quizzes', id));
        if (!snap.exists() || !snap.data().public) return null;
        return { id: snap.id, ...snap.data() };
    }, []);

    // Save result
    const saveResult = useCallback(async (quizId, score, total) => {
        return addDoc(collection(db, 'results'), {
            uid: user.uid,
            quizId,
            score,
            total,
            percentage: Math.round((score / total) * 100),
            createdAt: serverTimestamp(),
        });
    }, [user]);

    return { quizzes, loading, addQuiz, updateQuiz, deleteQuiz, getPublicQuiz, saveResult };
}

export function useResults() {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'results'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, [user]);

    return { results, loading };
}