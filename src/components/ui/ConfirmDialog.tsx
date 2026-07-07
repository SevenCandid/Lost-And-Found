import { ReactNode } from 'react'
import { Dialog } from './Dialog'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  children?: ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  children
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {description}
        </p>
      )}
      
      {children}
      
      <div className="flex justify-end gap-3 mt-6">
        <Button 
          variant="outline" 
          onClick={onClose} 
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button 
          className={isDestructive ? 'bg-danger-600 hover:bg-danger-700 text-white border-transparent' : ''}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  )
}
