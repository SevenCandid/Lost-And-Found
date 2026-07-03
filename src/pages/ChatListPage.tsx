import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, ChevronRight, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Database } from '../lib/database.types'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'

type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'] & {
  item: Database['public']['Tables']['items']['Row']
  other_user?: Database['public']['Tables']['users']['Row']
  last_message?: Database['public']['Tables']['messages']['Row']
}

export function ChatListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchRooms()
  }, [user])

  const fetchRooms = async () => {
    try {
      // 1. Fetch rooms where user is participant
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          item:items(*)
        `)
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .order('created_at', { ascending: false })
      
      if (roomError) throw roomError
      if (!roomData || roomData.length === 0) {
        setRooms([])
        setIsLoading(false)
        return
      }

      // 2. Fetch other users' profiles and last message for each room
      const enrichedRooms = await Promise.all(roomData.map(async (room: any) => {
        const otherUserId = room.user1_id === user!.id ? room.user2_id : room.user1_id
        
        const { data: otherUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single()

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        return {
          ...room,
          other_user: otherUser,
          last_message: lastMessage
        }
      }))

      // Sort by last message time if exists
      enrichedRooms.sort((a, b) => {
        const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.created_at).getTime()
        const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.created_at).getTime()
        return timeB - timeA
      })

      setRooms(enrichedRooms as unknown as ChatRoom[])
    } catch (err) {
      console.error('Failed to load chats', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 pt-safe px-5 py-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Messages</h1>
      </header>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading chats...</div>
        ) : rooms.length === 0 ? (
          <EmptyState title="No messages yet" description="When you contact someone about an item, the conversation will appear here." />
        ) : (
          <div className="space-y-3">
            {rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => navigate(`/chat/${room.id}`)}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-primary-200 transition-colors active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {room.other_user?.avatar_url ? (
                    <img src={room.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-slate-500 text-lg">
                      {room.other_user?.full_name?.charAt(0) || '?'}
                    </span>
                  )}
                  {/* Item indicator overlay */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-100 border-2 border-white rounded-full flex items-center justify-center">
                    <Package size={10} className="text-primary-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-slate-800 truncate pr-2">
                      {room.other_user?.full_name || 'Unknown User'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {room.last_message 
                        ? formatDistanceToNow(new Date(room.last_message.created_at), { addSuffix: true }) 
                        : formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-primary-600 font-semibold truncate mb-1">
                    Re: {room.item.title}
                  </p>
                  
                  <p className={`text-sm truncate ${room.last_message ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                    {room.last_message ? room.last_message.content : 'No messages yet'}
                  </p>
                </div>
                
                <ChevronRight size={20} className="text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
