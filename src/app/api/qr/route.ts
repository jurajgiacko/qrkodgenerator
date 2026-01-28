import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import { generateShortId } from '@/lib/qr-utils'

export async function POST(request: NextRequest) {
  console.log('POST /api/qr - Start')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'exists' : 'null')
    
    if (!session?.user) {
      console.log('Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, targetUrl, logoType, utm } = body
    console.log('Request body:', { name, targetUrl, logoType })

    if (!targetUrl) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 })
    }

    const shortId = generateShortId()
    console.log('Generated shortId:', shortId)
    
    const supabase = getSupabase()

    const insertData = {
      short_id: shortId,
      name: name || null,
      target_url: targetUrl,
      logo_type: logoType,
      utm_source: utm?.source || null,
      utm_medium: utm?.medium || null,
      utm_campaign: utm?.campaign || null,
      utm_term: utm?.term || null,
      utm_content: utm?.content || null,
    }
    console.log('Insert data:', insertData)

    const { data, error } = await supabase
      .from('qr_codes')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: `Failed to create QR code: ${error.message}` }, { status: 500 })
    }

    console.log('QR code created:', data)
    return NextResponse.json({ 
      success: true, 
      shortId,
      qrCode: data 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    // Get all QR codes with scan counts
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        scans:scans(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
