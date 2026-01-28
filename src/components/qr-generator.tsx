'use client'

import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type LogoType = 'enervit' | 'royalbay'

interface ColorPreset {
  name: string
  dotsColor: string
  backgroundColor: string
  cornersColor: string
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Klasická', dotsColor: '#000000', backgroundColor: '#ffffff', cornersColor: '#000000' },
  { name: 'Enervit Orange', dotsColor: '#E85D04', backgroundColor: '#ffffff', cornersColor: '#E85D04' },
  { name: 'RoyalBay Blue', dotsColor: '#1e3a8a', backgroundColor: '#ffffff', cornersColor: '#1e3a8a' },
  { name: 'Zelená', dotsColor: '#16a34a', backgroundColor: '#ffffff', cornersColor: '#16a34a' },
  { name: 'Červená', dotsColor: '#dc2626', backgroundColor: '#ffffff', cornersColor: '#dc2626' },
  { name: 'Fialová', dotsColor: '#7c3aed', backgroundColor: '#ffffff', cornersColor: '#7c3aed' },
]

interface QRGeneratorProps {
  onSave?: (data: {
    name: string
    targetUrl: string
    logoType: LogoType
    utm: {
      source: string
      medium: string
      campaign: string
      term: string
      content: string
    }
  }) => Promise<{ shortId: string } | null>
}

export function QRGenerator({ onSave }: QRGeneratorProps) {
  const [name, setName] = useState('')
  const [targetUrl, setTargetUrl] = useState('https://')
  const [logoType, setLogoType] = useState<LogoType>('enervit')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmContent, setUtmContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedShortId, setSavedShortId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)
  
  // Color settings
  const [dotsColor, setDotsColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [cornersColor, setCornersColor] = useState('#000000')
  const [selectedPreset, setSelectedPreset] = useState(0)
  
  const qrRef = useRef<HTMLDivElement>(null)

  // Initialize QR code
  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: targetUrl || 'https://vitarsport.sk',
      image: `/logos/${logoType}.png`,
      dotsOptions: {
        color: dotsColor,
        type: 'rounded',
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: 0.4,
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: cornersColor,
      },
      cornersDotOptions: {
        type: 'dot',
        color: cornersColor,
      },
    })
    setQrCode(qr)
  }, [])

  // Append QR code to DOM
  useEffect(() => {
    if (qrCode && qrRef.current) {
      qrRef.current.innerHTML = ''
      qrCode.append(qrRef.current)
    }
  }, [qrCode])

  // Update QR code when data changes
  useEffect(() => {
    if (qrCode) {
      const displayUrl = savedShortId 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${savedShortId}`
        : targetUrl || 'https://vitarsport.sk'
      
      qrCode.update({
        data: displayUrl,
        image: `/logos/${logoType}.png`,
        dotsOptions: {
          color: dotsColor,
          type: 'rounded',
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: cornersColor,
        },
        cornersDotOptions: {
          type: 'dot',
          color: cornersColor,
        },
      })
    }
  }, [targetUrl, logoType, qrCode, savedShortId, dotsColor, backgroundColor, cornersColor])

  const applyPreset = (index: number) => {
    const preset = COLOR_PRESETS[index]
    setSelectedPreset(index)
    setDotsColor(preset.dotsColor)
    setBackgroundColor(preset.backgroundColor)
    setCornersColor(preset.cornersColor)
  }

  const handleDownload = async (format: 'png' | 'svg') => {
    if (qrCode) {
      await qrCode.download({
        name: name || 'qr-code',
        extension: format,
      })
    }
  }

  const handleSave = async () => {
    if (!onSave || !targetUrl || targetUrl === 'https://') return
    
    setIsSaving(true)
    try {
      const result = await onSave({
        name,
        targetUrl,
        logoType,
        utm: {
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
          term: utmTerm,
          content: utmContent,
        },
      })
      if (result) {
        setSavedShortId(result.shortId)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setName('')
    setTargetUrl('https://')
    setUtmSource('')
    setUtmMedium('')
    setUtmCampaign('')
    setUtmTerm('')
    setUtmContent('')
    setSavedShortId(null)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Základné nastavenia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Názov QR kódu (pre identifikáciu)</Label>
              <Input
                id="name"
                placeholder="napr. Leták zimná kampaň 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Cieľová URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://www.enervit.sk/produkt"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Vyberte logo</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLogoType('enervit')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    logoType === 'enervit'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-16 flex items-center justify-center">
                    <img 
                      src="/logos/enervit.png" 
                      alt="Enervit" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <span className="hidden text-lg font-bold text-orange-600">ENERVIT</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoType('royalbay')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    logoType === 'royalbay'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-16 flex items-center justify-center">
                    <img 
                      src="/logos/royalbay.png" 
                      alt="RoyalBay" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <span className="hidden text-lg font-bold text-blue-600">ROYALBAY</span>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Farby QR kódu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prednastavené farebné schémy</Label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset, index) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(index)}
                    className={`p-2 border-2 rounded-lg transition-all text-xs ${
                      selectedPreset === index
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.dotsColor }}
                      />
                      <span>{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dotsColor">Farba bodiek</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="dotsColor"
                    value={dotsColor}
                    onChange={(e) => {
                      setDotsColor(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={dotsColor}
                    onChange={(e) => {
                      setDotsColor(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cornersColor">Farba rohov</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="cornersColor"
                    value={cornersColor}
                    onChange={(e) => {
                      setCornersColor(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={cornersColor}
                    onChange={(e) => {
                      setCornersColor(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgColor">Farba pozadia</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="bgColor"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value)
                      setSelectedPreset(-1)
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>UTM Parametre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utm_source">Source</Label>
                <Input
                  id="utm_source"
                  placeholder="napr. qr_code"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_medium">Medium</Label>
                <Input
                  id="utm_medium"
                  placeholder="napr. print"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="utm_campaign">Campaign</Label>
              <Input
                id="utm_campaign"
                placeholder="napr. zimna_akcia_2024"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utm_term">Term (voliteľné)</Label>
                <Input
                  id="utm_term"
                  placeholder="napr. energia"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_content">Content (voliteľné)</Label>
                <Input
                  id="utm_content"
                  placeholder="napr. banner_a"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Preview Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Náhľad QR kódu</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div 
              ref={qrRef}
              className="p-4 rounded-lg border"
              style={{ backgroundColor: backgroundColor }}
            />
            
            {savedShortId && (
              <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">QR kód uložený!</p>
                <p className="text-xs text-green-600 mt-1 break-all">
                  Redirect URL: {appUrl}/r/{savedShortId}
                </p>
              </div>
            )}

            <div className="flex gap-2 w-full">
              <Button 
                onClick={() => handleDownload('png')} 
                variant="outline"
                className="flex-1"
              >
                Stiahnuť PNG
              </Button>
              <Button 
                onClick={() => handleDownload('svg')} 
                variant="outline"
                className="flex-1"
              >
                Stiahnuť SVG
              </Button>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isSaving || !targetUrl || targetUrl === 'https://' || !!savedShortId}
              >
                {isSaving ? 'Ukladám...' : savedShortId ? 'Uložené' : 'Uložiť a sledovať'}
              </Button>
              {savedShortId && (
                <Button onClick={handleReset} variant="outline">
                  Nový QR kód
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
