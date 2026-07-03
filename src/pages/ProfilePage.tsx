import { useNavigate } from 'react-router-dom'
import { PoweredBy } from '../components/ui/PoweredBy'
import { Settings, LogOut, ShieldAlert, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, isAdmin, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const initials = profile?.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Profile</h1>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 -mr-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-4 shadow-soft">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{profile?.full_name ?? 'Loading…'}</h2>
            <p className="text-slate-500 text-sm truncate">
              {profile?.department} · Level {profile?.level}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{profile?.index_number}</p>
          </div>
        </div>

        {/* Verification Badge */}
        {profile && (
          <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${
            profile.verification_status === 'verified'
              ? 'bg-emerald-50 text-emerald-700'
              : profile.verification_status === 'pending'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700'
          }`}>
            <User size={18} />
            <div>
              <p className="text-sm font-semibold capitalize">{profile.verification_status}</p>
              <p className="text-xs opacity-70">
                {profile.verification_status === 'verified'
                  ? 'You can report and claim items'
                  : profile.verification_status === 'pending'
                  ? 'Awaiting admin review'
                  : `Rejected: ${profile.rejection_reason ?? 'Re-submit your ID'}`}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-full">
          <button className="flex-1 py-2 rounded-full text-sm font-semibold bg-white text-slate-800 shadow-sm">
            My Reports
          </button>
          <button className="flex-1 py-2 rounded-full text-sm font-semibold text-slate-500">
            My Claims
          </button>
        </div>

        <EmptyState
          title="No items reported yet"
          description="When you report a lost or found item, it will appear here."
        />

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/admin')}
              className="text-primary-600 border-primary-200 hover:bg-primary-50"
            >
              <ShieldAlert size={18} className="mr-2" />
              Admin Dashboard
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          fullWidth
          className="text-red-500 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut size={18} className="mr-2" />
          Log Out
        </Button>
      </div>
      <PoweredBy />
    </div>
  )
}
