import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  const isDev = window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost'

  if (!user) return <Navigate to="/auth" replace />
  if (!user.emailVerified && !isDev) return <Navigate to="/auth?verify=1" replace />

  return children
}