import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

// Extended window interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user already dismissed it in this session or via localStorage
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Update UI notify the user they can install the PWA
      if (!isDismissed && localStorage.getItem('install-prompt-dismissed') !== 'true') {
        setIsVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Log installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      setIsVisible(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isDismissed])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // Save to local storage so we don't annoy them constantly
    localStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 rounded-2xl p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
          <Download size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Install App</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Install the Veroseven Lost & Found app for a faster experience, offline access, and quick shortcuts!
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          title="Dismiss"
          aria-label="Dismiss"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
