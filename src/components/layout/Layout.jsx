import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useApp } from '../../context/AppContext'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useApp()

  // Close sidebar on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-60"
           style={{ zIndex: 100 }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden"
             style={{ background: 'rgba(0,0,0,0.6)' }}
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-60 z-50 md:hidden transition-transform duration-250 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 p-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1.5 w-9 h-9 items-center justify-center rounded-md"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
            <span className="block w-4 h-0.5" style={{ background: 'var(--text-2)' }} />
            <span className="block w-4 h-0.5" style={{ background: 'var(--text-2)' }} />
            <span className="block w-4 h-0.5" style={{ background: 'var(--text-2)' }} />
          </button>
          <span className="text-sm font-semibold" style={{ fontFamily: 'Plus Jakarta Sans' }}>StudyFlow</span>
        </div>

        <div className="p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav mobile */}
      <BottomNav />

      {/* Toast */}
      {toast && (
        <div key={toast.id}
          className="fixed bottom-24 md:bottom-6 right-4 md:right-6 px-4 py-3 rounded-lg text-sm z-50 animate-slide-up max-w-xs"
          style={{
            background: 'var(--bg-3)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.4)' : toast.type === 'error' ? 'rgba(251,113,133,0.4)' : 'var(--border-mid)'}`,
            color: toast.type === 'success' ? 'var(--green)' : toast.type === 'error' ? 'var(--coral)' : 'var(--text)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
