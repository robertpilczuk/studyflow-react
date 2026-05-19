import { createContext, useContext } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useQuizzes, useResults } from '../hooks/useQuizzes';
import { useFlashcards } from '../hooks/useFlashcards';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const notes = useNotes();
  const quizzes = useQuizzes();
  const results = useResults();
  const flashcards = useFlashcards();

  return (
    <AppContext.Provider value={{ notes, quizzes, results, flashcards }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}