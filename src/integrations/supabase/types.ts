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
      attendance: {
        Row: {
          attendance: string
          created_at: string | null
          id: number
          updated_at: string | null
          userid: string
          username: string | null
        }
        Insert: {
          attendance: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
          userid: string
          username?: string | null
        }
        Update: {
          attendance?: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
          userid?: string
          username?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          categoryid: number
          created_at: string | null
          description: string
          name: string
          Paid: string | null
          photo_url: string | null
        }
        Insert: {
          categoryid?: number
          created_at?: string | null
          description: string
          name: string
          Paid?: string | null
          photo_url?: string | null
        }
        Update: {
          categoryid?: number
          created_at?: string | null
          description?: string
          name?: string
          Paid?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      category: {
        Row: {
          category: string
          created_at: string | null
          id: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string | null
          email: string
          id: number
          received_amount: number | null
          referral_code: string | null
          track_id: string
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          email: string
          id?: number
          received_amount?: number | null
          referral_code?: string | null
          track_id: string
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          email?: string
          id?: number
          received_amount?: number | null
          referral_code?: string | null
          track_id?: string
          transaction_id?: string
        }
        Relationships: []
      }
      grants: {
        Row: {
          granteeid: string
          grantid: number
          grantorid: string
          granttimestamp: string | null
          privilege: number
        }
        Insert: {
          granteeid: string
          grantid?: number
          grantorid: string
          granttimestamp?: string | null
          privilege: number
        }
        Update: {
          granteeid?: string
          grantid?: number
          grantorid?: string
          granttimestamp?: string | null
          privilege?: number
        }
        Relationships: []
      }
      journal: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          date: string
          id: number
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          date: string
          id?: number
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          date?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      leave: {
        Row: {
          approval: string
          created_at: string | null
          description: string | null
          finish: string
          id: number
          nature: string
          start: string | null
          userid: string | null
          username: string | null
        }
        Insert: {
          approval: string
          created_at?: string | null
          description?: string | null
          finish: string
          id?: number
          nature: string
          start?: string | null
          userid?: string | null
          username?: string | null
        }
        Update: {
          approval?: string
          created_at?: string | null
          description?: string | null
          finish?: string
          id?: number
          nature?: string
          start?: string | null
          userid?: string | null
          username?: string | null
        }
        Relationships: []
      }
      market: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          full_name: string | null
          id: string
          name: string | null
          price: string | null
          rating: string | null
          seller: string | null
          specifications: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          price?: string | null
          rating?: string | null
          seller?: string | null
          specifications?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          price?: string | null
          rating?: string | null
          seller?: string | null
          specifications?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: number
          order_id: number
          price: number
          product_id: number
          product_name: string
          quantity: number
          sku: string
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          order_id: number
          price: number
          product_id: number
          product_name: string
          quantity: number
          sku: string
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          order_id?: number
          price?: number
          product_id?: number
          product_name?: string
          quantity?: number
          sku?: string
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string | null
          id: number
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json
          total_amount: number
          updated_at: string | null
          user_id: number
        }
        Insert: {
          billing_address: Json
          created_at?: string | null
          id?: never
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: Json
          total_amount: number
          updated_at?: string | null
          user_id: number
        }
        Update: {
          billing_address?: Json
          created_at?: string | null
          id?: never
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json
          total_amount?: number
          updated_at?: string | null
          user_id?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          currency: string
          merchantid: number | null
          paymentgateway: string
          paymentid: number
          paymentstatus: string
          paymenttimestamp: string | null
          user: string | null
          userid: number
        }
        Insert: {
          amount: number
          currency: string
          merchantid?: number | null
          paymentgateway: string
          paymentid?: number
          paymentstatus: string
          paymenttimestamp?: string | null
          user?: string | null
          userid: number
        }
        Update: {
          amount?: number
          currency?: string
          merchantid?: number | null
          paymentgateway?: string
          paymentid?: number
          paymentstatus?: string
          paymenttimestamp?: string | null
          user?: string | null
          userid?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_merchantid_fkey"
            columns: ["merchantid"]
            isOneToOne: false
            referencedRelation: "tbl_user"
            referencedColumns: ["userid"]
          },
          {
            foreignKeyName: "payments_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "tbl_user"
            referencedColumns: ["userid"]
          },
        ]
      }
      payouts: {
        Row: {
          address: string
          amount: number
          created_at: string | null
          id: number
          status: string | null
          type: string | null
          userid: string
        }
        Insert: {
          address: string
          amount: number
          created_at?: string | null
          id?: number
          status?: string | null
          type?: string | null
          userid: string
        }
        Update: {
          address?: string
          amount?: number
          created_at?: string | null
          id?: number
          status?: string | null
          type?: string | null
          userid?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          available_colors: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: number
          minimum_order: number | null
          photo_url: string | null
          price: number
          product_name: string
          ratings: number | null
          reviews_count: number | null
          seller_id: string | null
          sku: string
          specifications: Json | null
          status: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          available_colors?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: never
          minimum_order?: number | null
          photo_url?: string | null
          price: number
          product_name: string
          ratings?: number | null
          reviews_count?: number | null
          seller_id?: string | null
          sku: string
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          available_colors?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: never
          minimum_order?: number | null
          photo_url?: string | null
          price?: number
          product_name?: string
          ratings?: number | null
          reviews_count?: number | null
          seller_id?: string | null
          sku?: string
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          accepts_card: boolean | null
          accepts_cash: boolean | null
          accepts_online_payment: boolean | null
          address: string | null
          allow_online_booking: boolean | null
          business_category: string
          business_hours: Json | null
          business_name: string
          cancellation_policy: string | null
          city: string | null
          cover_image_url: string | null
          deposit_amount: number | null
          deposit_required: boolean | null
          description: string | null
          email: string | null
          gallery_image_urls: Json | null
          id: number
          offer_discounts: boolean | null
          phone_number: string | null
          profile_image_url: string | null
          send_reminders: boolean | null
          services: Json | null
          state: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          accepts_card?: boolean | null
          accepts_cash?: boolean | null
          accepts_online_payment?: boolean | null
          address?: string | null
          allow_online_booking?: boolean | null
          business_category: string
          business_hours?: Json | null
          business_name: string
          cancellation_policy?: string | null
          city?: string | null
          cover_image_url?: string | null
          deposit_amount?: number | null
          deposit_required?: boolean | null
          description?: string | null
          email?: string | null
          gallery_image_urls?: Json | null
          id?: number
          offer_discounts?: boolean | null
          phone_number?: string | null
          profile_image_url?: string | null
          send_reminders?: boolean | null
          services?: Json | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          accepts_card?: boolean | null
          accepts_cash?: boolean | null
          accepts_online_payment?: boolean | null
          address?: string | null
          allow_online_booking?: boolean | null
          business_category?: string
          business_hours?: Json | null
          business_name?: string
          cancellation_policy?: string | null
          city?: string | null
          cover_image_url?: string | null
          deposit_amount?: number | null
          deposit_required?: boolean | null
          description?: string | null
          email?: string | null
          gallery_image_urls?: Json | null
          id?: number
          offer_discounts?: boolean | null
          phone_number?: string | null
          profile_image_url?: string | null
          send_reminders?: boolean | null
          services?: Json | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      referals: {
        Row: {
          amount: number | null
          referalcode1: string
          referalcode2: string
          referalid: number
          referaltimestamp: string | null
          userid: string
        }
        Insert: {
          amount?: number | null
          referalcode1: string
          referalcode2: string
          referalid?: number
          referaltimestamp?: string | null
          userid: string
        }
        Update: {
          amount?: number | null
          referalcode1?: string
          referalcode2?: string
          referalid?: number
          referaltimestamp?: string | null
          userid?: string
        }
        Relationships: []
      }
      referals2: {
        Row: {
          referalcode: string
          referalid: number
          referaltimestamp: string | null
          userid: string
        }
        Insert: {
          referalcode: string
          referalid?: number
          referaltimestamp?: string | null
          userid: string
        }
        Update: {
          referalcode?: string
          referalid?: number
          referaltimestamp?: string | null
          userid?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: number
          referalcode2: string | null
          userid: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: number
          referalcode2?: string | null
          userid: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: number
          referalcode2?: string | null
          userid?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          id: number
          order_id: number
          product_id: number
          quantity: number
          sale_amount: number
          seller_id: string
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: never
          order_id: number
          product_id: number
          quantity: number
          sale_amount: number
          seller_id: string
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: never
          order_id?: number
          product_id?: number
          quantity?: number
          sale_amount?: number
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          address: Json | null
          business_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: Json | null
          business_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json | null
          business_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tbl_user: {
        Row: {
          balance: number
          createdat: string | null
          email: string
          isadmin: boolean
          password: string
          userid: number
          username: string
        }
        Insert: {
          balance?: number
          createdat?: string | null
          email: string
          isadmin?: boolean
          password: string
          userid?: number
          username: string
        }
        Update: {
          balance?: number
          createdat?: string | null
          email?: string
          isadmin?: boolean
          password?: string
          userid?: number
          username?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          id: number
          photo_url: string | null
          provider_id: string | null
          uid: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: number
          photo_url?: string | null
          provider_id?: string | null
          uid: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: number
          photo_url?: string | null
          provider_id?: string | null
          uid?: string
        }
        Relationships: []
      }
      verified: {
        Row: {
          created_at: string | null
          id: number
          userid: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          userid: string
        }
        Update: {
          created_at?: string | null
          id?: number
          userid?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
