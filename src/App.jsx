import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Quizzes from './pages/Quizzes';
import Flashcards from './pages/Flashcards';
import Analytics from './pages/Analytics';
import PublicQuiz from './pages/PublicQuiz';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ConfirmProvider>
          <AppProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/quiz" element={<PublicQuiz />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/notes" element={
                <ProtectedRoute>
                  <Layout>
                    <Notes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/quizzes" element={
                <ProtectedRoute>
                  <Layout>
                    <Quizzes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/flashcards" element={
                <ProtectedRoute>
                  <Layout>
                    <Flashcards />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </AppProvider>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}