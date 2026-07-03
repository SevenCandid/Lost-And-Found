import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PackageSearch, LogIn, User as UserIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function TopHeader() {
  const navigate = useNavigate()
  const { profile, isLoading: loading } = useAuth()


  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm shadow-primary-500/20 group-hover:scale-105 transition-transform">
          <PackageSearch size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-slate-900">
          Lost & Found
        </span>
      </Link>

      {!loading && (
        profile ? (
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 overflow-hidden hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={16} className="text-slate-500" />
            )}
          </button>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors"
          >
            <LogIn size={14} />
            Log in
          </Link>
        )
      )}
    </header>
  )
}
