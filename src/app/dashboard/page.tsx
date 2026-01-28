'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCodeWithStats } from '@/lib/supabase'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [qrCodes, setQrCodes] = useState<QRCodeWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchQRCodes()
    }
  }, [status])

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/qr')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.qrCodes || [])
      }
    } catch (error) {
      console.error('Failed to fetch QR codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
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

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Generátor
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-primary"
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
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-gray-500">
            Prehľad všetkých vytvorených QR kódov a ich štatistík.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Celkom QR kódov
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{qrCodes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Celkom skenov
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalScans}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Priemer skenov/QR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {qrCodes.length > 0 ? (totalScans / qrCodes.length).toFixed(1) : '0'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Codes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vytvorené QR kódy</CardTitle>
          </CardHeader>
          <CardContent>
            {qrCodes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Zatiaľ nemáte žiadne QR kódy.</p>
                <Link href="/">
                  <Button>Vytvoriť prvý QR kód</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Názov</th>
                      <th className="pb-3 font-medium text-gray-500">Logo</th>
                      <th className="pb-3 font-medium text-gray-500">Cieľová URL</th>
                      <th className="pb-3 font-medium text-gray-500">Redirect URL</th>
                      <th className="pb-3 font-medium text-gray-500">UTM Campaign</th>
                      <th className="pb-3 font-medium text-gray-500 text-right">Skeny</th>
                      <th className="pb-3 font-medium text-gray-500">Vytvorené</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qr) => (
                      <tr key={qr.id} className="border-b last:border-0">
                        <td className="py-4">
                          <span className="font-medium">
                            {qr.name || 'Bez názvu'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            qr.logo_type === 'enervit' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {qr.logo_type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4">
                          <a 
                            href={qr.target_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm max-w-[200px] truncate block"
                          >
                            {qr.target_url}
                          </a>
                        </td>
                        <td className="py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {appUrl}/r/{qr.short_id}
                          </code>
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {qr.utm_campaign || '-'}
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {qr.scan_count || 0}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {new Date(qr.created_at).toLocaleDateString('sk-SK')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
