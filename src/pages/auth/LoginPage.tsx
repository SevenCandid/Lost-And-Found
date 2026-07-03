import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { PoweredBy } from '../../components/ui/PoweredBy'
import { ChevronLeft, Mail, Lock } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password.')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email before logging in.')
      } else {
        toast.error(error.message)
      }
      setIsLoading(false)
      return
    }

    // Fetch profile to check verification status and role
    const { data: profile } = await supabase
      .from('users')
      .select('verification_status, role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin' || profile?.role === 'superadmin') {
      toast.success('Welcome back to the Admin Portal!')
      navigate('/admin')
    } else if (profile?.verification_status === 'pending') {
      toast.success('Logged in. Your account is awaiting verification.')
      navigate('/pending', { state: { from } })
    } else if (profile?.verification_status === 'rejected') {
      toast.error('Your account was rejected. Please re-submit your ID.')
      navigate('/register', { state: { from } })
    } else {
      toast.success('Welcome back!')
      navigate(from)
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-white px-4 py-3 border-b border-slate-100 flex items-center pt-safe">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Log In</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back!</h2>
        <p className="text-slate-500 mb-8 text-sm">Sign in to report or claim items.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-2" isLoading={isLoading}>
            Log In
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" state={{ from }} className="text-primary-600 font-semibold hover:underline">
            Verify Identity
          </Link>
        </p>
      </div>
      <PoweredBy />
    </div>
  )
}
