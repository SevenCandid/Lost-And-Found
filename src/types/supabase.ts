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
export type ItemStatus = 'active' | 'claimed' | 'resolved' | 'archived'
export type ClaimStatus = 'pending' | 'approved' | 'rejected'
export type NotificationType =
  | 'claim_received'
  | 'claim_approved'
  | 'claim_rejected'
  | 'item_verified'
  | 'account_verified'
  | 'account_rejected'
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
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
          id_photo_url?: string | null
          last_seen_at?: string | null
          updated_at?: string
        }
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
          updated_at?: string
        }
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
    Enums: {
      user_role: UserRole
      verification_status: VerificationStatus
      item_type: ItemType
      item_status: ItemStatus
      claim_status: ClaimStatus
      notification_type: NotificationType
    }
  }
}
