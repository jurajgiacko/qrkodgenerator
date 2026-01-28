import { nanoid } from 'nanoid'

export function generateShortId(): string {
  return nanoid(8)
}

export function buildUrlWithUtm(
  baseUrl: string,
  utm: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
): string {
  const url = new URL(baseUrl)
  
  if (utm.source) url.searchParams.set('utm_source', utm.source)
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium)
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign)
  if (utm.term) url.searchParams.set('utm_term', utm.term)
  if (utm.content) url.searchParams.set('utm_content', utm.content)
  
  return url.toString()
}

export function getLogoPath(logoType: 'enervit' | 'royalbay'): string {
  return `/logos/${logoType}.png`
}

export function getRedirectUrl(shortId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/r/${shortId}`
}
