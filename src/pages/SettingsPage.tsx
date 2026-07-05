import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell, Shield, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function SettingsPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [privacyEnabled, setPrivacyEnabled] = useState(false)

  const SettingRow = ({ icon: Icon, title, description, isActive, onClick }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mb-3 active:scale-[0.98] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-colors">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white transition-colors">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{description}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isActive ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-surface transition-colors">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center pt-safe transition-colors">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors" title="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Settings</h1>
      </header>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider transition-colors">Preferences</h2>
        <SettingRow 
          icon={Bell} 
          title="Notifications" 
          description="Push alerts for your items" 
          isActive={notificationsEnabled}
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
        />
        <SettingRow 
          icon={theme === 'dark' ? Moon : Sun} 
          title="Dark Mode" 
          description="Toggle dark/light theme" 
          isActive={theme === 'dark'}
          onClick={toggleTheme}
        />
        <SettingRow 
          icon={Shield} 
          title="Privacy" 
          description="Hide my department info" 
          isActive={privacyEnabled}
          onClick={() => setPrivacyEnabled(!privacyEnabled)}
        />
      </div>
    </div>
  )
}
