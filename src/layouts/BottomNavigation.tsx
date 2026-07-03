import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Search, User, LogIn, MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'

export function BottomNavigation() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleProfileTap = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      navigate('/login')
    }
  }

    const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/report', icon: PlusCircle, label: 'Report' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe">
      <div className="flex items-center justify-around px-4 h-16 max-w-md mx-auto relative">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={item.label === 'Profile' ? handleProfileTap : undefined}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-200',
                isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(isActive && "drop-shadow-sm")}
                />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "opacity-100" : "opacity-80"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
