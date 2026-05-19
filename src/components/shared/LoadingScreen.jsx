export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6"
         style={{ background: 'var(--bg)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm text-white"
             style={{ background: 'var(--blue)', fontFamily: 'Plus Jakarta Sans' }}>
          SF
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--text)' }}>
          StudyFlow
        </span>
      </div>
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent"
           style={{ borderColor: 'var(--border-mid)', borderTopColor: 'var(--blue)',
                    animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
}
