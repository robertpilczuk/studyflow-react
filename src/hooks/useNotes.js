import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    collection, query, where, orderBy, onSnapshot,
    addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export function useNotes() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'notes'),
            where('uid', '==', user.uid),
            orderBy('updatedAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, [user]);

    const addNote = useCallback(async (data) => {
        return addDoc(collection(db, 'notes'), {
            ...data,
            uid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }, [user]);

    const updateNote = useCallback(async (id, data) => {
        return updateDoc(doc(db, 'notes', id), { ...data, updatedAt: serverTimestamp() });
    }, []);

    const deleteNote = useCallback(async (id) => {
        return deleteDoc(doc(db, 'notes', id));
    }, []);

    return { notes, loading, addNote, updateNote, deleteNote };
}