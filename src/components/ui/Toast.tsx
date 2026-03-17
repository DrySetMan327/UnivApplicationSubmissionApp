'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
    show: boolean
    message: string
    type?: ToastType
    duration?: number
    onClose: () => void
}

const toastVariants = {
    success: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle
    },
    error: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle
    },
    warning: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: AlertCircle
    },
    info: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Info
    }
}

export function Toast({
    show,
    message,
    type = 'success',
    duration = 3000,
    onClose
}: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [show, duration, onClose])

    const variant = toastVariants[type]
    const Icon = variant.icon

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className={cn(
                        "fixed top-10 left-1/2 z-[200] flex items-center gap-3 rounded-lg px-6 py-4 shadow-xl border min-w-[320px]",
                        variant.bg,
                        variant.text,
                        variant.border
                    )}
                >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="font-semibold text-sm flex-1">{message}</span>
                    <button 
                        onClick={onClose}
                        className="ml-2 rounded-full p-1 transition-colors hover:bg-black/5"
                    >
                        <XCircle className="h-4 w-4 opacity-50" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
