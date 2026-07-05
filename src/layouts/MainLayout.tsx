import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'
import { TopHeader } from '../components/TopHeader'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-slate-900 dark:text-slate-100 pb-24 md:pb-0 flex justify-center transition-colors">
      <main className="w-full max-w-md min-h-screen bg-surface shadow-xl shadow-slate-200/50 dark:shadow-none sm:border-x border-slate-100 dark:border-slate-800 relative flex flex-col transition-colors">
        <TopHeader />
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
      
      {/* Show bottom nav only on mobile/small screens for this app, but since it's mobile-first, we'll keep it max-w-md */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
      
      {/* For desktop, we still show the bottom nav within the max-w-md container */}
      <div className="hidden md:block fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
        <BottomNavigation />
      </div>
    </div>
  )
}
