import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col p-6 pb-12">
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto w-full">
        <div className="w-48 h-48 bg-slate-100 rounded-[40px] mb-8 rotate-3 transition-transform hover:rotate-0 flex items-center justify-center">
          <span className="text-6xl">🎓</span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Never lose your stuff again.
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-12">
          The fastest way to recover lost belongings at UENR. Secure, simple, and student-first.
        </p>

        <div className="w-full space-y-4">
          <Button fullWidth size="lg" onClick={() => navigate('/')}>
            Continue with Google
          </Button>
          <Button fullWidth size="lg" variant="secondary">
            Use Student Email
          </Button>
        </div>
      </div>
    </div>
  )
}
