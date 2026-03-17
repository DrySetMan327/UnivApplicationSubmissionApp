import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import { Prefecture } from '@/lib/types'

export default async function ProfilePage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Middleware should handle redirect, but redundancy provided for safety
    if (!user) {
        redirect('/login')
    }

    // 2. Check if profile exists and serves as a guard
    // We check if a required field (e.g., last_name_kanji) is filled, since the row itself
    // might exist from the signup trigger.
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, last_name_kanji')
        .eq('id', user.id)
        .single()

    if (profile && profile.last_name_kanji) {
        // Already registered, redirect to home
        redirect('/')
    }

    // 3. Fetch prefectures
    const { data: prefectures } = await supabase
        .from('prefectures')
        .select('*')
        .order('code')

    return <ProfileForm prefectures={(prefectures as Prefecture[]) || []} />
}
