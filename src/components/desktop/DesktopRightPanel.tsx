import { Info, HelpCircle } from 'lucide-react'

export function DesktopRightPanel() {
  return (
    <div className="w-full h-full pt-8 pb-6 px-4">
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">How it works</h2>
        
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex gap-3">
            <Info className="text-primary-500 shrink-0 mt-0.5" size={18} />
            <p><strong>Report securely</strong><br/>Post items you've lost or found. Your contact details are kept private.</p>
          </div>
          <div className="flex gap-3">
            <HelpCircle className="text-primary-500 shrink-0 mt-0.5" size={18} />
            <p><strong>Smart Matching</strong><br/>Our system automatically connects similar lost and found items in your area.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 font-medium px-2">
        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">About</a>
        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Help Center</a>
        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Terms of Service</a>
        <span className="w-full mt-2">© 2024 Lost & Found</span>
      </div>
    </div>
  )
}
