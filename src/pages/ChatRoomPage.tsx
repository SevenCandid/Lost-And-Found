import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Send, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Database } from '../lib/database.types'
import { formatDistanceToNow } from 'date-fns'

type Message = Database['public']['Tables']['messages']['Row']
type Room = Database['public']['Tables']['chat_rooms']['Row'] & {
  item: Database['public']['Tables']['items']['Row']
}
type User = Database['public']['Tables']['users']['Row']

export function ChatRoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !id) return
    fetchRoomDetails()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room:${id}_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRoomDetails = async () => {
    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          item:items(*)
        `)
        .eq('id', id)
        .single()
      
      if (roomError || !roomData) {
        navigate('/messages')
        return
      }
      
      setRoom(roomData as unknown as Room)

      // Fetch other user
      const otherUserId = roomData.user1_id === user!.id ? roomData.user2_id : roomData.user1_id
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single()
      
      if (userData) {
        setOtherUser(userData)
      }

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', id)
        .order('created_at', { ascending: true })
      
      if (messagesData) {
        setMessages(messagesData)
      }
      
      // Mark message notifications as read for this room
      supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('type', 'new_message')
        .eq('related_entity_id', id)
        .then()

    } catch (err) {
      console.error('Failed to load room details', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !id) return

    const messageContent = newMessage.trim()
    setNewMessage('') // Optimistic clear

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: id,
          sender_id: user.id,
          content: messageContent
        })
      
      if (error) {
        throw error
      }
      
      // Notification is handled by the DB trigger (notify_on_new_message)
      // Realtime subscription will handle adding it to the list
    } catch (err) {
      console.error('Failed to send message', err)
      setNewMessage(messageContent) // Restore on failure
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-surface text-slate-500 dark:text-slate-400 transition-colors">Loading chat...</div>
  }

  if (!room) return null

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-safe shrink-0 transition-colors">
        <div className="px-2 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors" title="Go back">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden transition-colors">
              {otherUser?.id_photo_url ? (
            <img src={otherUser.id_photo_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-slate-500 dark:text-slate-300">{otherUser?.full_name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-800 dark:text-white truncate transition-colors">{otherUser?.full_name || 'Unknown User'}</h2>
              <div className="flex items-center gap-1 text-[10px] text-primary-600 dark:text-primary-400 font-medium truncate">
                <Package size={10} />
                <span className="truncate">Re: {room.item.title}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe-bottom">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">
            Send a message to start the conversation.
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === user!.id
          const showTime = idx === messages.length - 1 || 
            new Date(messages[idx+1].created_at).getTime() - new Date(msg.created_at).getTime() > 300000 // 5 mins

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine 
                    ? 'bg-primary-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm rounded-bl-sm transition-colors'
                }`}
              >
                {msg.content}
              </div>
              {showTime && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-3 pb-safe-bottom shrink-0 transition-colors">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          <button 
            type="submit"
            title="Send message"
            disabled={!newMessage.trim()}
            className="w-11 h-11 bg-primary-600 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
