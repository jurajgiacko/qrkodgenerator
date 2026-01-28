import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabaseInstance
}

// Types for our database
export interface User {
  id: string
  email: string
  password_hash: string
  name: string | null
  created_at: string
}

export interface QRCode {
  id: string
  short_id: string
  name: string | null
  target_url: string
  logo_type: 'enervit' | 'royalbay' | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  created_at: string
  user_id: string | null
}

export interface Scan {
  id: string
  qr_code_id: string
  scanned_at: string
}

export interface QRCodeWithStats extends QRCode {
  scan_count: number
}
