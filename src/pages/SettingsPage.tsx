import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell, Shield, Moon } from 'lucide-react'

export function SettingsPage() {
  const navigate = useNavigate()

  const SettingRow = ({ icon: Icon, title, description }: any) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 mb-3 active:scale-[0.98] transition-transform cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="w-12 h-6 bg-primary-500 rounded-full relative">
        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-white px-4 py-3 border-b border-slate-100 flex items-center pt-safe">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full" title="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
      </header>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Preferences</h2>
        <SettingRow icon={Bell} title="Notifications" description="Push alerts for your items" />
        <SettingRow icon={Moon} title="Dark Mode" description="Coming soon" />
        <SettingRow icon={Shield} title="Privacy" description="Manage what others see" />
      </div>
    </div>
  )
}
