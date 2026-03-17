'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { submitProfile } from './actions'
import { Prefecture } from '@/lib/types'

import { profileSchema, type ProfileData } from '@/lib/schema/profile'

interface ProfileFormProps {
    prefectures: Prefecture[]
}

export default function ProfileForm({ prefectures }: ProfileFormProps) {
    const router = useRouter()
    const [isConfirming, setIsConfirming] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const form = useForm<ProfileData>({
        resolver: zodResolver(profileSchema),
        mode: 'onBlur',
        defaultValues: {
            prefecture_code: '',
            building_room: '',
            phone_number_2: '',
            birth_date: '',
            graduation_date: '',
        }
    })

    const onConfirmCheck = async (data: ProfileData) => {
        setServerError(null)
        setIsConfirming(true)
        window.scrollTo(0, 0)
    }

    const onFinalSubmit = async (data: ProfileData) => {
        setServerError(null)
        const formData = new FormData()
        // Append all fields
        Object.keys(data).forEach(key => {
            const value = data[key as keyof ProfileData]
            if (value !== undefined) {
                formData.append(key, value)
            }
        })

        try {
            const result = await submitProfile(null, formData)
            if (result?.error) {
                setServerError(result.error)
                setIsConfirming(false) // Go back to edit on error
            } else if (result?.success) {
                router.push('/mypage')
            }
        } catch (error: any) {
            console.error(error)
            setServerError('予期せぬエラーが発生しました。')
            setIsConfirming(false)
        }
    }

    // Helper to get prefecture name
    const getPrefectureName = (code: string) => {
        return prefectures.find(p => p.code === code)?.name || code
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            {/* Success Message Banner */}
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-center">
                <h2 className="text-xl font-bold mb-2">アカウント本登録が完了しました！</h2>
                <p>出願申し込みまであとワンステップ、本人情報を登録しましょう！</p>
            </div>

            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{isConfirming ? '本人情報の内容確認' : 'ご本人様情報の登録'}</CardTitle>
                    <CardDescription>
                        {isConfirming
                            ? '入力内容に間違いがないかご確認ください。'
                            : <>出願の際に必要となる受験生ご本人様に関する情報を入力してください。<br />こちらで入力された情報は、出願のお申し込みや願書（受験票）作成時に引用されます。</>
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {serverError && (
                        <Alert variant="destructive" className="mb-6">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertTitle>エラー</AlertTitle>
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    {isConfirming ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">氏名（漢字）</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('last_name_kanji')} {form.getValues('first_name_kanji')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">氏名（カナ）</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('last_name_kana')} {form.getValues('first_name_kana')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">生年月日</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('birth_date')}</div>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <div className="font-medium text-muted-foreground">住所</div>
                                    <div className="text-lg font-medium border-b pb-1">
                                        〒{form.getValues('postal_code_1')}-{form.getValues('postal_code_2')}<br />
                                        {getPrefectureName(form.getValues('prefecture_code'))} {form.getValues('city')} {form.getValues('town_area')}<br />
                                        {form.getValues('building_room')}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">出身高校名称</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('high_school_name')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">卒業（見込）年月日</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('graduation_date') || '（未入力）'}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">電話番号1</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('phone_number_1')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-medium text-muted-foreground">電話番号2</div>
                                    <div className="text-lg font-medium border-b pb-1">{form.getValues('phone_number_2') || '（未入力）'}</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => { setIsConfirming(false); window.scrollTo(0, 0); }}
                                    className="w-full sm:w-1/3"
                                >
                                    修正する
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={form.handleSubmit(onFinalSubmit)}
                                    disabled={form.formState.isSubmitting}
                                    className="w-full sm:w-1/3"
                                >
                                    {form.formState.isSubmitting ? '処理中...' : '本人情報を登録する'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={form.handleSubmit(onConfirmCheck)} className="space-y-6">

                            {/* Name Kanji */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="last_name_kanji" className="text-sm font-medium">氏名（漢字）- 姓 <span className="text-red-500">*</span></label>
                                    <Input id="last_name_kanji" {...form.register('last_name_kanji')} className={form.formState.errors.last_name_kanji ? "border-red-500" : ""} />
                                    {form.formState.errors.last_name_kanji && <p className="text-sm text-red-500">{form.formState.errors.last_name_kanji.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name_kanji" className="text-sm font-medium">氏名（漢字）- 名 <span className="text-red-500">*</span></label>
                                    <Input id="first_name_kanji" {...form.register('first_name_kanji')} className={form.formState.errors.first_name_kanji ? "border-red-500" : ""} />
                                    {form.formState.errors.first_name_kanji && <p className="text-sm text-red-500">{form.formState.errors.first_name_kanji.message}</p>}
                                </div>
                            </div>

                            {/* Name Kana */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="last_name_kana" className="text-sm font-medium">氏名（カナ）- セイ <span className="text-red-500">*</span></label>
                                    <Input id="last_name_kana" {...form.register('last_name_kana')} className={form.formState.errors.last_name_kana ? "border-red-500" : ""} />
                                    {form.formState.errors.last_name_kana && <p className="text-sm text-red-500">{form.formState.errors.last_name_kana.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="first_name_kana" className="text-sm font-medium">氏名（カナ）- メイ <span className="text-red-500">*</span></label>
                                    <Input id="first_name_kana" {...form.register('first_name_kana')} className={form.formState.errors.first_name_kana ? "border-red-500" : ""} />
                                    {form.formState.errors.first_name_kana && <p className="text-sm text-red-500">{form.formState.errors.first_name_kana.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="birth_date" className="text-sm font-medium">生年月日 <span className="text-red-500">*</span></label>
                                <Input type="date" id="birth_date" {...form.register('birth_date')} className={`w-[200px] ${form.formState.errors.birth_date ? "border-red-500" : ""}`} />
                                {form.formState.errors.birth_date && <p className="text-sm text-red-500">{form.formState.errors.birth_date.message}</p>}
                            </div>

                            {/* Address */}
                            <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                                <h3 className="font-semibold mb-2">住所情報</h3>

                                <div className="flex gap-4 items-start">
                                    <div className="space-y-2 w-24">
                                        <label htmlFor="postal_code_1" className="text-sm font-medium">郵便番号 <span className="text-red-500">*</span></label>
                                        <Input id="postal_code_1" placeholder="123" {...form.register('postal_code_1')} className={form.formState.errors.postal_code_1 ? "border-red-500" : ""} />
                                    </div>
                                    <div className="pt-8">-</div>
                                    <div className="space-y-2 w-32 pt-[1.7rem]">
                                        <Input id="postal_code_2" placeholder="4567" {...form.register('postal_code_2')} className={form.formState.errors.postal_code_2 ? "border-red-500" : ""} />
                                    </div>
                                </div>
                                {(form.formState.errors.postal_code_1 || form.formState.errors.postal_code_2) && (
                                    <p className="text-sm text-red-500">
                                        郵便番号を半角数字で正しく入力してください
                                    </p>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="prefecture_code" className="text-sm font-medium">都道府県 <span className="text-red-500">*</span></label>
                                    <select
                                        id="prefecture_code"
                                        {...form.register('prefecture_code')}
                                        className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${form.formState.errors.prefecture_code ? "border-red-500" : ""}`}
                                    >
                                        <option value="">選択してください</option>
                                        {prefectures.map(pref => (
                                            <option key={pref.code} value={pref.code}>{pref.name}</option>
                                        ))}
                                    </select>
                                    {form.formState.errors.prefecture_code && <p className="text-sm text-red-500">{form.formState.errors.prefecture_code.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-sm font-medium">市区町村 <span className="text-red-500">*</span></label>
                                    <Input id="city" placeholder="〇〇市" {...form.register('city')} className={form.formState.errors.city ? "border-red-500" : ""} />
                                    {form.formState.errors.city && <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="town_area" className="text-sm font-medium">町名・番地 <span className="text-red-500">*</span></label>
                                    <Input id="town_area" placeholder="〇〇町1-2-3" {...form.register('town_area')} className={form.formState.errors.town_area ? "border-red-500" : ""} />
                                    {form.formState.errors.town_area && <p className="text-sm text-red-500">{form.formState.errors.town_area.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="building_room" className="text-sm font-medium">建物名・部屋番号</label>
                                    <Input id="building_room" placeholder="〇〇マンション 101号室" {...form.register('building_room')} className={form.formState.errors.building_room ? "border-red-500" : ""} />
                                    {form.formState.errors.building_room && <p className="text-sm text-red-500">{form.formState.errors.building_room.message}</p>}
                                </div>
                            </div>

                            {/* Other Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="high_school_name" className="text-sm font-medium">出身高校名称 <span className="text-red-500">*</span></label>
                                    <Input id="high_school_name" placeholder="私立〇〇高等学校" {...form.register('high_school_name')} className={form.formState.errors.high_school_name ? "border-red-500" : ""} />
                                    {form.formState.errors.high_school_name && <p className="text-sm text-red-500">{form.formState.errors.high_school_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="graduation_date" className="text-sm font-medium">卒業（見込）年月日</label>
                                    <Input type="date" id="graduation_date" {...form.register('graduation_date')} className={form.formState.errors.graduation_date ? "border-red-500" : ""} />
                                    {form.formState.errors.graduation_date && <p className="text-sm text-red-500">{form.formState.errors.graduation_date.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone_number_1" className="text-sm font-medium">電話番号1 <span className="text-red-500">*</span></label>
                                <Input id="phone_number_1" placeholder="09012345678" {...form.register('phone_number_1')} className={form.formState.errors.phone_number_1 ? "border-red-500" : ""} />
                                <p className="text-xs text-muted-foreground">※ハイフンなしで入力してください</p>
                                {form.formState.errors.phone_number_1 && <p className="text-sm text-red-500">{form.formState.errors.phone_number_1.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone_number_2" className="text-sm font-medium">電話番号2（自宅や保護者などの緊急連絡先）</label>
                                <Input id="phone_number_2" placeholder="0312345678" {...form.register('phone_number_2')} className={form.formState.errors.phone_number_2 ? "border-red-500" : ""} />
                                <p className="text-xs text-muted-foreground">※ハイフンなしで入力してください</p>
                                {form.formState.errors.phone_number_2 && <p className="text-sm text-red-500">{form.formState.errors.phone_number_2.message}</p>}
                            </div>

                            <div className="pt-6">
                                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                                    確認する
                                </Button>
                            </div>

                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
