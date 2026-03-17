'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
    title: string
    children: React.ReactNode
    isOpen?: boolean
    onClick?: () => void
}

export function AccordionItem({ title, children, isOpen, onClick }: AccordionItemProps) {
    return (
        <div className="border-b last:border-b-0">
            <button
                onClick={onClick}
                className={cn(
                    "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-left",
                    isOpen ? "text-primary" : "text-foreground"
                )}
            >
                {title}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 pt-0 text-muted-foreground text-sm">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function Accordion({ children, className }: { children: React.ReactNode, className?: string }) {
    // Simple state management for single open item or multiple could be added here
    // For simplicity, we'll let the parent or individual items control state if needed,
    // OR we can make this a controlled component.
    // Given the requirement is simple FAQ, let's just make a simple wrapper.
    // Actually, to make it behave like a real accordion (one open at a time), we need context or state.
    // Let's implement a simple version where each item manages its own state for now, 
    // or use a simple map if we want "one open at a time".

    // Let's use a simple "independent" mode for now as it's easier and often better for UX (allow multiple open).
    return (
        <div className={cn("w-full", className)}>
            {children}
        </div>
    )
}

// Wrapper for easy usage
export function SimpleAccordion({ items }: { items: { title: string, content: React.ReactNode }[] }) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null)

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className="w-full">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    isOpen={openIndex === index}
                    onClick={() => handleToggle(index)}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    )
}
