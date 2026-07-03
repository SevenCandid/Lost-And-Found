import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-slate-900 pb-24 md:pb-0">
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-slate-200/50 sm:border-x border-slate-100 relative">
        <Outlet />
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
