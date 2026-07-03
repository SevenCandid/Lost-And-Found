import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const PillButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md shadow-primary-500/20': variant === 'primary',
            'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900': variant === 'secondary',
            'bg-danger-500 text-white hover:bg-danger-600 shadow-sm shadow-danger-500/20': variant === 'danger',
            'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PillButton.displayName = 'PillButton'
