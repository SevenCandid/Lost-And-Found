import { ReactNode, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      document.body.style.overflow = 'hidden'
    } else {
      setTimeout(() => setMounted(false), 300)
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          "relative w-full max-w-md mx-auto bg-surface rounded-t-[32px] shadow-float pb-safe transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>
        
        {title && (
          <div className="px-6 pb-4">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          </div>
        )}
        
        <div className="px-6 pb-6 max-h-[80vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
