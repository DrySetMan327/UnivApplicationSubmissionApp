import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils'
import { UNIVERSITY_INFO } from '@/lib/constants'
import { createClient } from '@/utils/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: UNIVERSITY_INFO.nameKanji + ' web出願',
  description: UNIVERSITY_INFO.nameKanji + 'のインターネット出願サイトです。',
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ja">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased flex flex-col")}>
        <Header initialUser={user} />
        <main className="flex-1 container mx-auto py-6">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <div className="mb-2">〒{UNIVERSITY_INFO.postalCode} {UNIVERSITY_INFO.prefecture}{UNIVERSITY_INFO.city}{UNIVERSITY_INFO.townArea}{UNIVERSITY_INFO.building}</div>
          <div className="mb-2">{UNIVERSITY_INFO.nameKanji} {UNIVERSITY_INFO.departmentKanji}</div>
          <br />
          © Hogehoge University All rights reserved.
        </footer>
      </body>
    </html>
  )
}
