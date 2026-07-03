import { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-slate-200/60', className)}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-3xl p-5 shadow-soft border border-border-color/40">
      <Skeleton className="w-full aspect-square rounded-2xl mb-4" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}
