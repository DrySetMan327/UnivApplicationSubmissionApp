import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationList } from '@/components/mypage/ApplicationList'
import { Prefecture, UserProfile } from '@/lib/types'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch applications
  let applications: any[] = []
  let profile: any = null
  let prefectures: Prefecture[] = []

  try {
    const [appsResult, profileResult, prefResult] = await Promise.all([
      supabase
        .from('applications')
        .select(`
          *, 
          application_details(*),
          application_profiles(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('prefectures')
        .select('*')
        .order('code')
    ])

    if (appsResult.data) applications = appsResult.data
    if (profileResult.data) profile = profileResult.data
    if (prefResult.data) prefectures = prefResult.data as Prefecture[]

  } catch (e) {
    console.warn("Fetch failed or no credentials", e)
  }

  return (
    <ApplicationList 
      initialApplications={applications} 
      user={user} 
      profile={profile as UserProfile} 
      prefectures={prefectures} 
    />
  )
}
