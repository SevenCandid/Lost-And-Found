import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logoLight from '../assets/logo_light.png'

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
        <img src={logoLight} alt="Lost & Found" className="h-16 md:h-20 mb-4 drop-shadow-2xl" />
        <p className="text-primary-100 font-medium tracking-widest uppercase text-sm mt-2">UENR Edition</p>
      </div>
    </div>
  )
}
