export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          name: string
          thai_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          thai_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          thai_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          created_at: string | null
          customer_id: string | null
          district: string | null
          house_number: string | null
          id: string
          is_default: boolean | null
          is_deleted: boolean | null
          province: string | null
          street: string | null
          sub_district: string | null
          zipcode: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          district?: string | null
          house_number?: string | null
          id?: string
          is_default?: boolean | null
          is_deleted?: boolean | null
          province?: string | null
          street?: string | null
          sub_district?: string | null
          zipcode?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          district?: string | null
          house_number?: string | null
          id?: string
          is_default?: boolean | null
          is_deleted?: boolean | null
          province?: string | null
          street?: string | null
          sub_district?: string | null
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          qty: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          qty: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancel_reason: string | null
          channel: string
          created_at: string | null
          created_by: string | null
          customer_address_id: string | null
          customer_id: string | null
          id: string
          order_number: string
          paid_at: string | null
          payment_method: string | null
          status: string
          total: number
          updated_at: string | null
        }
        Insert: {
          cancel_reason?: string | null
          channel: string
          created_at?: string | null
          created_by?: string | null
          customer_address_id?: string | null
          customer_id?: string | null
          id?: string
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          status: string
          total?: number
          updated_at?: string | null
        }
        Update: {
          cancel_reason?: string | null
          channel?: string
          created_at?: string | null
          created_by?: string | null
          customer_address_id?: string | null
          customer_id?: string | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_address_id_fkey"
            columns: ["customer_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          compatibility: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_deleted: boolean | null
          name: string
          price: number
          qty: number
          sku: string
          threshold: number
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          compatibility?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean | null
          name: string
          price?: number
          qty?: number
          sku: string
          threshold?: number
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          compatibility?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean | null
          name?: string
          price?: number
          qty?: number
          sku?: string
          threshold?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          balance: number
          change: number
          created_at: string | null
          created_by: string | null
          id: string
          product_id: string | null
          reason: string
        }
        Insert: {
          balance: number
          change: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          product_id?: string | null
          reason: string
        }
        Update: {
          balance?: number
          change?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          product_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
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
