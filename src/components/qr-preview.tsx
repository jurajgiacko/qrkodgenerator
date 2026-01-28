'use client'

import { useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Button } from '@/components/ui/button'

interface QRPreviewProps {
  data: string
  logoType: 'enervit' | 'royalbay' | null
  size?: number
}

export function QRPreview({ data, logoType, size = 150 }: QRPreviewProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      type: 'svg',
      data: data,
      image: logoType ? `/logos/${logoType}.png` : undefined,
      dotsOptions: {
        color: '#000000',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 2,
        imageSize: 0.7,
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        type: 'dot',
      },
    })
    setQrCode(qr)
  }, [data, logoType, size])

  useEffect(() => {
    if (qrCode && qrRef.current) {
      qrRef.current.innerHTML = ''
      qrCode.append(qrRef.current)
    }
  }, [qrCode])

  const handleDownload = async (format: 'png' | 'svg') => {
    if (qrCode) {
      await qrCode.download({
        name: 'qr-code',
        extension: format,
      })
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={qrRef} className="bg-white p-2 rounded border" />
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => handleDownload('png')}>
          PNG
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('svg')}>
          SVG
        </Button>
      </div>
    </div>
  )
}
