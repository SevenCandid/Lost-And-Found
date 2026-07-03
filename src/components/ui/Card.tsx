import { HTMLAttributes, forwardRef, ImgHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface rounded-3xl shadow-soft border border-border-color/40 overflow-hidden',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-5', className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = 'CardContent'

export const ImageContainer = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement> & { aspectRatio?: 'square' | 'video' | 'portrait' }>(
  ({ className, aspectRatio = 'square', src, alt, ...props }, ref) => {
    return (
      <div className={cn(
        'relative w-full bg-slate-100 overflow-hidden rounded-2xl',
        {
          'aspect-square': aspectRatio === 'square',
          'aspect-video': aspectRatio === 'video',
          'aspect-[3/4]': aspectRatio === 'portrait',
        }
      )}>
        {src ? (
          <img
            ref={ref}
            src={src}
            alt={alt}
            className={cn('w-full h-full object-cover transition-transform duration-500 hover:scale-105', className)}
            {...props}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
      </div>
    )
  }
)
ImageContainer.displayName = 'ImageContainer'
