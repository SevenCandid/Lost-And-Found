import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  fullWidth?: boolean
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          {
            'bg-primary-500 text-white hover:bg-primary-600 shadow-soft hover:shadow-md': variant === 'primary',
            'bg-surface-hover text-slate-800 hover:bg-slate-200': variant === 'secondary',
            'bg-danger-500 text-white hover:bg-danger-600 shadow-soft': variant === 'danger',
            'bg-transparent text-slate-600 hover:bg-surface-hover hover:text-slate-900': variant === 'ghost',
            'bg-transparent border border-border-color text-slate-700 hover:bg-surface-hover': variant === 'outline',
            
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
            'h-12 w-12 p-0': size === 'icon',
            
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
