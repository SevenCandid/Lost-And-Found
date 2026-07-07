import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'
import { TopHeader } from '../components/TopHeader'

export function MainLayout() {
  return (
    <div className="w-full min-h-screen bg-surface flex flex-col transition-colors pb-24 lg:pb-0 relative">
      <TopHeader />
      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
      
      {/* Bottom navigation only shown on mobile/tablet */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
