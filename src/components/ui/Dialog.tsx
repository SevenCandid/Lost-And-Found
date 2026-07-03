import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog Panel */}
      <div className="relative w-full max-w-md bg-surface rounded-[24px] shadow-float p-6 animate-slide-up">
        {title && (
          <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
        )}
        <div className="text-slate-600">
          {children}
        </div>
      </div>
    </div>
  )
}
