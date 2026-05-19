import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loadRemoteConfig } from '../firebase/config'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [rcConfig, setRcConfig] = useState({
    max_notes_per_user: 50,
    max_questions_per_quiz: 20,
    quizzes_enabled: true,
    app_theme: 'dark',
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadRemoteConfig().then(setRcConfig)
  }, [])

  const showToast = useCallback((message, type = '') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <AppContext.Provider value={{ rcConfig, toast, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
