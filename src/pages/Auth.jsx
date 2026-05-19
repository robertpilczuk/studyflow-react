import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail,
  updateProfile, GoogleAuthProvider, signInWithPopup,
  signOut
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, trackEvent } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/shared/LoadingScreen'

const ERRORS = {
  'auth/email-already-in-use': 'Ten e-mail jest już zajęty.',
  'auth/invalid-email': 'Nieprawidłowy format e-maila.',
  'auth/weak-password': 'Hasło musi mieć min. 6 znaków.',
  'auth/user-not-found': 'Nie znaleziono użytkownika.',
  'auth/wrong-password': 'Błędne hasło.',
  'auth/invalid-credential': 'Nieprawidłowe dane logowania.',
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold text-white"
           style={{ background: 'var(--blue)', fontFamily: 'Plus Jakarta Sans' }}>SF</div>
      <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>StudyFlow</span>
    </div>
  )
}

export default function Auth() {
  const [tab, setTab]     = useState('login')
  const [error, setError] = useState('')
  const [info, setInfo]   = useState('')
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const showVerify = params.get('verify') === '1'

  // Redirect if already logged in and verified
  if (authLoading) return <LoadingScreen />
  if (user?.emailVerified) { navigate('/dashboard'); return null }

  const err = (msg) => { setError(msg); setInfo('') }
  const inf = (msg) => { setInfo(msg); setError('') }

  async function handleRegister(e) {
    e.preventDefault()
    const name  = e.target.name.value.trim()
    const email = e.target.email.value.trim()
    const pass  = e.target.password.value
    if (!name || !email || !pass) return err('Uzupełnij wszystkie pola.')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass)
      await updateProfile(cred.user, { displayName: name })
      await sendEmailVerification(cred.user)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name, email, createdAt: serverTimestamp(),
        notesCount: 0, quizzesCount: 0, attempts: 0, totalScore: 0
      })
      trackEvent('sign_up', { method: 'email' })
      navigate('/auth?verify=1')
    } catch (e) { err(ERRORS[e.code] || e.message) }
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    const email = e.target.email.value.trim()
    const pass  = e.target.password.value
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      trackEvent('login', { method: 'email' })
      navigate('/dashboard')
    } catch (e) { err(ERRORS[e.code] || e.message) }
    setLoading(false)
  }

  async function handleGoogle() {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      const ref  = doc(db, 'users', cred.user.uid)
      if (!(await getDoc(ref)).exists()) {
        await setDoc(ref, { name: cred.user.displayName, email: cred.user.email,
          createdAt: serverTimestamp(), notesCount: 0, quizzesCount: 0, attempts: 0, totalScore: 0 })
      }
      trackEvent('login', { method: 'google' })
      navigate('/dashboard')
    } catch (e) { if (e.code !== 'auth/popup-closed-by-user') err(ERRORS[e.code] || e.message) }
  }

  async function handleReset(email) {
    if (!email) return err('Wpisz adres e-mail w polu powyżej.')
    try {
      await sendPasswordResetEmail(auth, email)
      inf('Link do resetowania hasła wysłany na ' + email)
    } catch (e) { err(ERRORS[e.code] || e.message) }
  }

  async function handleResend() {
    try {
      await sendEmailVerification(auth.currentUser)
      inf('E-mail weryfikacyjny wysłany ponownie!')
    } catch { err('Poczekaj chwilę przed ponownym wysłaniem.') }
  }

  async function handleCheckVerify() {
    await auth.currentUser.reload()
    if (auth.currentUser.emailVerified) navigate('/dashboard')
    else err('E-mail jeszcze nie potwierdzony.')
  }

  // Verification screen
  if (showVerify && user) {
    return (
      <div className="min-h-screen flex items-end md:items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm p-8 rounded-xl text-center" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-mid)' }}>
          <div className="text-5xl mb-4">📧</div>
          <Logo />
          <h2 className="text-lg font-bold mt-3 mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Potwierdź adres e-mail</h2>
          <p className="text-sm mb-1" style={{ color: 'var(--text-2)' }}>Wysłaliśmy link na:</p>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--blue)', fontFamily: 'JetBrains Mono' }}>{user.email}</p>
          {error && <p className="text-xs mb-3" style={{ color: 'var(--coral)' }}>{error}</p>}
          {info  && <p className="text-xs mb-3" style={{ color: 'var(--green)' }}>{info}</p>}
          <button onClick={handleCheckVerify} className="w-full py-2.5 rounded-md text-sm font-medium text-white mb-2 transition-opacity hover:opacity-80" style={{ background: 'var(--blue)' }}>
            Już potwierdziłem ✓
          </button>
          <button onClick={handleResend} className="w-full py-2.5 rounded-md text-sm transition-colors" style={{ border: '1px solid var(--border-mid)', color: 'var(--text-2)' }}>
            Wyślij ponownie
          </button>
          <button onClick={() => signOut(auth)} className="w-full mt-2 py-2 text-xs" style={{ color: 'var(--text-3)' }}>
            Wyloguj
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-end md:items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(79,142,247,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.05) 1px,transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-sm p-7 rounded-xl animate-fade-in"
           style={{ background: 'var(--bg-2)', border: '1px solid var(--border-mid)', boxShadow: '0 0 60px rgba(79,142,247,0.08)' }}>
        <Logo />
        <p className="text-xs mb-5 mt-0.5" style={{ color: 'var(--text-3)' }}>Twój asystent nauki i quizów</p>

        {/* Tab switcher */}
        <div className="flex gap-0 p-0.5 rounded-md mb-5" style={{ background: 'var(--bg-3)' }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setInfo('') }}
              className="flex-1 py-1.5 text-xs rounded-sm transition-all"
              style={{
                background: tab === t ? 'var(--bg-2)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-2)',
                border: tab === t ? '1px solid var(--border-mid)' : 'none',
              }}>
              {t === 'login' ? 'Logowanie' : 'Rejestracja'}
            </button>
          ))}
        </div>

        {/* Login form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <Field label="E-mail" name="email" type="email" placeholder="jan@kowalski.pl" />
            <Field label="Hasło" name="password" type="password" placeholder="••••••••" />
            <SubmitBtn loading={loading}>Zaloguj się</SubmitBtn>
            <button type="button" onClick={(e) => handleReset(e.target.closest('form').email.value)}
              className="text-xs text-center transition-colors hover:opacity-70"
              style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Nie pamiętasz hasła?
            </button>
            <Divider />
            <GoogleBtn onClick={handleGoogle} />
          </form>
        )}

        {/* Register form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <Field label="Imię i nazwisko" name="name" type="text" placeholder="Jan Kowalski" />
            <Field label="E-mail" name="email" type="email" placeholder="jan@kowalski.pl" />
            <Field label="Hasło" name="password" type="password" placeholder="min. 6 znaków" />
            <SubmitBtn loading={loading}>Utwórz konto</SubmitBtn>
            <Divider />
            <GoogleBtn onClick={handleGoogle} />
          </form>
        )}

        {error && <p className="mt-3 text-xs" style={{ color: 'var(--coral)' }}>{error}</p>}
        {info  && <p className="mt-3 text-xs" style={{ color: 'var(--green)' }}>{info}</p>}

        <div className="flex items-center gap-1.5 mt-4" style={{ color: 'var(--text-3)' }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--amber)' }} />
          <span className="text-xs" style={{ fontFamily: 'JetBrains Mono' }}>Firebase Authentication</span>
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, type, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-2)' }}>{label}</label>
      <input name={name} type={type} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
        style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 16 }}
        onFocus={e => e.target.style.borderColor = 'var(--blue)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </div>
  )
}

function SubmitBtn({ children, loading }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-85 mt-1"
      style={{ background: 'var(--blue)', opacity: loading ? 0.6 : 1 }}>
      {loading ? '...' : children}
    </button>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-xs" style={{ color: 'var(--text-3)' }}>lub</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

function GoogleBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-md text-sm transition-colors"
      style={{ background: 'var(--bg-3)', border: '1px solid var(--border-mid)', color: 'var(--text)' }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-4)'}
      onMouseOut={e => e.currentTarget.style.background = 'var(--bg-3)'}>
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Zaloguj się przez Google
    </button>
  )
}
