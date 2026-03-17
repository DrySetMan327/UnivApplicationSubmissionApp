'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Prefecture, UserProfile } from '@/lib/types'
import { cancelApplication } from '@/app/actions/application'
import { PersonalInfo } from '@/components/mypage/PersonalInfo'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Toast, type ToastType } from '@/components/ui/Toast'

type ApplicationStatus = 'submitted' | 'cancelled' | 'accepted' | 'rejected'

const statusConfig: Record<ApplicationStatus, {
    label: string
    icon: string
    badge: string
}> = {
    submitted: {
        label: '出願申込済',
        icon: '〇',
        badge: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    cancelled: {
        label: '出願取消済',
        icon: '-',
        badge: 'bg-gray-100 text-gray-600 border-gray-200'
    },
    accepted: {
        label: '出願受理',
        icon: '◎',
        badge: 'bg-green-100 text-green-700 border-green-200'
    },
    rejected: {
        label: '差し戻し',
        icon: '×',
        badge: 'bg-red-100 text-red-700 border-red-200'
    }
}

interface ApplicationDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    application: any // Using any for simplicity as it includes joined data
    prefectures: Prefecture[]
}

export function ApplicationDetailDialog({ isOpen, onClose, application, prefectures }: ApplicationDetailDialogProps) {
    const [showConfirm, setShowConfirm] = React.useState(false)
    const [toast, setToast] = React.useState<{ show: boolean, message: string, type: ToastType }>({
        show: false,
        message: '',
        type: 'success'
    })

    if (!isOpen || !application) return null

    const details = application.application_details
    const profile = application.application_profiles // This should be available based on schema

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">出願詳細確認</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* Status and Number */}
                    <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">ステータス</span>
                                {(() => {
                                    const s = statusConfig[application.status as ApplicationStatus] || statusConfig.submitted
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${s.badge}`}>
                                            <span>{s.icon}</span>
                                            <span>{s.label}</span>
                                        </span>
                                    )
                                })()}
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-muted-foreground block mb-1">出願日時</span>
                                <span className="text-sm font-medium">
                                    {application.submitted_at
                                        ? new Date(application.submitted_at).toLocaleString('ja-JP')
                                        : new Date(application.created_at).toLocaleString('ja-JP')}
                                </span>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-muted">
                            <span className="text-xs text-muted-foreground block mb-1">出願番号</span>
                            <span className="text-2xl font-mono font-bold tracking-widest">{application.application_number || '未採番'}</span>
                        </div>
                    </div>

                    {/* Application Details Snapshot */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold border-l-4 border-primary pl-3">志望詳細情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-muted/10 p-4 rounded-md border">
                            <DetailRow label="入試種別" value={details?.exam_type_name} />
                            <DetailRow label="検定料" value={details?.fee ? `${details.fee.toLocaleString()}円` : '-'} />
                            <DetailRow label="学部" value={details?.faculty_name} />
                            <DetailRow label="学科" value={details?.department_name} />
                            <DetailRow label="課程・専攻等" value={details?.course_name} />
                            <DetailRow label="試験日" value={details?.exam_date} />
                            <DetailRow label="試験会場" value={details?.exam_site_name} />
                        </div>
                    </section>

                    {/* Important Dates */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold border-l-4 border-primary pl-3">期間・日程</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-muted/10 p-4 rounded-md border">
                            <DateRangeRow label="出願期間" start={details?.application_start_date} end={details?.application_end_date} />
                            <DateRangeRow label="書類郵送期間" start={details?.mailing_start_date} end={details?.mailing_end_date} />
                            <DateRangeRow label="支払期間" start={details?.payment_start_date} end={details?.payment_end_date} />
                            <DetailRow label="合格発表日" value={details?.result_announcement_date ? new Date(details.result_announcement_date).toLocaleDateString('ja-JP') : '-'} />
                        </div>
                    </section>

                    {/* Applicant Profile Snapshot */}
                    <section className="space-y-4 pb-4">
                        <h3 className="text-lg font-bold border-l-4 border-primary pl-3">出願時本人情報</h3>
                        <div className="bg-muted/10 p-4 rounded-md border">
                            {profile ? (
                                <PersonalInfo profile={profile as UserProfile} prefectures={prefectures} />
                            ) : (
                                <p className="text-sm text-muted-foreground">本人情報が記録されていません。</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t flex justify-between items-center bg-muted/5">
                    <div>
                        {(application.status !== 'accepted' && application.status !== 'cancelled') && (
                            <Button
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setShowConfirm(true)}
                            >
                                出願取消
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        閉じる
                    </Button>
                </div>

                <ConfirmDialog
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={async () => {
                        const res = await cancelApplication(application.id)
                        if (res.success) {
                            setToast({
                                show: true,
                                message: '出願を取り消しました。',
                                type: 'success'
                            })
                            // Refresh after toast disappears
                            setTimeout(() => {
                                window.location.reload()
                            }, 2000)
                        } else {
                            setToast({
                                show: true,
                                message: res.error || 'エラーが発生しました。',
                                type: 'error'
                            })
                        }
                    }}
                    title="出願の取り消し"
                    description="一度取り消した出願は元に戻せません。本当に出願を取り消しますか？"
                    confirmText="出願を取り消す"
                    variant="destructive"
                />

                <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                />
            </div>
        </div>
    )
}

function DetailRow({ label, value }: { label: string, value?: string | null }) {
    return (
        <div className="flex border-b border-muted py-2">
            <span className="w-32 text-muted-foreground font-medium shrink-0">{label}</span>
            <span className="font-medium text-foreground">{value || '-'}</span>
        </div>
    )
}

function DateRangeRow({ label, start, end }: { label: string, start?: string, end?: string }) {
    if (!start && !end) return <DetailRow label={label} value="-" />

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('ja-JP', {
            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="flex border-b border-muted py-2">
            <span className="w-32 text-muted-foreground font-medium shrink-0">{label}</span>
            <span className="font-medium text-foreground">
                {formatDate(start)} ～ {formatDate(end)}
            </span>
        </div>
    )
}
