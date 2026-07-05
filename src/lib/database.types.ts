export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          index_number: string
          department: string
          level: string
          id_photo_url: string | null
          role: 'student' | 'admin' | 'superadmin'
          verification_status: 'pending' | 'verified' | 'rejected'
          rejection_reason: string | null
          created_at: string
        }
      }
      items: {
        Row: {
          id: string
          type: 'lost' | 'found'
          title: string
          description: string | null
          category: string
          location: string
          date: string
          image_url: string | null
          reporter_id: string
          status: 'active' | 'claimed' | 'resolved'
          created_at: string
        }
      }
      claims: {
        Row: {
          id: string
          item_id: string
          claimer_id: string
          proof_description: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
      }
      matches: {
        Row: {
          id: string
          lost_item_id: string
          found_item_id: string
          score: number
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          item_id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          created_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          is_read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          created_at: string
        }
      }
    }
  }
}
