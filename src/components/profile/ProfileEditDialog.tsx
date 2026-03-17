'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { profileSchema, type ProfileData } from '@/lib/schema/profile'
import { Prefecture, UserProfile } from '@/lib/types'
import { updateProfile } from '@/app/actions/profile'

interface ProfileEditDialogProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile
    prefectures: Prefecture[]
    onSuccess: (updatedProfile: UserProfile) => void
}

export function ProfileEditDialog({ isOpen, onClose, profile, prefectures, onSuccess }: ProfileEditDialogProps) {
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            last_name_kanji: profile.last_name_kanji || '',
            first_name_kanji: profile.first_name_kanji || '',
            last_name_kana: profile.last_name_kana || '',
            first_name_kana: profile.first_name_kana || '',
            birth_date: profile.birth_date || '',
            postal_code_1: profile.postal_code?.substring(0, 3) || '',
            postal_code_2: profile.postal_code?.substring(3, 7) || '',
            prefecture_code: profile.prefecture_code || '',
            city: profile.city || '',
            town_area: profile.town_area || '',
            building_room: profile.building_room || '',
            high_school_name: profile.high_school_name || '',
            graduation_date: profile.graduation_date || '',
            phone_number_1: profile.phone_number_1 || '',
            phone_number_2: profile.phone_number_2 || '',
        }
    })

    // Reset form when profile changes or dialog opens
    useEffect(() => {
        if (isOpen) {
            reset({
                last_name_kanji: profile.last_name_kanji || '',
                first_name_kanji: profile.first_name_kanji || '',
                last_name_kana: profile.last_name_kana || '',
                first_name_kana: profile.first_name_kana || '',
                birth_date: profile.birth_date || '',
                postal_code_1: profile.postal_code?.substring(0, 3) || '',
                postal_code_2: profile.postal_code?.substring(3, 7) || '',
                prefecture_code: profile.prefecture_code || '',
                city: profile.city || '',
                town_area: profile.town_area || '',
                building_room: profile.building_room || '',
                high_school_name: profile.high_school_name || '',
                graduation_date: profile.graduation_date || '',
                phone_number_1: profile.phone_number_1 || '',
                phone_number_2: profile.phone_number_2 || '',
            })
            setServerError(null)
        }
    }, [isOpen, profile, reset])

    if (!isOpen) return null

    const onSubmit = async (data: ProfileData) => {
        setServerError(null)
        setIsSubmitting(true)
        try {
            const result = await updateProfile(data)
            if (result.success) {
                // Construct updated profile object to return to parent
                const updatedProfile: UserProfile = {
                    ...profile,
                    last_name_kanji: data.last_name_kanji,
                    first_name_kanji: data.first_name_kanji,
                    last_name_kana: data.last_name_kana,
                    first_name_kana: data.first_name_kana,
                    birth_date: data.birth_date,
                    postal_code: data.postal_code_1 + data.postal_code_2,
                    prefecture_code: data.prefecture_code,
                    city: data.city,
                    town_area: data.town_area,
                    building_room: data.building_room || null,
                    high_school_name: data.high_school_name,
                    graduation_date: data.graduation_date || null,
                    phone_number_1: data.phone_number_1,
                    phone_number_2: data.phone_number_2 || null,
                }
                onSuccess(updatedProfile)
                onClose()
            } else {
                setServerError(result.error || 'プロフィールの更新に失敗しました。')
            }
        } catch (error) {
            setServerError('通信エラーが発生しました。')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">本人情報の修正</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="profile-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {serverError && (
                            <Alert variant="destructive">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <AlertTitle>エラー</AlertTitle>
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">姓（漢字） <span className="text-red-500">*</span></label>
                                <Input {...register('last_name_kanji')} className={errors.last_name_kanji ? "border-red-500" : ""} />
                                {errors.last_name_kanji && <p className="text-xs text-red-500">{errors.last_name_kanji.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">名（漢字） <span className="text-red-500">*</span></label>
                                <Input {...register('first_name_kanji')} className={errors.first_name_kanji ? "border-red-500" : ""} />
                                {errors.first_name_kanji && <p className="text-xs text-red-500">{errors.first_name_kanji.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">セイ（カナ） <span className="text-red-500">*</span></label>
                                <Input {...register('last_name_kana')} className={errors.last_name_kana ? "border-red-500" : ""} />
                                {errors.last_name_kana && <p className="text-xs text-red-500">{errors.last_name_kana.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">メイ（カナ） <span className="text-red-500">*</span></label>
                                <Input {...register('first_name_kana')} className={errors.first_name_kana ? "border-red-500" : ""} />
                                {errors.first_name_kana && <p className="text-xs text-red-500">{errors.first_name_kana.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">生年月日 <span className="text-red-500">*</span></label>
                            <Input type="date" {...register('birth_date')} className={errors.birth_date ? "border-red-500" : ""} />
                            {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date.message}</p>}
                        </div>

                        <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                            <h3 className="font-semibold text-sm">住所情報</h3>
                            <div className="flex gap-4 items-start text-sm">
                                <span>〒</span>
                                <div className="w-20">
                                    <Input placeholder="123" {...register('postal_code_1')} className={errors.postal_code_1 ? "border-red-500" : ""} />
                                    {errors.postal_code_1 && <p className="text-xs text-red-500 min-h-[16px]">{errors.postal_code_1.message}</p>}
                                </div>
                                <span>-</span>
                                <div className="w-24">
                                    <Input placeholder="4567" {...register('postal_code_2')} className={errors.postal_code_2 ? "border-red-500" : ""} />
                                    {errors.postal_code_2 && <p className="text-xs text-red-500 min-h-[16px]">{errors.postal_code_2.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">都道府県 <span className="text-red-500">*</span></label>
                                <select
                                    {...register('prefecture_code')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">選択してください</option>
                                    {prefectures.map(p => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.prefecture_code && <p className="text-xs text-red-500">{errors.prefecture_code.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">市区町村 <span className="text-red-500">*</span></label>
                                <Input {...register('city')} className={errors.city ? "border-red-500" : ""} />
                                {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">町名・番地 <span className="text-red-500">*</span></label>
                                <Input {...register('town_area')} className={errors.town_area ? "border-red-500" : ""} />
                                {errors.town_area && <p className="text-xs text-red-500">{errors.town_area.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">建物名・部屋番号</label>
                                <Input {...register('building_room')} className={errors.building_room ? "border-red-500" : ""} />
                                {errors.building_room && <p className="text-xs text-red-500">{errors.building_room.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">出身高校名称 <span className="text-red-500">*</span></label>
                                <Input {...register('high_school_name')} className={errors.high_school_name ? "border-red-500" : ""} />
                                {errors.high_school_name && <p className="text-xs text-red-500">{errors.high_school_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">卒業（見込）年月日</label>
                                <Input type="date" {...register('graduation_date')} className={errors.graduation_date ? "border-red-500" : ""} />
                                {errors.graduation_date && <p className="text-xs text-red-500">{errors.graduation_date.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">電話番号1 <span className="text-red-500">*</span></label>
                                <Input placeholder="09012345678" {...register('phone_number_1')} className={errors.phone_number_1 ? "border-red-500" : ""} />
                                {errors.phone_number_1 && <p className="text-xs text-red-500">{errors.phone_number_1.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">電話番号2</label>
                                <Input placeholder="0312345678" {...register('phone_number_2')} className={errors.phone_number_2 ? "border-red-500" : ""} />
                                {errors.phone_number_2 && <p className="text-xs text-red-500">{errors.phone_number_2.message}</p>}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        キャンセル
                    </Button>
                    <Button type="submit" form="profile-edit-form" disabled={isSubmitting}>
                        {isSubmitting ? '保存中...' : '保存する'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
