import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, RefreshCcw, LogOut } from 'lucide-react'
import { PoweredBy } from '../../components/ui/PoweredBy'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export function PendingVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  
  const { profile, refreshProfile, signOut } = useAuth()

  const checkStatus = async () => {
    await refreshProfile()
    if (profile?.verification_status === 'verified') {
      toast.success('Account verified! Welcome!')
      navigate(from)
    } else if (profile?.verification_status === 'rejected') {
      toast.error('Account rejected. Please re-submit your ID.')
      navigate('/register', { state: { from } })
    } else {
      toast('Still pending review. Check back soon.', { icon: '⏳' })
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-sm mx-auto w-full text-center">

        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-soft">
          <Clock size={40} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">Verification Pending</h1>

        <p className="text-slate-500 leading-relaxed mb-2">
          The admin team is reviewing your student ID to verify your identity.
        </p>
        <p className="text-slate-400 text-sm mb-8">
          This usually takes a few hours. You'll be notified once approved.
        </p>

        {profile && (
          <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 mb-6 text-left space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted Details</p>
            <p className="text-sm font-semibold text-slate-800">{profile.full_name}</p>
            <p className="text-sm text-slate-500">{profile.index_number} · {profile.department} · Level {profile.level}</p>
          </div>
        )}

        <div className="w-full space-y-3">
          <Button fullWidth size="lg" onClick={checkStatus}>
            <RefreshCcw size={18} className="mr-2" />
            Check Status
          </Button>

          <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/')}>
            Continue Browsing
          </Button>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full text-sm text-slate-400 hover:text-slate-600 py-2"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
      <PoweredBy />
    </div>
  )
}
