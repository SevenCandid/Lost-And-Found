import { useState, useRef } from 'react'
import { CATEGORY_GROUPS, ALL_CATEGORIES } from '../lib/categories'
import { useNavigate } from 'react-router-dom'
import { Camera, MapPin, AlignLeft, Calendar } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PillFilter } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function ReportPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<'lost' | 'found'>('found')
  const [category, setCategory] = useState(ALL_CATEGORIES[0])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  
  // Default to today's date
  const [dateOccurred, setDateOccurred] = useState(() => new Date().toISOString().split('T')[0])
  
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photo must be under 10MB')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile) {
      toast.error('You must be logged in to report an item.')
      navigate('/login', { state: { from: '/report' } })
      return
    }
    
    if (title.length < 3) {
      toast.error('Title must be at least 3 characters.')
      return
    }

    setIsLoading(true)

    try {
      let imageUrl: string | null = null

      // Upload photo if selected
      if (photo) {
        const ext = photo.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
        const filePath = `${profile.institution_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('item_images')
          .upload(filePath, photo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('item_images')
          .getPublicUrl(filePath)
          
        imageUrl = publicUrl
      }

      // Insert item
      const { error: dbError } = await supabase
        .from('items')
        .insert({
          institution_id: profile.institution_id,
          reporter_id: profile.id,
          type,
          title,
          description: description || null,
          category,
          location,
          date_occurred: new Date(dateOccurred).toISOString(),
          image_url: imageUrl,
          status: 'active' // newly reported items are always active
        })

      if (dbError) throw dbError

      toast.success('Item reported successfully!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.message || 'Failed to report item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Report Item</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6 pb-24 max-w-md mx-auto w-full">
        {/* Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={handlePhotoSelect}
          title="Upload Photo"
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden active:scale-[0.98] ${
            photoPreview
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50'
          }`}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={40} className="mb-2 text-slate-400" />
              <span className="font-medium text-slate-600">Add a clear photo</span>
            </>
          )}
        </div>

        {photoPreview && (
          <button
            type="button"
            className="-mt-4 text-sm text-slate-500 hover:text-primary-600 underline w-full text-center block"
            onClick={(e) => {
              e.stopPropagation()
              setPhoto(null)
              setPhotoPreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          >
            Remove photo
          </button>
        )}

        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-full shadow-inner">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${type === 'lost' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setType('lost')}
          >
            I lost something
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${type === 'found' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setType('found')}
          >
            I found something
          </button>
        </div>

        <div className="space-y-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-soft">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">What is it?</label>
            <Input 
              placeholder="e.g. Blue iPhone 13 Pro" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Category</label>
            <div className="relative">
              <select
                title="Select category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                required
              >
                <option value="" disabled>Select a category</option>
                {Object.entries(CATEGORY_GROUPS).map(([groupName, items]) => (
                  <optgroup key={groupName} label={groupName}>
                    {items.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Additional Details</label>
            <div className="relative">
              <div className="absolute top-3 left-4 text-slate-400">
                <AlignLeft size={20} />
              </div>
              <textarea
                placeholder="Any unique marks, colors, or serial numbers?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[100px] resize-y"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Where did this happen?</label>
            <Input 
              icon={<MapPin size={20} />} 
              placeholder="e.g. Main Library, 2nd Floor" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">When did this happen?</label>
            <Input 
              type="date"
              icon={<Calendar size={20} />} 
              value={dateOccurred}
              onChange={e => setDateOccurred(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="h-14 text-lg">
            Submit Report
          </Button>
          <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
            By submitting, you confirm these details are accurate to the best of your knowledge.
          </p>
        </div>
      </form>
    </div>
  )
}
