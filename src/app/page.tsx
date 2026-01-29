'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRGenerator } from '@/components/qr-generator'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Načítavam...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSave = async (data: {
    name: string
    targetUrl: string
    logoType: 'enervit' | 'royalbay' | null
    utm: {
      source: string
      medium: string
      campaign: string
      term: string
      content: string
    }
  }): Promise<{ shortId: string } | null> => {
    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Neznáma chyba')
      }
      
      return { shortId: result.shortId }
    } catch (error) {
      console.error('Save error:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">
                QR Generátor
              </h1>
              <nav className="hidden md:flex gap-4">
                <Link 
                  href="/" 
                  className="text-sm font-medium text-primary"
                >
                  Generátor
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {session.user?.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Odhlásiť
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Vytvoriť QR kód</h2>
          <p className="mt-1 text-gray-500">
            Vyberte logo, zadajte URL a UTM parametre pre sledovanie kampaní.
          </p>
        </div>
        
        <QRGenerator onSave={handleSave} />
      </main>
    </div>
  )
}
