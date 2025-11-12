import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nossa Maternidade - Sua Jornada',
  description: 'Acompanhamento completo da sua gestação e maternidade',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ef4444',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
        {children}
      </body>
    </html>
  )
}

