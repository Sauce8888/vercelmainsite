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