import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LayoutDashboard, UserCheck, Users as UsersIcon, PackageSearch, FileText } from 'lucide-react'

import { OverviewTab } from '../components/admin/OverviewTab'
import { ApprovalsTab } from '../components/admin/ApprovalsTab'
import { UsersTab } from '../components/admin/UsersTab'
import { ItemsTab } from '../components/admin/ItemsTab'
import { ClaimsTab } from '../components/admin/ClaimsTab'

type TabType = 'overview' | 'approvals' | 'users' | 'items' | 'claims'

export function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white px-4 py-3 border-b border-slate-100 pt-safe">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Portal</h1>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"
          >
            <span>Exit Portal</span>
            <ExternalLink size={14} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <LayoutDashboard size={16} />
            Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'approvals' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <UserCheck size={16} />
            Approvals
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'users' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <UsersIcon size={16} />
            Users
          </button>

          <button 
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'items' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <PackageSearch size={16} />
            Items
          </button>

          <button 
            onClick={() => setActiveTab('claims')}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'claims' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <FileText size={16} />
            Claims
          </button>
        </div>
      </header>

      <div className="p-4 flex-1">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'approvals' && <ApprovalsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'items' && <ItemsTab />}
        {activeTab === 'claims' && <ClaimsTab />}
      </div>
    </div>
  )
}
