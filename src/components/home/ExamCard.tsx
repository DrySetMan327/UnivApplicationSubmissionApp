import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'

import { ExamType } from '@/lib/types'
import { isExamApplicationOpen, getDaysUntilDeadline } from '@/lib/utils/date'
import { AlertCircle } from 'lucide-react'

interface ExamCardProps {
  exam: ExamType
}

export function ExamCard({ exam }: ExamCardProps) {
  const isOpen = isExamApplicationOpen(exam)
  const daysUntilDeadline = getDaysUntilDeadline(exam.application_end_date)
  const isDeadlineApproaching = isOpen && daysUntilDeadline >= 0 && daysUntilDeadline <= 3

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{exam.name}</CardTitle>
        <CardDescription>検定料: {exam.fee.toLocaleString()}円</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-start space-x-2 text-sm">
          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-semibold text-muted-foreground flex items-center justify-between">
              <span>出願期間</span>
              {isDeadlineApproaching && (
                <span className="text-red-500 font-bold text-xs flex items-center animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  出願〆切まで、あと {daysUntilDeadline} 日!
                </span>
              )}
            </p>
            <p>
              {exam.application_start_date && exam.application_end_date
                ? `${formatDate(exam.application_start_date)} 〜 ${formatDate(exam.application_end_date)}`
                : '募集要項参照'}
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2 text-sm">
          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-semibold text-muted-foreground">書類提出期間</p>
            <p>
              {exam.mailing_start_date && exam.mailing_end_date
                ? `${formatDate(exam.mailing_start_date)} 〜 ${formatDate(exam.mailing_end_date)}`
                : '募集要項参照'}
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2 text-sm">
          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-semibold text-muted-foreground">検定料支払期間</p>
            <p>
              {exam.payment_start_date && exam.payment_end_date
                ? `${formatDate(exam.payment_start_date)} 〜 ${formatDate(exam.payment_end_date)}`
                : '募集要項参照'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <span className="font-semibold text-muted-foreground mr-2">合格発表日:</span>
            <span>{exam.result_announcement_date ? formatDate(exam.result_announcement_date) : '未定'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isOpen ? (
          <Button className="w-full" asChild>
            <Link href={`/application?exam_id=${exam.id}`}>出願する</Link>
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            受付期間外
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
