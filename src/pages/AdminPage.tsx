import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UserCheck, Users as UsersIcon, PackageSearch,
  FileText, LogOut, ExternalLink, Menu, X, ShieldCheck
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'

import { OverviewTab } from '../components/admin/OverviewTab'
import { ApprovalsTab } from '../components/admin/ApprovalsTab'
import { UsersTab } from '../components/admin/UsersTab'
import { ItemsTab } from '../components/admin/ItemsTab'
import { ClaimsTab } from '../components/admin/ClaimsTab'

type TabType = 'overview' | 'approvals' | 'users' | 'items' | 'claims'

const navItems = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'approvals',  label: 'Approvals',  icon: UserCheck },
  { id: 'users',      label: 'Users',      icon: UsersIcon },
  { id: 'items',      label: 'Items',      icon: PackageSearch },
  { id: 'claims',     label: 'Claims',     icon: FileText },
] as const

export function AdminPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Admin Portal</p>
            <p className="text-slate-400 text-xs">UENR Lost & Found</p>
          </div>
        </div>
      </div>

      {/* Admin info */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {profile?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-slate-400 text-xs capitalize">{profile?.role || 'admin'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={18} className={isActive ? 'text-primary-400' : ''} />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <ExternalLink size={18} />
          Exit to App
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar (slide-in) ── */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 flex flex-col md:hidden transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 transition-colors">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">Admin Portal</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Desktop page header */}
        <div className="hidden md:flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize transition-colors">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 transition-colors">
              Manage your Lost & Found portal
            </p>
          </div>
        </div>

        {/* Tab content */}
        <main className="flex-1 p-4 md:p-8">
          {activeTab === 'overview'  && <OverviewTab />}
          {activeTab === 'approvals' && <ApprovalsTab />}
          {activeTab === 'users'     && <UsersTab />}
          {activeTab === 'items'     && <ItemsTab />}
          {activeTab === 'claims'    && <ClaimsTab />}
        </main>
      </div>
    </div>
  )
}
