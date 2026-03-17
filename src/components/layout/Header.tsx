'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { UNIVERSITY_INFO } from '@/lib/constants'

export function Header({ initialUser }: { initialUser: User | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(initialUser)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  useEffect(() => {
    // Only subscribe to changes, don't fetch initial user again to avoid mismatch
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search logic or navigation
    console.log('Searching for:', searchQuery)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <span className="hidden text-xl font-bold sm:inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {UNIVERSITY_INFO.nameKanji} 出願サイト
            </span>
            <span className="text-lg font-bold sm:hidden bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {UNIVERSITY_INFO.nameKanji} 出願サイト
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {user && (
              <Link
                href="/mypage"
                className="relative text-foreground/80 transition-colors hover:text-primary after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                マイページ
              </Link>
            )}
            <Link
              href="/qa"
              className="relative text-foreground/80 transition-colors hover:text-primary after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
            >
              Q&A
            </Link>
            <Link
              href={UNIVERSITY_INFO.univHpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-foreground/80 transition-colors hover:text-primary after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
            >
              大学HP
            </Link>
          </nav>
        </div>

        {/* Desktop Actions (Search + Auth) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search Box - Desktop Only */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="サイト内検索..."
              className="pl-8 h-9 w-[200px] lg:w-[250px] bg-muted/50 focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-4 border-l pl-4 ml-2">
            <span className="text-sm font-medium text-muted-foreground">
              ようこそ、<span className="text-foreground">{user?.user_metadata?.user_name ?? 'ゲスト'}</span> さん
            </span>
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 transition-colors">
                ログアウト
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild className="hover:text-primary transition-colors">
                <Link href="/login">ログイン</Link>
              </Button>
            )}
            <Button size="sm" className="shadow-md hover:shadow-lg transition-all active:scale-95" asChild>
              <Link href="/application">出願する</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden">
          <span className="text-sm font-medium mr-4 text-muted-foreground">
            {user?.user_metadata?.user_name ?? 'ゲスト'}さん
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-50"
          >
            <AnimatePresence mode='wait'>
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Framer Motion) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-b bg-background overflow-hidden shadow-xl"
          >
            <div className="container py-6 space-y-6">
              <nav className="flex flex-col space-y-2">
                {user && (
                  <Link
                    href="/mypage"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-lg font-medium group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    マイページ
                    <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
                <Link
                  href="/qa"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-lg font-medium group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Q&A
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href={UNIVERSITY_INFO.univHpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-lg font-medium group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  大学HP
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                {user ? (
                  <button
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-lg font-medium group text-left"
                    onClick={handleLogout}
                  >
                    ログアウト
                    <span className="text-muted-foreground group-hover:text-red-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors text-lg font-medium text-primary group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                    <span className="text-primary/60 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}

                <div className="pt-2">
                  <Button className="w-full shadow-md" size="lg" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link href="/application">出願する</Link>
                  </Button>
                </div>
              </nav>

              {/* Mobile Search Box (Bottom of Drawer) */}
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3 font-medium">サイト内検索</p>
                <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="キーワードを入力..."
                    className="pl-9 h-11 bg-muted/50 focus:bg-background transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header >
  )
}
