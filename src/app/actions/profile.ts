'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { profileSchema, type ProfileData } from '@/lib/schema/profile'

export async function updateProfile(data: ProfileData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: '認証エラーが発生しました。再度ログインしてください。' }
    }

    // Server-side validation
    const result = profileSchema.safeParse(data)
    if (!result.success) {
        return { error: '入力内容に不備があります。' }
    }

    const profileData = {
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

    const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', user.id)

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'プロフィールの保存に失敗しました。時間をおいて再度お試しください。' }
    }

    revalidatePath('/mypage')
    revalidatePath('/application')
    
    return { success: true }
}
