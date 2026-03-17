import { ExamType } from '@/lib/types'

// Check if exam application is open
export function isExamApplicationOpen(exam: ExamType): boolean {
    const now = new Date()
    const startDate = new Date(exam.application_start_date)
    const endDate = new Date(exam.application_end_date)

    return now >= startDate && now <= endDate
}

// Get days until deadline
export function getDaysUntilDeadline(dateString: string): number {
    const now = new Date()
    const deadline = new Date(dateString)

    // Reset time to midnight for accurate day calculation
    const nowmidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())

    const diffTime = deadlineMidnight.getTime() - nowmidnight.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}
