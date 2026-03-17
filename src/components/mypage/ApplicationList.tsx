'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AccountInfo } from '@/components/mypage/AccountInfo'
import { ProfileSection } from '@/components/mypage/ProfileSection'
import { Prefecture, UserProfile } from '@/lib/types'
import { cancelApplication } from '@/app/actions/application'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Toast, type ToastType } from '@/components/ui/Toast'
import { ApplicationDetailDialog } from './ApplicationDetailDialog'

type ApplicationStatus = 'submitted' | 'cancelled' | 'accepted' | 'rejected'

const statusConfig: Record<ApplicationStatus, {
  label: string
  icon: string
  badge: string
  border: string
}> = {
  submitted: {
    label: '出願申込済',
    icon: '〇',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-l-blue-500'
  },
  cancelled: {
    label: '出願取消済',
    icon: '-',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    border: 'border-l-gray-400'
  },
  accepted: {
    label: '出願受理',
    icon: '◎',
    badge: 'bg-green-100 text-green-700 border-green-200',
    border: 'border-l-green-500'
  },
  rejected: {
    label: '差し戻し',
    icon: '×',
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-l-red-500'
  }
}

interface ApplicationListProps {
  initialApplications: any[]
  user: any
  profile: UserProfile | null
  prefectures: Prefecture[]
}

export function ApplicationList({ initialApplications, user, profile, prefectures }: ApplicationListProps) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [confirmApp, setConfirmApp] = useState<any | null>(null)
  const [toastState, setToastState] = useState<{ show: boolean, message: string, type: ToastType }>({
    show: false,
    message: '',
    type: 'success'
  })

  const handleOpenDetail = (app: any) => {
    setSelectedApp(app)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">マイページ</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountInfo
              userName={user.user_metadata?.user_name || '-'}
              email={user.email || '-'}
              createdAt={new Date(user.created_at).toLocaleString('ja-JP')}
            />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>本人情報</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <ProfileSection initialProfile={profile} prefectures={prefectures} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  本人情報が登録されていません。<br />
                  出願前に本人情報の登録が必要です。
                </p>
                <Button asChild>
                  <Link href="/signup/profile">本人情報を登録する</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status */}
        <div className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold">出願状況</h2>
          {initialApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>登録済みの出願データはありません。</p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/application">出願する</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {initialApplications.map((app) => {
                const status = statusConfig[app.status as ApplicationStatus]
                return (
                  <Card key={app.id} className={`border-l-4 ${status.border}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {app.application_details?.exam_type_name || '不明な入試'}
                          </CardTitle>
                          <CardDescription>
                            出願日時: {app.submitted_at
                              ? new Date(app.submitted_at).toLocaleString('ja-JP')
                              : new Date(app.created_at).toLocaleString('ja-JP')}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">出願番号</span>
                          <span className="text-lg tracking-widest font-mono font-bold bg-muted px-3 py-1 rounded">
                            {app.application_number || '未採番'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-semibold text-muted-foreground mr-2">学部:</span>
                          {app.application_details?.faculty_name || '-'}
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground mr-2">学科:</span>
                          {app.application_details?.department_name || '-'}
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground mr-2">課程・専攻等:</span>
                          {app.application_details?.course_name || '-'}
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground mr-2">試験日:</span>
                          {app.application_details?.exam_date || '-'}
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground mr-2">検定料:</span>
                          {app.application_details?.fee ? `${app.application_details.fee.toLocaleString()}円` : '-'}
                        </div>
                        <div className="col-span-2 mt-2 flex items-center gap-2">
                          <span className="font-semibold text-muted-foreground">ステータス:</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}>
                            <span>{status.icon}</span>
                            <span>{status.label}</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      {(app.status !== 'accepted' && app.status !== 'cancelled') && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setConfirmApp(app)}>
                          出願取消
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetail(app)}>
                        詳細確認
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ApplicationDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        application={selectedApp}
        prefectures={prefectures}
      />

      <ConfirmDialog
        isOpen={!!confirmApp}
        onClose={() => setConfirmApp(null)}
        onConfirm={async () => {
          if (!confirmApp) return
          const result = await cancelApplication(confirmApp.id)
          if (result.success) {
            setToastState({ show: true, message: '出願を取り消しました。', type: 'success' })
            setTimeout(() => { window.location.reload() }, 2000)
          } else {
            setToastState({ show: true, message: result.error || 'エラーが発生しました。', type: 'error' })
          }
        }}
        title="出願の取り消し"
        description="一度取り消した出願は元に戻せません。本当に出願を取り消しますか？"
        confirmText="出願を取り消す"
        variant="destructive"
      />

      <Toast
        show={toastState.show}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState(prev => ({ ...prev, show: false }))}
      />
    </div>
  )
}
