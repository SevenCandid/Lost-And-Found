// ============================================================
// Auto-generated Database types for Lost & Found Network
// Reflects: supabase/migrations/20240101000000_initial_schema.sql
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'admin' | 'superadmin'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type ItemType = 'lost' | 'found'
export type ItemStatus = 'active' | 'claimed' | 'resolved' | 'archived' | 'awaiting_pickup' | 'ready_for_collection' | 'returned' | 'closed'
export type ClaimStatus = 'pending' | 'approved' | 'rejected'
export type HolderType = 'finder' | 'security' | 'student_affairs' | 'other'
export type NotificationType =
  | 'claim_received'
  | 'claim_approved'
  | 'claim_rejected'
  | 'item_verified'
  | 'account_verified'
  | 'account_rejected'
  | 'new_message'
  | 'system'

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string
          name: string
          short_name: string
          domain: string | null
          logo_url: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          domain?: string | null
          logo_url?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          domain?: string | null
          logo_url?: string | null
          address?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: any[]
      }
      users: {
        Row: {
          id: string
          institution_id: string
          email: string
          full_name: string
          index_number: string
          department: string
          level: string
          phone: string | null
          id_photo_url: string | null
          role: UserRole
          verification_status: VerificationStatus
          rejection_reason: string | null
          is_active: boolean
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          institution_id: string
          email: string
          full_name: string
          index_number: string
          department: string
          level: string
          phone?: string | null
          id_photo_url?: string | null
          role?: UserRole
          verification_status?: VerificationStatus
          rejection_reason?: string | null
          is_active?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          institution_id?: string
          email?: string
          full_name?: string
          index_number?: string
          department?: string
          level?: string
          phone?: string | null
          id_photo_url?: string | null
          last_seen_at?: string | null
          updated_at?: string
          role?: UserRole
          verification_status?: VerificationStatus
          rejection_reason?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      items: {
        Row: {
          id: string
          institution_id: string
          reporter_id: string
          type: ItemType
          title: string
          description: string | null
          category: string
          location: string
          date_occurred: string
          image_url: string | null
          status: ItemStatus
          is_verified: boolean
          views: number
          meta: Json
          // Custody fields
          holder_type: HolderType | null
          holder_location: string | null
          holder_notes: string | null
          trust_agreement: boolean
          meeting_location: string | null
          meeting_time: string | null
          returned_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          reporter_id: string
          type: ItemType
          title: string
          description?: string | null
          category: string
          location: string
          date_occurred?: string
          image_url?: string | null
          status?: ItemStatus
          is_verified?: boolean
          views?: number
          meta?: Json
          // Custody fields
          holder_type?: HolderType | null
          holder_location?: string | null
          holder_notes?: string | null
          trust_agreement?: boolean
          meeting_location?: string | null
          meeting_time?: string | null
          returned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: ItemType
          title?: string
          description?: string | null
          category?: string
          location?: string
          date_occurred?: string
          image_url?: string | null
          status?: ItemStatus
          is_verified?: boolean
          meta?: Json
          // Custody fields
          holder_type?: HolderType | null
          holder_location?: string | null
          holder_notes?: string | null
          trust_agreement?: boolean
          meeting_location?: string | null
          meeting_time?: string | null
          returned_at?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      claims: {
        Row: {
          id: string
          item_id: string
          claimer_id: string
          proof_description: string
          status: ClaimStatus
          admin_note: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          claimer_id: string
          proof_description: string
          status?: ClaimStatus
          admin_note?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: ClaimStatus
          admin_note?: string | null
          resolved_at?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      matches: {
        Row: {
          id: string
          lost_item_id: string
          found_item_id: string
          score: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          lost_item_id: string
          found_item_id: string
          score?: number
          status?: string
          created_at?: string
        }
        Update: {
          score?: number
          status?: string
        }
        Relationships: any[]
      }
      chat_rooms: {
        Row: {
          id: string
          item_id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user1_id: string
          user2_id: string
          created_at?: string
        }
        Update: {
          item_id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: any[]
      }
      messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: any[]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          is_read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          is_read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
        Relationships: any[]
      }
      activity_logs: {
        Row: {
          id: number
          institution_id: string | null
          user_id: string | null
          action_type: string
          entity_table: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: never  // Logs are insert-only via triggers
        Update: never  // Logs are immutable
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
    Enums: {
      user_role: UserRole
      verification_status: VerificationStatus
      item_type: ItemType
      item_status: ItemStatus
      claim_status: ClaimStatus
      holder_type: HolderType
      notification_type: NotificationType
    }
  }
}
