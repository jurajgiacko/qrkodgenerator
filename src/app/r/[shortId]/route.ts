import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { buildUrlWithUtm } from '@/lib/qr-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params
    console.log('Redirect request for shortId:', shortId)
    
    const supabase = getSupabase()

    // Find the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_id', shortId)
      .single()

    console.log('QR code lookup result:', { qrCode, error })

    if (error || !qrCode) {
      console.error('QR code not found:', shortId, error)
      // QR code not found - redirect to home page
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Record the scan (don't await to speed up redirect)
    supabase.from('scans').insert({
      qr_code_id: qrCode.id,
    }).then(({ error: scanError }) => {
      if (scanError) console.error('Failed to record scan:', scanError)
      else console.log('Scan recorded for:', qrCode.id)
    })

    // Build the final URL with UTM parameters
    const finalUrl = buildUrlWithUtm(qrCode.target_url, {
      source: qrCode.utm_source,
      medium: qrCode.utm_medium,
      campaign: qrCode.utm_campaign,
      term: qrCode.utm_term,
      content: qrCode.utm_content,
    })

    console.log('Redirecting to:', finalUrl)

    // Redirect to the target URL
    return NextResponse.redirect(finalUrl, { status: 302 })
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
