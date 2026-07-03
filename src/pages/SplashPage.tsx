import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      navigate('/welcome')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-500 text-white p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="bg-white p-4 rounded-3xl shadow-lg mb-4">
          <Search size={48} className="text-primary-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
        <p className="text-primary-100 mt-2 font-medium">UENR Edition</p>
      </div>
    </div>
  )
}
