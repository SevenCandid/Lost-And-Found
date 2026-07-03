import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  isInteractive?: boolean
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'sm', isInteractive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors',
          {
            'bg-primary-100 text-primary-700': variant === 'primary',
            'bg-slate-100 text-slate-700': variant === 'secondary',
            'bg-success-50 text-success-600': variant === 'success',
            'bg-warning-50 text-warning-600': variant === 'warning',
            'bg-danger-50 text-danger-600': variant === 'danger',
            'bg-transparent border border-border-color text-slate-600': variant === 'outline',
            
            'hover:bg-primary-200': isInteractive && variant === 'primary',
            'hover:bg-slate-200 cursor-pointer active:scale-95': isInteractive && variant === 'secondary',
            'hover:bg-success-100': isInteractive && variant === 'success',
            'hover:bg-warning-100': isInteractive && variant === 'warning',
            'hover:bg-danger-100': isInteractive && variant === 'danger',
            'hover:bg-slate-50 cursor-pointer': isInteractive && variant === 'outline',

            'px-2.5 py-1 text-xs': size === 'sm',
            'px-4 py-1.5 text-sm': size === 'md',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

// Specialized version for filtering
export const PillFilter = forwardRef<HTMLDivElement, BadgeProps & { active?: boolean }>(
  ({ className, active, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        isInteractive
        size={props.size || "sm"}
        className={cn(
          'border shadow-sm',
          active 
            ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700' 
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
          className
        )}
        {...props}
      />
    )
  }
)
PillFilter.displayName = 'PillFilter'
