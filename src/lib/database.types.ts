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
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string
          location: string
          amenities: string[] | null
          images: string[] | null
          base_price: number
          bedrooms: number
          bathrooms: number
          max_guests: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description: string
          location: string
          amenities?: string[] | null
          images?: string[] | null
          base_price: number
          bedrooms: number
          bathrooms: number
          max_guests: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string
          location?: string
          amenities?: string[] | null
          images?: string[] | null
          base_price?: number
          bedrooms?: number
          bathrooms?: number
          max_guests?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar: {
        Row: {
          id: string
          property_id: string
          date: string
          status: string
          price: number | null
          minimum_stay: number | null
          booking_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          date: string
          status: string
          price?: number | null
          minimum_stay?: number | null
          booking_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          date?: string
          status?: string
          price?: number | null
          minimum_stay?: number | null
          booking_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          guest_name: string
          guest_email: string
          check_in: string
          check_out: string
          adults: number
          children: number
          total_price: number
          status: string
          stripe_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          guest_name: string
          guest_email: string
          check_in: string
          check_out: string
          adults: number
          children: number
          total_price: number
          status: string
          stripe_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          guest_name?: string
          guest_email?: string
          check_in?: string
          check_out?: string
          adults?: number
          children?: number
          total_price?: number
          status?: string
          stripe_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 