import { Info, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

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
        <Link to="/about" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">About</Link>
        <Link to="/help" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Help Center</Link>
        <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Terms of Service</Link>
        <div className="w-full mt-4 text-[11px] text-slate-400/80">
          © 2026 Lost & Found
          <br/>
          <span className="font-semibold text-slate-400">Powered by Veroseven</span>
        </div>
      </div>
    </div>
  )
}
