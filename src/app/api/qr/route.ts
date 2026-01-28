import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

// Hardcoded Supabase credentials
const SUPABASE_URL = 'https://ouisfxcspgwccdvpfkzh.supabase.co'

function getSupabaseClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(SUPABASE_URL, key)
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Nie ste prihlásený' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { name, targetUrl, logoType, utm } = body

    if (!targetUrl || targetUrl === 'https://') {
      return NextResponse.json({ error: 'Zadajte cieľovú URL' }, { status: 400 })
    }

    // Generate short ID
    const shortId = nanoid(8)
    
    // Insert into database
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        short_id: shortId,
        name: name || null,
        target_url: targetUrl,
        logo_type: logoType || 'enervit',
        utm_source: utm?.source || null,
        utm_medium: utm?.medium || null,
        utm_campaign: utm?.campaign || null,
        utm_term: utm?.term || null,
        utm_content: utm?.content || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: `Chyba databázy: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      shortId,
      qrCode: data 
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Interná chyba servera' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Nie ste prihlásený' }, { status: 401 })
    }

    const supabase = getSupabaseClient()

    // Get all QR codes with scan counts
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        scans:scans(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: 'Chyba pri načítaní dát' }, { status: 500 })
    }

    // Transform data to include scan_count
    const qrCodesWithStats = qrCodes.map((qr) => ({
      ...qr,
      scan_count: qr.scans?.[0]?.count || 0,
      scans: undefined,
    }))

    return NextResponse.json({ qrCodes: qrCodesWithStats })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Interná chyba servera' }, { status: 500 })
  }
}
