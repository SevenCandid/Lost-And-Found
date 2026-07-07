import { ReactNode } from 'react'
import { DesktopSidebar } from '../components/desktop/DesktopSidebar'
import { DesktopRightPanel } from '../components/desktop/DesktopRightPanel'

export function DesktopLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors">
      <div className="flex w-full max-w-5xl justify-center relative">
        
        {/* Left Sidebar (Desktop only) */}
        <div className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
          <DesktopSidebar />
        </div>

        {/* Main Content (The Mobile App) */}
        <div className="w-full max-w-md min-h-screen bg-background shadow-2xl shadow-slate-200/50 dark:shadow-none sm:border-x border-slate-100 dark:border-slate-800 flex-shrink-0 z-20 flex flex-col relative overflow-x-hidden">
          {children}
        </div>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden xl:block w-80 shrink-0 h-screen sticky top-0">
           <DesktopRightPanel />
        </div>
        
      </div>
    </div>
  )
}
