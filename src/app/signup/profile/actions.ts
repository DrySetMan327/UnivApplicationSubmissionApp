'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitProfile(state: any, formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: '認証エラーが発生しました。再度ログインしてください。' }
    }

    const profileData = {
        // user_name is already set during signup trigger, so we don't update it here unless we want to allow editing.
        // Requirement says user_name comes from signup form. So we just update the rest.
        last_name_kanji: formData.get('last_name_kanji') as string | null,
        first_name_kanji: formData.get('first_name_kanji') as string | null,
        last_name_kana: formData.get('last_name_kana') as string | null,
        first_name_kana: formData.get('first_name_kana') as string | null,
        birth_date: formData.get('birth_date') as string | null,
        postal_code: (formData.get('postal_code_1') as string) + (formData.get('postal_code_2') as string || ''),
        prefecture_code: formData.get('prefecture_code') as string | null,
        city: formData.get('city') as string | null,
        town_area: formData.get('town_area') as string | null,
        building_room: formData.get('building_room') as string | null,
        high_school_name: formData.get('high_school_name') as string | null,
        graduation_date: formData.get('graduation_date') as string | null,
        phone_number_1: formData.get('phone_number_1') as string | null,
        phone_number_2: formData.get('phone_number_2') as string | null,
    }

    // Validate on server side as well (basic check)
    if (!profileData.last_name_kanji || !profileData.first_name_kanji || !profileData.prefecture_code) {
        return { error: '必須項目が未入力です。' }
    }

    const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', user.id)

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'プロフィールの保存に失敗しました。時間をおいて再度お試しください。' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
