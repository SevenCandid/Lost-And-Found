import { useState, useRef } from 'react'
import { CATEGORY_GROUPS, ALL_CATEGORIES, ItemCategory } from '../lib/categories'
import { useNavigate } from 'react-router-dom'
import { Camera, MapPin, AlignLeft, Calendar, Umbrella, Smartphone, Laptop, Tablet, Battery, Headphones, HardDrive, Calculator, Book, FileText, CreditCard, Wallet, Briefcase, Key, GlassWater, Shirt, Watch, Package, Info } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PillFilter } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { CustodyPicker } from '../components/items/CustodyPicker'
import type { HolderType } from '../types/supabase'
import imageCompression from 'browser-image-compression'

export function ReportPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<'lost' | 'found'>('found')
  const [category, setCategory] = useState<string>(ALL_CATEGORIES[0] as string)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  
  // Default to today's date
  const [dateOccurred, setDateOccurred] = useState(() => new Date().toISOString().split('T')[0])
  
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const isElectronics = CATEGORY_GROUPS['Electronics'].includes(category as any)
  const isImageMandatory = type === 'lost'
  const isImageAllowed = type === 'lost' || isElectronics

  const getCategoryIcon = () => {
    switch (category) {
      case ItemCategory.PHONES: return <Smartphone size={40} className="mb-2 text-slate-400" />
      case ItemCategory.LAPTOPS: return <Laptop size={40} className="mb-2 text-slate-400" />
      case ItemCategory.TABLETS: return <Tablet size={40} className="mb-2 text-slate-400" />
      case ItemCategory.CHARGERS:
      case ItemCategory.POWER_BANKS: return <Battery size={40} className="mb-2 text-slate-400" />
      case ItemCategory.EARBUDS:
      case ItemCategory.HEADPHONES: return <Headphones size={40} className="mb-2 text-slate-400" />
      case ItemCategory.USB_DRIVES:
      case ItemCategory.HARD_DRIVES: return <HardDrive size={40} className="mb-2 text-slate-400" />
      case ItemCategory.SCIENTIFIC_CALCULATORS:
      case ItemCategory.GRAPHING_CALCULATORS: return <Calculator size={40} className="mb-2 text-slate-400" />
      case ItemCategory.BOOKS: return <Book size={40} className="mb-2 text-slate-400" />
      case ItemCategory.LECTURE_NOTES:
      case ItemCategory.ASSIGNMENTS:
      case ItemCategory.PROJECT_REPORTS: return <FileText size={40} className="mb-2 text-slate-400" />
      case ItemCategory.STUDENT_IDS:
      case ItemCategory.NATIONAL_IDS:
      case ItemCategory.PASSPORTS:
      case ItemCategory.DRIVER_LICENSES:
      case ItemCategory.ATM_CARDS: return <CreditCard size={40} className="mb-2 text-slate-400" />
      case ItemCategory.WALLETS:
      case ItemCategory.PURSES: return <Wallet size={40} className="mb-2 text-slate-400" />
      case ItemCategory.BACKPACKS:
      case ItemCategory.LAPTOP_BAGS:
      case ItemCategory.HANDBAGS:
      case ItemCategory.TRAVEL_BAGS: return <Briefcase size={40} className="mb-2 text-slate-400" />
      case ItemCategory.KEYS:
      case ItemCategory.ROOM_KEYS:
      case ItemCategory.CAR_KEYS:
      case ItemCategory.PADLOCKS: return <Key size={40} className="mb-2 text-slate-400" />
      case ItemCategory.UMBRELLAS: return <Umbrella size={40} className="mb-2 text-slate-400" />
      case ItemCategory.WATER_BOTTLES: return <GlassWater size={40} className="mb-2 text-slate-400" />
      case ItemCategory.JACKETS:
      case ItemCategory.HOODIES:
      case ItemCategory.LAB_COATS:
      case ItemCategory.SHOES:
      case ItemCategory.SLIPPERS:
      case ItemCategory.CAPS: return <Shirt size={40} className="mb-2 text-slate-400" />
      case ItemCategory.WATCHES:
      case ItemCategory.JEWELRY: return <Watch size={40} className="mb-2 text-slate-400" />
      default: return <Package size={40} className="mb-2 text-slate-400" />
    }
  }

  const [custody, setCustody] = useState({
    holderType: null as HolderType | null,
    holderLocation: '',
    holderNotes: '',
    trustAgreement: false
  })

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

    if (isImageMandatory && !photo) {
      toast.error('A photo is mandatory when reporting a lost item.')
      return
    }

    if (type === 'found') {
      if (!custody.holderType) {
        toast.error('Please indicate where the found item is being kept.')
        return
      }
      if (custody.holderType === 'other' && !custody.holderLocation.trim()) {
        toast.error('Please provide the location name for the "Other" option.')
        return
      }
      if (custody.holderType === 'finder' && !custody.trustAgreement) {
        toast.error('You must agree to the Code of Trust to keep the item.')
        return
      }
    }

    setIsLoading(true)

    try {
      let imageUrl: string | null = null

      // Upload photo if selected and allowed
      if (photo && isImageAllowed) {
        // Compress the image before uploading
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        }
        
        const compressedFile = await imageCompression(photo, options)
        const ext = photo.name.split('.').pop() || 'jpeg'
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
        const filePath = `${profile.institution_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('item_images')
          .upload(filePath, compressedFile)

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
          status: 'active', // newly reported items are always active
          ...(type === 'found' ? {
            holder_type: custody.holderType,
            holder_location: custody.holderType === 'other' ? custody.holderLocation : null,
            holder_notes: custody.holderNotes || null,
            trust_agreement: custody.trustAgreement,
          } : {})
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
    <div className="flex flex-col min-h-screen bg-surface transition-colors">
      <header className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Report Item</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6 pb-24 max-w-md mx-auto w-full">
        {/* Photo Upload or Icon Display */}
        {isImageAllowed ? (
          <>
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
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={40} className="mb-2 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Add a clear photo {isImageMandatory && <span className="text-danger-500">*</span>}
                  </span>
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
          </>
        ) : (
          <div className="w-full aspect-video rounded-3xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center p-6 text-center">
            {getCategoryIcon()}
            <h3 className="font-semibold text-slate-800 dark:text-white mt-2">Image Uploads Disabled</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              For security, photos cannot be uploaded for found {category.toLowerCase()}. This prevents fraudsters from falsely claiming the item based on a picture.
            </p>
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full shadow-inner transition-colors">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${type === 'lost' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
            onClick={() => setType('lost')}
          >
            I lost something
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${type === 'found' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
            onClick={() => setType('found')}
          >
            I found something
          </button>
        </div>

        <div className="space-y-5 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft transition-colors">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 transition-colors">What is it?</label>
            <Input 
              placeholder="e.g. Blue iPhone 13 Pro" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 transition-colors">Category</label>
            <div className="relative">
              <select
                title="Select category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-white rounded-2xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
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
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 transition-colors">Additional Details</label>
            <div className="relative">
              <div className="absolute top-3 left-4 text-slate-400">
                <AlignLeft size={20} />
              </div>
              <textarea
                placeholder="Any unique marks, colors, or serial numbers?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[100px] resize-y"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 transition-colors">Where did this happen?</label>
            <Input 
              icon={<MapPin size={20} />} 
              placeholder="e.g. Main Library, 2nd Floor" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1.5 transition-colors">When did this happen?</label>
            <Input 
              type="date"
              icon={<Calendar size={20} />} 
              value={dateOccurred}
              onChange={e => setDateOccurred(e.target.value)}
              required 
            />
          </div>
        </div>

        {type === 'found' && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft transition-colors">
            <CustodyPicker 
              value={custody} 
              category={category} 
              onChange={setCustody} 
            />
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="h-14 text-lg">
            Submit Report
          </Button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
            By submitting, you confirm these details are accurate to the best of your knowledge.
          </p>
        </div>
      </form>
    </div>
  )
}
