import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Share2, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import type { Database } from '../types/supabase'
import { MatchSuggestions } from '../components/items/MatchSuggestions'
import { CustodyBadge } from '../components/items/CustodyBadge'

type Item = Database['public']['Tables']['items']['Row']
type User = Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'department' | 'id_photo_url'>

export function ItemDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { user, profile } = useAuth()
  
  const [item, setItem] = useState<Item | null>(null)
  const [reporter, setReporter] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [isClaimSheetOpen, setIsClaimSheetOpen] = useState(false)
  const [proofDescription, setProofDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReturnConfirmOpen, setIsReturnConfirmOpen] = useState(false)

  useEffect(() => {
    async function fetchItemDetails() {
      if (!id) return
      setIsLoading(true)

      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single()

      if (itemError || !itemData) {
        toast.error('Item not found')
        navigate(-1)
        return
      }

      setItem(itemData)

      // Fetch reporter info
      const { data: reporterData } = await supabase
        .from('users')
        .select('id, full_name, department, id_photo_url')
        .eq('id', itemData.reporter_id)
        .single()

      if (reporterData) {
        setReporter(reporterData)
      }

      setIsLoading(false)
    }

    fetchItemDetails()
  }, [id, navigate])

  const handleOpenClaim = () => {
    if (!user) {
      toast.error('You must log in to claim an item.')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    
    if (profile?.verification_status !== 'verified') {
      toast.error('Only verified accounts can claim items.')
      navigate('/register', { state: { from: location.pathname } })
      return
    }

    if (user.id === item?.reporter_id) {
      toast.error('You cannot claim an item you reported yourself.')
      return
    }

    setIsClaimSheetOpen(true)
  }

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !user || !profile) return

    if (proofDescription.length < 10) {
      toast.error('Please provide a more detailed proof description.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from('claims')
      .insert({
        item_id: item.id,
        claimer_id: profile.id,
        proof_description: proofDescription
      })

    setIsSubmitting(false)

    if (error) {
      if (error.message.includes('duplicate key')) {
        toast.error('You have already submitted a claim for this item.')
      } else {
        toast.error('Failed to submit claim. Please try again.')
      }
      return
    }

    setIsClaimSheetOpen(false)
    setProofDescription('')
    toast.success('Verification request sent to the reporter!')
  }

  const handleMarkReturnedClick = () => {
    setIsReturnConfirmOpen(true)
  }

  const executeMarkReturned = async () => {
    if (!item) return
    setIsSubmitting(true)
    const { error } = await supabase
      .from('items')
      .update({ status: 'returned', returned_at: new Date().toISOString() })
      .eq('id', item.id)

    setIsSubmitting(false)
    setIsReturnConfirmOpen(false)

    if (error) {
      toast.error('Failed to update status.')
      return
    }

    toast.success('Item marked as returned!')
    setItem({ ...item, status: 'returned', returned_at: new Date().toISOString() })
  }

  const handleShare = async () => {
    if (!item) return
    
    const isLostItem = item.type === 'lost'
    const shareData: ShareData = {
      title: `${isLostItem ? 'Lost' : 'Found'}: ${item.title}`,
      text: `Check out this ${isLostItem ? 'lost' : 'found'} item on Veroseven Lost & Found!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User probably cancelled share, no need to show error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url!)
        toast.success('Link copied to clipboard!')
      } catch (err) {
        toast.error('Failed to copy link')
      }
    }
  }

  if (isLoading || !item) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center pt-safe">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const isLost = item.type === 'lost'
  const dateObj = new Date(item.date_occurred)
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  const isReporter = user?.id === item.reporter_id

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 flex justify-between p-4 pt-safe pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          title="Go back"
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-800 dark:text-white pointer-events-auto active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleShare}
          title="Share" 
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-800 dark:text-white pointer-events-auto active:scale-95 transition-transform"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* Image Area */}
      <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800 transition-colors">
            <span className="font-medium text-slate-500 dark:text-slate-400">No Image Provided</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 relative -mt-6 bg-surface rounded-t-[32px] min-h-[50vh] transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white break-words pr-4 leading-tight transition-colors">{item.title}</h1>
          <Badge variant={isLost ? 'danger' : 'success'} className="shrink-0">
            {isLost ? 'Lost' : 'Found'}
          </Badge>
        </div>

        {isReporter && item.status === 'active' && (
          <MatchSuggestions itemId={item.id} itemType={item.type} />
        )}

        {item.type === 'found' && (
          <CustodyBadge item={item} />
        )}

        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-6 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 shrink-0 transition-colors">
              <MapPin size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate transition-colors">{item.location}</p>
              <p className="text-xs">Location</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 shrink-0 transition-colors">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white transition-colors">{formattedDate}</p>
              <p className="text-xs">Date {isLost ? 'Lost' : 'Found'}</p>
            </div>
          </div>
        </div>

        {item.description && (
          <div className="mb-6 border-t border-slate-100 dark:border-slate-800 pt-6 transition-colors">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2 transition-colors">Description</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300 transition-colors">{item.description}</p>
          </div>
        )}
        
        {reporter && (
          <div className="flex items-center gap-3 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm mt-6 transition-colors">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold overflow-hidden shrink-0 transition-colors">
              {reporter.id_photo_url ? (
                <img src={reporter.id_photo_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                reporter.full_name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1 truncate transition-colors">
                {reporter.full_name} <CheckCircle2 size={14} className="text-success-500 shrink-0" />
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">{reporter.department} · {isLost ? 'Loser' : 'Finder'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action for Non-Reporter */}
      {item.status === 'active' && !isReporter && (
        <div className="sticky bottom-0 left-0 right-0 mt-auto p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-safe z-30 flex gap-3 transition-colors">
          <Button 
            variant="outline" 
            className="flex-1 bg-white" 
            onClick={async () => {
              if (!user) {
                toast.error('You must log in to send a message.')
                navigate('/login', { state: { from: location.pathname } })
                return
              }
              try {
                // Check if room exists
                const { data: existingRoom } = await supabase
                  .from('chat_rooms')
                  .select('id')
                  .eq('item_id', item.id)
                  .or(`and(user1_id.eq.${user.id},user2_id.eq.${item.reporter_id}),and(user1_id.eq.${item.reporter_id},user2_id.eq.${user.id})`)
                  .single()
                
                if (existingRoom) {
                  navigate(`/chat/${existingRoom.id}`)
                  return
                }

                // Create new room
                const { data: newRoom, error } = await supabase
                  .from('chat_rooms')
                  .insert({
                    item_id: item.id,
                    user1_id: user.id,
                    user2_id: item.reporter_id
                  })
                  .select()
                  .single()
                
                if (error) throw error
                if (newRoom) {
                  navigate(`/chat/${newRoom.id}`)
                }
              } catch (err) {
                toast.error('Could not start chat')
              }
            }}
          >
            Message
          </Button>
          <Button className="flex-1" onClick={handleOpenClaim}>
            {isLost ? 'I found this' : 'Claim this'}
          </Button>
        </div>
      )}

      {/* Sticky Bottom Action for Reporter */}
      {isReporter && item.type === 'found' && !['returned', 'closed'].includes(item.status) && (
        <div className="sticky bottom-0 left-0 right-0 mt-auto p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-safe z-30 transition-colors">
          <Button 
            fullWidth 
            onClick={handleMarkReturnedClick}
            isLoading={isSubmitting}
          >
            Mark as Returned to Owner
          </Button>
        </div>
      )}

      {/* Claim Bottom Sheet */}
      <BottomSheet isOpen={isClaimSheetOpen} onClose={() => setIsClaimSheetOpen(false)} title="Claim Item">
        <form onSubmit={handleClaim} className="space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            To prove ownership, please describe a hidden detail (e.g. lock screen wallpaper, specific scratches, unique case).
          </p>
          <div className="relative">
            <textarea
              placeholder="Describe a unique detail..." 
              value={proofDescription}
              onChange={e => setProofDescription(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[120px] resize-none"
            />
          </div>
          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
            Send Verification Request
          </Button>
        </form>
      </BottomSheet>
      {/* Return Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isReturnConfirmOpen}
        onClose={() => setIsReturnConfirmOpen(false)}
        onConfirm={executeMarkReturned}
        isLoading={isSubmitting}
        title="Mark as Returned?"
        description="Are you sure you want to mark this item as returned? This action cannot be undone."
        confirmText="Mark as Returned"
      />
    </div>
  )
}
