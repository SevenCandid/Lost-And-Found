import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface InfoPageLayoutProps {
  title: string
  children: ReactNode
}

export function InfoPageLayout({ title, children }: InfoPageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-surface transition-colors pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center pt-safe transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors active:scale-95" 
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">{title}</h1>
      </header>

      <div className="p-6 text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
