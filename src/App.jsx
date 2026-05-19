import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LoadingScreen from './components/shared/LoadingScreen'
import Auth from './pages/Auth'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Quizzes from './pages/Quizzes'
import Flashcards from './pages/Flashcards'
import Analytics from './pages/Analytics'
import PublicQuiz from './pages/PublicQuiz'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/quiz/:id" element={<PublicQuiz />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppProvider><Layout /></AppProvider>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"  element={<Dashboard />} />
              <Route path="/notes"      element={<Notes />} />
              <Route path="/quizzes"    element={<Quizzes />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/analytics"  element={<Analytics />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
