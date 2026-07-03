import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldAlert, Key, Mail, Lock } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { PoweredBy } from '../../components/ui/PoweredBy'

export function AdminAuthPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [fullName, setFullName] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Admin Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Check if user is actually an admin
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
          await supabase.auth.signOut()
          throw new Error('Unauthorized. This account is not an admin.')
        }

        await refreshProfile()
        toast.success('Admin access granted')
        navigate('/admin')

      } else {
        // Admin Signup
        // 1. Verify frontend secret key first to prevent spam
        const expectedSecret = import.meta.env.VITE_ADMIN_SECRET
        if (secretKey !== expectedSecret) {
          throw new Error('Invalid Admin Secret Key')
        }

        // 2. Create the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              // We put a dummy value for the required student fields
              institution_id: 'a1b2c3d4-0000-0000-0000-000000000001',
              index_number: 'ADMIN-' + Math.random().toString(36).substring(7).toUpperCase(),
              department: 'Administration',
              level: 'Staff',
            },
          },
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Failed to create admin account.')

        // 3. Promote via RPC (this checks the secret key securely on the server!)
        const { error: rpcError } = await supabase.rpc('promote_to_admin', {
          secret_key: secretKey
        })

        if (rpcError) throw rpcError

        await refreshProfile()
        toast.success('Admin account created successfully!')
        navigate('/admin')
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-white px-4 py-3 border-b border-slate-100 flex items-center pt-safe">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-500" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Portal</h1>
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col max-w-sm mx-auto w-full justify-center">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft mb-6">
          <div className="flex bg-slate-100 p-1 rounded-full mb-6">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Setup New
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Admin Secret Key</label>
                <Input
                  type="password"
                  placeholder="Enter the master secret"
                  icon={<Key size={18} />}
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
                <Input
                  type="text"
                  placeholder="e.g. System Admin"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="admin@uenr.edu.gh"
                icon={<Mail size={18} />}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-4">
              <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="bg-slate-800 hover:bg-slate-900 shadow-slate-900/20">
                {isLogin ? 'Access Portal' : 'Create Admin Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <PoweredBy />
    </div>
  )
}
