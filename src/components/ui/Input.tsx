import { InputHTMLAttributes, forwardRef } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-14 w-full rounded-2xl border border-border-color bg-surface px-4 py-2 text-base text-slate-900 dark:text-white ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-11',
            error && 'border-danger-500 focus-visible:ring-danger-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger-500 animate-fade-in">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export const SearchBar = forwardRef<HTMLInputElement, Omit<InputProps, 'icon'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        icon={<Search size={20} />}
        placeholder="Search..."
        className={cn('rounded-full bg-surface-hover border-transparent focus-visible:bg-surface focus-visible:border-primary-500', className)}
        {...props}
      />
    )
  }
)
SearchBar.displayName = 'SearchBar'
