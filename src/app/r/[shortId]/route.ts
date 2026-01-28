import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase credentials for reliability
const SUPABASE_URL = 'https://ouisfxcspgwccdvpfkzh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aXNmeGNzcGd3Y2NkdnBma3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0OTI3NTgsImV4cCI6MjA1MzA2ODc1OH0.sb_secret_L2nvg1E0IXWngJg0FO-PDA_Qhw9Nggm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params
  
  try {
    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY)

    // Find the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('id, target_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content')
      .eq('short_id', shortId)
      .single()

    if (error || !qrCode) {
      // QR code not found - show error page
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head><title>QR kód nenájdený</title></head>
        <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h1>QR kód nenájdený</h1>
            <p>Kód "${shortId}" neexistuje.</p>
            <a href="/">Späť na hlavnú stránku</a>
          </div>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Record the scan (fire and forget)
    supabase.from('scans').insert({ qr_code_id: qrCode.id })

    // Build final URL with UTM parameters
    let finalUrl = qrCode.target_url
    
    // Ensure URL has protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    // Add UTM parameters
    try {
      const url = new URL(finalUrl)
      if (qrCode.utm_source) url.searchParams.set('utm_source', qrCode.utm_source)
      if (qrCode.utm_medium) url.searchParams.set('utm_medium', qrCode.utm_medium)
      if (qrCode.utm_campaign) url.searchParams.set('utm_campaign', qrCode.utm_campaign)
      if (qrCode.utm_term) url.searchParams.set('utm_term', qrCode.utm_term)
      if (qrCode.utm_content) url.searchParams.set('utm_content', qrCode.utm_content)
      finalUrl = url.toString()
    } catch {
      // If URL parsing fails, use original
    }

    // Redirect with 302
    return NextResponse.redirect(finalUrl, { status: 302 })
    
  } catch (error) {
    console.error('Redirect error:', error)
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head><title>Chyba</title></head>
      <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        <div style="text-align: center;">
          <h1>Nastala chyba</h1>
          <p>Skúste to znova neskôr.</p>
          <a href="/">Späť na hlavnú stránku</a>
        </div>
      </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
