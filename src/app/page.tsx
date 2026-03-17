import { createClient } from '@/utils/supabase/server'
import { ExamCard } from '@/components/home/ExamCard'
import { ExamType } from '@/lib/types'
import { isExamApplicationOpen } from '@/lib/utils/date'
import { LoginSuccessToast } from '@/components/home/LoginSuccessToast'
import { TriangleAlert } from 'lucide-react'
import { UNIVERSITY_INFO } from '@/lib/constants'
import Image from 'next/image'


export default async function Home() {
  const supabase = await createClient()

  let exams: ExamType[] = []

  // Try to fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('exam_types')
      .select('*')
      .order('created_at', { ascending: true })

    if (data && !error) {
      const allExams = data as unknown as ExamType[]

      // Sort exams: Open first, then by start date
      exams = allExams.sort((a, b) => {
        const isOpenA = isExamApplicationOpen(a)
        const isOpenB = isExamApplicationOpen(b)

        if (isOpenA && !isOpenB) return -1
        if (!isOpenA && isOpenB) return 1

        // If both are open or both closed, sort by start date
        return new Date(a.application_start_date).getTime() - new Date(b.application_start_date).getTime()
      })
    } else {
      console.warn("Supabase error or no data:", error)
    }
  } catch (e) {
    console.warn("Exception fetching exams:", e)
  }

  return (
    <div className="space-y-8">
      <LoginSuccessToast />
      <section className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl">
          {UNIVERSITY_INFO.nameKanji}<br className="md:hidden" /> 2026年度 Web出願
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {UNIVERSITY_INFO.nameKanji}のインターネット出願サイトへようこそ。<br />
          以下の入試種別一覧から、希望する入試種別を選択して出願を行ってください。
        </p>
      </section>

      <div className="relative w-full">
        <Image
          src="/univ_banner.png"
          alt="..."
          width={1920}
          height={600}
          className="w-full h-auto object-contain"
          priority
          sizes="100vw"
        />
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-yellow-600">
          <TriangleAlert className="h-16 w-16 mb-4" />
          <p className="text-xl font-bold">現在、出願可能な入試種別がありません</p>
        </div>
      )}
    </div>
  )
}
