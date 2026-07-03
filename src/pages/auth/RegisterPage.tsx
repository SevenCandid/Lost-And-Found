import { useState, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { PoweredBy } from '../../components/ui/PoweredBy'
import { ChevronLeft, Camera, Mail, Lock, User, Hash, BookOpen, GraduationCap } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// UENR institution ID from seed data
const UENR_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

interface FormData {
  email: string
  password: string
  fullName: string
  indexNumber: string
  department: string
  level: string
  idPhoto: File | null
}

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [idPreview, setIdPreview] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    indexNumber: '',
    department: '',
    level: '',
    idPhoto: null,
  })

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB')
      return
    }
    setForm(prev => ({ ...prev, idPhoto: file }))
    setIdPreview(URL.createObjectURL(file))
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setStep(2)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      // 0. Pre-flight: check if index number already exists (avoids orphaned auth users)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('index_number', form.indexNumber.toUpperCase())
        .maybeSingle()

      if (existingUser) {
        toast.error('This index number is already registered. Contact support if this is your number.')
        setIsLoading(false)
        return
      }

      // 1. Create auth user — pass profile data as metadata for the DB trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            institution_id: UENR_ID,
            full_name: form.fullName,
            index_number: form.indexNumber.toUpperCase(),
            department: form.department,
            level: form.level,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Account creation failed. Please try again.')

      // 2. Upload student ID if provided
      if (form.idPhoto) {
        const ext = form.idPhoto.name.split('.').pop()
        const filePath = `${authData.user.id}/student_id.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('student_ids')
          .upload(filePath, form.idPhoto, { upsert: true })

        if (uploadError) throw uploadError

        // 3. Update the profile row with the ID photo URL
        const { data: { publicUrl } } = supabase.storage
          .from('student_ids')
          .getPublicUrl(filePath)

        await supabase
          .from('users')
          .update({ id_photo_url: publicUrl })
          .eq('id', authData.user.id)
      }

      toast.success('Identity submitted! Awaiting admin verification.')
      navigate('/pending', { state: { from } })
    } catch (err: any) {
      const msg: string = err?.message ?? ''
      const code: string = err?.code ?? ''
      const status: number = err?.status ?? 0

      if (msg.includes('User already registered') || msg.includes('already been registered')) {
        toast.error('An account with this email already exists. Try logging in.')
      } else if (
        // PostgREST 409 Conflict from the handle_new_user() trigger
        status === 409 ||
        code === '23505' ||
        msg.includes('duplicate key') ||
        msg.includes('unique constraint')
      ) {
        if (msg.toLowerCase().includes('index_number')) {
          toast.error('This index number is already registered. Contact support if this is your number.')
        } else if (msg.toLowerCase().includes('email')) {
          toast.error('An account with this email already exists. Try logging in.')
        } else {
          toast.error('An account with these details already exists.')
        }
      } else {
        toast.error(msg || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-white px-4 py-3 border-b border-slate-100 flex items-center pt-safe">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
          className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full"
          title="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Verify Identity</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col max-w-sm mx-auto w-full">
        {/* Step progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                step >= i ? 'bg-primary-500' : 'bg-slate-100'
              }`}
            />
          ))}
        </div>

        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4 flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
              <p className="text-slate-500 text-sm">You need a verified account to report or claim items.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
              <Input
                type="email"
                placeholder="any active email"
                icon={<Mail size={18} />}
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="min. 6 characters"
                icon={<Lock size={18} />}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" fullWidth size="lg">Continue →</Button>
            </div>
            <p className="text-center text-sm text-slate-500">
              Already verified?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Log In</Link>
            </p>
          </form>
        )}

        {/* ── Step 2: Student Details ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4 flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Student Details</h2>
              <p className="text-slate-500 text-sm">Enter your official UENR details.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
              <Input
                type="text"
                placeholder="As it appears on your ID"
                icon={<User size={18} />}
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Index Number</label>
              <Input
                type="text"
                placeholder="e.g. UE0012345"
                icon={<Hash size={18} />}
                value={form.indexNumber}
                onChange={e => update('indexNumber', e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Department</label>
                <Input
                  type="text"
                  placeholder="e.g. CS"
                  icon={<BookOpen size={18} />}
                  value={form.department}
                  onChange={e => update('department', e.target.value)}
                  required
                />
              </div>
              <div className="w-28">
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Level</label>
                <Input
                  type="text"
                  placeholder="300"
                  icon={<GraduationCap size={18} />}
                  value={form.level}
                  onChange={e => update('level', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" fullWidth size="lg">Continue →</Button>
            </div>
          </form>
        )}

        {/* ── Step 3: ID Upload ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Upload Student ID (Optional)</h2>
              <p className="text-slate-500 text-sm">
                A clear photo of your UENR student ID card helps speed up verification, but you can skip this for now.
              </p>
            </div>

            {/* ID Photo Dropzone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
              title="Upload Student ID"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden active:scale-[0.98] ${
                idPreview
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              {idPreview ? (
                <img src={idPreview} alt="ID Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={40} className="mb-2 text-slate-400" />
                  <span className="font-semibold text-slate-600">Tap to take or upload photo</span>
                  <span className="text-xs text-slate-400 mt-1">JPEG or PNG · Max 5MB</span>
                </>
              )}
            </div>

            {idPreview && (
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-primary-600 underline w-full text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </button>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Submit for Verification
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              Your ID is stored securely and only visible to administrators for verification purposes.
            </p>
          </form>
        )}
      </div>
      <PoweredBy />
    </div>
  )
}
