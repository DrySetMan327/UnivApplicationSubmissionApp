'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = '実行',
    cancelText = 'キャンセル',
    variant = 'default'
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md overflow-hidden rounded-xl bg-background p-6 shadow-2xl border"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variant === 'destructive' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                <ExclamationTriangleIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="h-10 px-4"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={variant === 'destructive' ? 'destructive' : 'default'}
                                onClick={() => {
                                    onConfirm()
                                    onClose()
                                }}
                                className="h-10 px-4 min-w-[100px]"
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
