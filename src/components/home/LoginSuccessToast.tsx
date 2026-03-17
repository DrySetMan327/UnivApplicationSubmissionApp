'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export function LoginSuccessToast() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (searchParams.get('login_success') === 'true') {
            setShow(true)

            // Clean up URL
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('login_success')
            router.replace(newUrl.pathname + newUrl.search)
        }
    }, [searchParams, router])

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                setShow(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [show])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="fixed top-20 left-1/2 z-50 flex items-center gap-2 rounded-lg bg-green-50 px-6 py-3 text-green-700 shadow-lg border border-green-200"
                >
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">ログイン成功</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
