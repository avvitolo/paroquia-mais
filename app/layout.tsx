import type { Metadata } from 'next'
import { Manrope, Work_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Paróquia+',
  description: 'Gestão de escalas litúrgicas para paróquias católicas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
