'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { ExamType, Faculty, Department, Course, ExamDate, ExamSite, ApplicationUnit, ExamSchedule, UserProfile, Prefecture } from '@/lib/types'
import { isExamApplicationOpen } from '@/lib/utils/date'
import { PersonalInfo } from '@/components/mypage/PersonalInfo'
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog'

// Steps
const STEP_SELECTION = 1
const STEP_PERSONAL = 2
const STEP_CONFIRM = 3
const STEP_COMPLETE = 4

export default function ApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(STEP_SELECTION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedAppData, setSubmittedAppData] = useState<any | null>(null)

  // API Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [applicationUnits, setApplicationUnits] = useState<ApplicationUnit[]>([])
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])

  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [examSites, setExamSites] = useState<ExamSite[]>([])
  const [prefectures, setPrefectures] = useState<Prefecture[]>([])
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Form Selections
  const [formData, setFormData] = useState({
    examTypeId: '',
    applicationUnitId: '',
    facultyId: '',
    departmentId: '',
    courseId: '',
    examScheduleId: '',
    examDateId: '',
    examSiteId: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      let currentUserId = ''
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
          return
        }
        currentUserId = user.id
      } catch (e) {
        console.error('Unexpected error during auth check:', e)
        router.push('/login')
        return
      }

      // Fetch all required data concurrently
      try {
        const [
          profileRes, examTypesRes, appUnitsRes, schedulesRes,
          facultiesRes, deptsRes, coursesRes, datesRes, sitesRes, prefRes
        ] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('id', currentUserId).single(),
          supabase.from('exam_types').select('*').order('display_order'),
          supabase.from('application_units').select('*'),
          supabase.from('exam_schedules').select('*'),
          supabase.from('faculties').select('*').order('display_order'),
          supabase.from('departments').select('*').order('display_order'),
          supabase.from('courses').select('*').order('display_order'),
          supabase.from('exam_dates').select('*').order('display_order'),
          supabase.from('exam_sites').select('*').order('display_order'),
          supabase.from('prefectures').select('*').order('code')
        ])

        if (profileRes.data) setUserProfile(profileRes.data as UserProfile)
        if (examTypesRes.data) setExamTypes(examTypesRes.data as ExamType[])
        if (appUnitsRes.data) setApplicationUnits(appUnitsRes.data as ApplicationUnit[])
        if (schedulesRes.data) setExamSchedules(schedulesRes.data as ExamSchedule[])
        if (facultiesRes.data) setFaculties(facultiesRes.data as Faculty[])
        if (deptsRes.data) setDepartments(deptsRes.data as Department[])
        if (coursesRes.data) setCourses(coursesRes.data as Course[])
        if (datesRes.data) setExamDates(datesRes.data as ExamDate[])
        if (sitesRes.data) setExamSites(sitesRes.data as ExamSite[])
        if (prefRes.data) setPrefectures(prefRes.data as Prefecture[])

        // Handle pre-selection from url params
        const examId = searchParams.get('exam_id')
        if (examId && examTypesRes.data) {
          const exists = (examTypesRes.data as ExamType[]).find(e => e.id === examId)
          if (exists && isExamApplicationOpen(exists)) {
            setFormData(prev => ({ ...prev, examTypeId: examId }))
          }
        }
      } catch (e) {
        console.error('Error fetching application master data', e)
        setError('データの取得に失敗しました。ページを再読み込みしてください。')
      }
    }

    fetchData()
  }, [searchParams, supabase, router])

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Selection reset logic on change
    if (name === 'examTypeId') {
      setFormData(prev => ({ ...prev, facultyId: '', departmentId: '', courseId: '', applicationUnitId: '', examDateId: '', examSiteId: '', examScheduleId: '' }))
    } else if (name === 'facultyId') {
      setFormData(prev => ({ ...prev, departmentId: '', courseId: '', applicationUnitId: '', examDateId: '', examSiteId: '', examScheduleId: '' }))
    } else if (name === 'departmentId') {
      setFormData(prev => ({ ...prev, courseId: '', applicationUnitId: '', examDateId: '', examSiteId: '', examScheduleId: '' }))
    } else if (name === 'courseId') {
      setFormData(prev => ({ ...prev, applicationUnitId: '', examDateId: '', examSiteId: '', examScheduleId: '' }))
    } else if (name === 'examDateId') {
      setFormData(prev => ({ ...prev, examSiteId: '', examScheduleId: '' }))
    }
  }

  // Profile completeness check
  const isProfileComplete = (profile: UserProfile | null) => {
    if (!profile) return false
    return !!(
      profile.last_name_kanji &&
      profile.first_name_kanji &&
      profile.last_name_kana &&
      profile.first_name_kana &&
      profile.birth_date &&
      profile.postal_code &&
      profile.prefecture_code &&
      profile.city &&
      profile.town_area &&
      profile.high_school_name &&
      profile.phone_number_1
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase credentials are set (simple check if URL includes 'your-project-url')
      const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url')

      if (isMock) {
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1500))
        setStep(STEP_COMPLETE)
        return
      }

      if (!formData.applicationUnitId || !formData.examScheduleId) {
        setError('入力内容に不足があります。前のステップに戻って確認してください。')
        return
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('ログインが必要です。再度ログインしてください。')
        return
      }

      // 1. Create Application
      const { data: appData, error: appError } = await supabase.from('applications').insert({
        user_id: user.id,
        application_units_id: formData.applicationUnitId,
        exam_schedule_id: formData.examScheduleId,
        status: 'submitted'
      }).select().single()

      if (appError || !appData) {
        setError('出願の登録に失敗しました: ' + (appError?.message || '不明なエラー'))
        return
      }

      // 2. Create Applicant Profile Snapshot
      if (userProfile && appData) {
        const payload = {
          application_id: appData.id,
          user_name: userProfile.user_name,
          last_name_kanji: userProfile.last_name_kanji,
          first_name_kanji: userProfile.first_name_kanji,
          last_name_kana: userProfile.last_name_kana,
          first_name_kana: userProfile.first_name_kana,
          birth_date: userProfile.birth_date || null,
          postal_code: userProfile.postal_code,
          prefecture_code: userProfile.prefecture_code,
          city: userProfile.city,
          town_area: userProfile.town_area,
          building_room: userProfile.building_room,
          phone_number_1: userProfile.phone_number_1,
          phone_number_2: userProfile.phone_number_2,
          high_school_name: userProfile.high_school_name,
          graduation_date: userProfile.graduation_date || null
        }
        console.log('Inserting application_profiles with payload:', payload)

        const { error: profileError } = await supabase.from('application_profiles').insert(payload)

        if (profileError) {
          console.error('出願者プロフィールの保存に失敗しました:', JSON.stringify(profileError, null, 2))
          setError('出願者情報のバックアップ作成に失敗しました: ' + (profileError.message || '詳細不明のエラー'))
          return
        }
      }

      // 3. Create Application Details Snapshot
      if (appData) {
        const selectedExam = examTypes.find(e => e.id === formData.examTypeId)
        const selectedFaculty = faculties.find(f => f.id === formData.facultyId)
        const selectedDept = departments.find(d => d.id === formData.departmentId)
        const selectedCourse = courses.find(c => c.id === formData.courseId)
        const selectedDate = examDates.find(d => d.id === formData.examDateId)
        const selectedSite = examSites.find(s => s.id === formData.examSiteId)

        const { error: detailError } = await supabase.from('application_details').insert({
          application_id: appData.id,
          exam_type_name: selectedExam?.name || '',
          fee: selectedExam?.fee || 0,
          application_start_date: selectedExam?.application_start_date,
          application_end_date: selectedExam?.application_end_date,
          mailing_start_date: selectedExam?.mailing_start_date,
          mailing_end_date: selectedExam?.mailing_end_date,
          payment_start_date: selectedExam?.payment_start_date,
          payment_end_date: selectedExam?.payment_end_date,
          result_announcement_date: selectedExam?.result_announcement_date,
          faculty_name: selectedFaculty?.name,
          department_name: selectedDept?.name,
          course_name: selectedCourse?.name,
          exam_date: selectedDate?.exam_date,
          exam_site_name: selectedSite?.name
        })
        if (detailError) {
          console.error('出願志望詳細の保存に失敗しました:', detailError)
          setError('出願志望詳細の保存に失敗しました: ' + detailError.message)
          return
        }
      }

      setSubmittedAppData(appData)
      setStep(STEP_COMPLETE)
    } catch (err) {
      console.error('Unexpected error during submission:', err)
      setError('予期せぬエラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const selectedExam = examTypes.find(e => e.id === formData.examTypeId)

  // -- Dynamic selection options logic --
  // Helper to extract unique items
  const getUniqueItems = <T extends { id: string }>(items: T[], ids: (string | null)[]) => {
    const validIds = new Set(ids.filter(Boolean))
    return items.filter(item => validIds.has(item.id))
  }

  // 1. Available Units by ExamType
  const availableUnits = applicationUnits.filter(u => u.exam_type_id === formData.examTypeId)

  // 2. Faculty
  const availableFaculties = getUniqueItems(faculties, availableUnits.map(u => u.faculty_id))
  // Auto-select if only 1 option and not currently set (or user changed higher level)
  // We do this in a declarative way by updating the state when we detect a single option
  useEffect(() => {
    if (availableFaculties.length === 1 && formData.facultyId !== availableFaculties[0].id && !formData.facultyId) {
      setFormData(prev => ({ ...prev, facultyId: availableFaculties[0].id }))
    }
  }, [availableFaculties, formData.facultyId])

  // 3. Department
  const unitsByFaculty = availableUnits.filter(u => u.faculty_id === formData.facultyId)
  const availableDepartments = getUniqueItems(departments, unitsByFaculty.map(u => u.department_id))
  useEffect(() => {
    if (availableDepartments.length === 1 && formData.departmentId !== availableDepartments[0].id && !formData.departmentId) {
      setFormData(prev => ({ ...prev, departmentId: availableDepartments[0].id }))
    }
  }, [availableDepartments, formData.departmentId])

  // 4. Course
  const unitsByDept = unitsByFaculty.filter(u => !u.department_id || u.department_id === formData.departmentId)
  const availableCourses = getUniqueItems(courses, unitsByDept.map(u => u.course_id))
  useEffect(() => {
    if (availableCourses.length === 1 && formData.courseId !== availableCourses[0].id && !formData.courseId) {
      setFormData(prev => ({ ...prev, courseId: availableCourses[0].id }))
    }
  }, [availableCourses, formData.courseId])

  // 5. Final Application Unit detection
  useEffect(() => {
    if (formData.examTypeId) {
      const match = availableUnits.find(u =>
        (u.faculty_id === formData.facultyId || (!u.faculty_id && !formData.facultyId)) &&
        (u.department_id === formData.departmentId || (!u.department_id && !formData.departmentId)) &&
        (u.course_id === formData.courseId || (!u.course_id && !formData.courseId))
      )
      if (match && formData.applicationUnitId !== match.id) {
        setFormData(prev => ({ ...prev, applicationUnitId: match.id }))
      } else if (!match && formData.applicationUnitId) {
        setFormData(prev => ({ ...prev, applicationUnitId: '' }))
      }
    }
  }, [formData.examTypeId, formData.facultyId, formData.departmentId, formData.courseId, availableUnits, formData.applicationUnitId])

  // 6. Exam Dates (examSchedules correlates with exam_type_id)
  const typeSchedules = examSchedules.filter(s => s.exam_type_id === formData.examTypeId)
  const availableDates = getUniqueItems(examDates, typeSchedules.map(s => s.exam_date_id)).map(d => ({ id: d.id, name: d.exam_date }))
  useEffect(() => {
    if (availableDates.length === 1 && formData.examDateId !== availableDates[0].id && !formData.examDateId) {
      setFormData(prev => ({ ...prev, examDateId: availableDates[0].id }))
    }
  }, [availableDates, formData.examDateId])

  // 7. Exam Sites
  const schedulesByDate = typeSchedules.filter(s => s.exam_date_id === formData.examDateId || (!s.exam_date_id && !formData.examDateId))
  const availableSites = getUniqueItems(examSites, schedulesByDate.map(s => s.exam_site_id))
  useEffect(() => {
    if (availableSites.length === 1 && formData.examSiteId !== availableSites[0].id && !formData.examSiteId) {
      setFormData(prev => ({ ...prev, examSiteId: availableSites[0].id }))
    }
  }, [availableSites, formData.examSiteId])

  // 8. Final Exam Schedule detection
  useEffect(() => {
    const match = schedulesByDate.find(s => s.exam_site_id === formData.examSiteId || (!s.exam_site_id && !formData.examSiteId))
    if (match && formData.examScheduleId !== match.id) {
      setFormData(prev => ({ ...prev, examScheduleId: match.id }))
    } else if (!match && formData.examScheduleId) {
      setFormData(prev => ({ ...prev, examScheduleId: '' }))
    }
  }, [formData.examDateId, formData.examSiteId, schedulesByDate, formData.examScheduleId])

  const selectedUnit = applicationUnits.find(u => u.id === formData.applicationUnitId)
  const selectedSchedule = examSchedules.find(s => s.id === formData.examScheduleId)

  // UI Components
  const renderSelection = (
    label: string,
    name: string,
    value: string,
    options: { id: string, name: string }[],
    showCheck: boolean
  ) => {
    if (!showCheck || options.length === 0) return null
    if (options.length === 1) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">{label}</label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">{options[0].name}</div>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <select
          name={name}
          value={value}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">選択してください</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">新規出願登録</h1>
          <span className="text-sm text-muted-foreground">Step {step} / 4</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === STEP_SELECTION && (
        <Card>
          <CardHeader>
            <CardTitle>志望情報の入力</CardTitle>
            <CardDescription>出願する入試種別・学部・学科・試験日程などを選択してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exam Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">入試種別</label>
              <select
                name="examTypeId"
                value={formData.examTypeId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">選択してください</option>
                {examTypes.filter(isExamApplicationOpen).map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Dropdowns */}
            {renderSelection('志望学部', 'facultyId', formData.facultyId, availableFaculties, formData.examTypeId !== '')}
            {renderSelection('志望学科', 'departmentId', formData.departmentId, availableDepartments, formData.facultyId !== '')}
            {renderSelection('専攻・課程・コース等', 'courseId', formData.courseId, availableCourses, formData.departmentId !== '')}

            {/* Unit Notes */}
            {selectedUnit?.display_notes && (
              <div className="text-sm text-red-500 font-medium py-2">
                ※ {selectedUnit.display_notes}
              </div>
            )}

            {/* Schedule Section */}
            {renderSelection('試験日', 'examDateId', formData.examDateId, availableDates, formData.applicationUnitId !== '')}
            {renderSelection('試験地', 'examSiteId', formData.examSiteId, availableSites, formData.examDateId !== '')}

            {/* Schedule Notes */}
            {selectedSchedule?.display_notes && (
              <div className="text-sm text-red-500 font-medium py-2">
                ※ {selectedSchedule.display_notes}
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext} disabled={!formData.applicationUnitId || !formData.examScheduleId}>
              次へ
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === STEP_PERSONAL && (
        <Card>
          <CardHeader>
            <CardTitle>本人情報の入力</CardTitle>
            <CardDescription>アカウント登録時に入力した受験生ご本人の情報を確認してください。
              <br />内容に相違がある場合は、<strong>[修正]</strong> ボタンから正しい本人情報に修正してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userProfile ? (
              <div className="border rounded-md overflow-hidden bg-muted/5">
                <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                  <span className="text-sm font-bold">アカウント登録済み本人情報</span>
                  <Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)}>修正</Button>
                </div>
                <div className="p-4">
                  <PersonalInfo profile={userProfile} prefectures={prefectures} />
                  {!isProfileComplete(userProfile) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                      ※ 必須項目の入力が不足しています。「修正」ボタンから不足情報を入力してください。
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-destructive text-sm text-center py-4">プロフィール情報が見つかりません</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>戻る</Button>
            <Button onClick={handleNext} disabled={!userProfile || !isProfileComplete(userProfile)}>
              次へ
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === STEP_CONFIRM && (
        <Card>
          <CardHeader>
            <CardTitle>出願内容の確認</CardTitle>
            <CardDescription>以下の内容で出願登録します。よろしければ <strong>[確定する]</strong> ボタンを押してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold border-b pb-1">出願志望情報</h3>
              <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">入試種別:</span> {selectedExam?.name}</p>
              <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">志望学部:</span> {faculties.find(f => f.id === formData.facultyId)?.name}</p>
              {formData.departmentId && <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">志望学科:</span> {departments.find(d => d.id === formData.departmentId)?.name}</p>}
              {formData.courseId && <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">専攻・課程:</span> {courses.find(c => c.id === formData.courseId)?.name}</p>}
              <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">試験日:</span> {examDates.find(d => d.id === formData.examDateId)?.exam_date}</p>
              <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">試験会場:</span> {examSites.find(s => s.id === formData.examSiteId)?.name}</p>
              <p className="text-sm flex"><span className="w-24 text-muted-foreground font-medium">検定料:</span> {selectedExam?.fee.toLocaleString()}円</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold border-b pb-1">受験生本人情報</h3>
              <PersonalInfo profile={userProfile!} prefectures={prefectures} />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <h4 className="font-bold text-red-600 mb-2">【重要】今後の手続きについて</h4>
              <ul className="list-disc text-red-700 pl-5 space-y-1">
                <li>出願登録後、入学検定料のお支払い、および、必要書類の提出が別途必要です。</li>
                <li>所定の期限日までに入金や書類到着が確認できない場合、出願は無効となります。</li>
                <li>登録完了（＝出願番号払い出し）後に出願内容の変更はできません。</li>
                <li>出願内容の変更が必要な場合は、出願申込期間内にマイページの [出願状況] から<br />出願取消操作を行い、改めて出願登録を行ってください。</li>
              </ul>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={loading}>戻る</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? '処理中...' : '確定する'}
            </Button>
          </CardFooter>
        </Card>
      )
      }

      {
        step === STEP_COMPLETE && (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl">
                ✓
              </div>
              <CardTitle>出願登録が完了しました！</CardTitle>
              {submittedAppData?.application_number && (
                <div className="bg-muted py-4 px-6 rounded-lg inline-block border-2 border-primary/20">
                  <p className="text-xs text-muted-foreground font-bold mb-1">出願番号</p>
                  <p className="text-3xl font-mono font-bold tracking-[0.2em] text-primary">
                    {submittedAppData.application_number}
                  </p>
                </div>
              )}
              <CardDescription className="text-muted-foreground text-sm space-y-3">
                <span className="block">
                  出願のお申込みありがとうございます。<br />
                  出願番号はマイページ上でもご確認いただけます。<br /><br />
                </span>
                <span className="block bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <span className="text-red-700 leading-relaxed">
                    別途、入学検定料のお支払い、および、必要書類の提出が必要です。
                  </span>
                </span>
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" asChild>
                  <Link href="/">出願TOPへ</Link>
                </Button>
                <Button asChild>
                  <Link href="/mypage">マイページへ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }

      {userProfile && (
        <ProfileEditDialog
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={userProfile}
          prefectures={prefectures}
          onSuccess={(updated) => setUserProfile(updated)}
        />
      )}
    </div >
  )
}
