import { useNavigate } from 'react-router-dom'
import { PoweredBy } from '../components/ui/PoweredBy'
import { Settings, LogOut, ShieldAlert, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'
import { ItemCard } from '../components/ItemCard'

type Item = Database['public']['Tables']['items']['Row']
type Claim = Database['public']['Tables']['claims']['Row'] & { item: Item }

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, isAdmin, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'reports' | 'claims'>('reports')
  const [reports, setReports] = useState<Item[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (profile) fetchData()
  }, [profile])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      // Fetch Reports
      const { data: reportsData } = await supabase
        .from('items')
        .select('*')
        .eq('reporter_id', profile!.id)
        .order('created_at', { ascending: false })

      if (reportsData) setReports(reportsData)

      // Fetch Claims
      const { data: claimsData } = await supabase
        .from('claims')
        .select('*, item:items(*)')
        .eq('claimer_id', profile!.id)
        .order('created_at', { ascending: false })

      if (claimsData) setClaims(claimsData as unknown as Claim[])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const initials = profile?.full_name
    ?.split(' ')
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
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'reports' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Reports ({reports.length})
          </button>
          <button 
            onClick={() => setActiveTab('claims')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'claims' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Claims ({claims.length})
          </button>
        </div>

        {/* List */}
        {isLoadingData ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : activeTab === 'reports' ? (
          reports.length === 0 ? (
            <EmptyState
              title="No items reported yet"
              description="When you report a lost or found item, it will appear here."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {reports.map(item => (
                <div key={item.id} className="relative">
                  <ItemCard item={item} onClick={() => navigate(`/items/${item.id}`)} />
                  {/* Status Badge overlay */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full capitalize">
                    {item.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          claims.length === 0 ? (
            <EmptyState
              title="No claims made yet"
              description="When you claim a lost item, its status will appear here."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {claims.map(claim => (
                <div key={claim.id} className="relative">
                  {claim.item && <ItemCard item={claim.item} onClick={() => navigate(`/items/${claim.item.id}`)} />}
                  {/* Claim Status Badge overlay */}
                  <div className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shadow ${
                    claim.status === 'approved' ? 'bg-emerald-500 text-white' : 
                    claim.status === 'rejected' ? 'bg-red-500 text-white' : 
                    'bg-amber-500 text-white'
                  }`}>
                    {claim.status}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

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
