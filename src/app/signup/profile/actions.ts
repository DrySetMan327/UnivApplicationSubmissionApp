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
        last_name_kanji: formData.get('last_name_kanji')?.toString().trim() || null,
        first_name_kanji: formData.get('first_name_kanji')?.toString().trim() || null,
        last_name_kana: formData.get('last_name_kana')?.toString().trim() || null,
        first_name_kana: formData.get('first_name_kana')?.toString().trim() || null,
        birth_date: formData.get('birth_date')?.toString().trim() || null,
        postal_code: (formData.get('postal_code_1')?.toString().trim() || '') + (formData.get('postal_code_2')?.toString().trim() || ''),
        prefecture_code: formData.get('prefecture_code')?.toString().trim() || null,
        city: formData.get('city')?.toString().trim() || null,
        town_area: formData.get('town_area')?.toString().trim() || null,
        building_room: formData.get('building_room')?.toString().trim() || null,
        high_school_name: formData.get('high_school_name')?.toString().trim() || null,
        graduation_date: formData.get('graduation_date')?.toString().trim() || null,
        phone_number_1: formData.get('phone_number_1')?.toString().trim() || null,
        phone_number_2: formData.get('phone_number_2')?.toString().trim() || null,
    }

    // Validate on server side as well (basic check)
    if (!profileData.last_name_kanji || !profileData.first_name_kanji || !profileData.prefecture_code || !profileData.graduation_date) {
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
