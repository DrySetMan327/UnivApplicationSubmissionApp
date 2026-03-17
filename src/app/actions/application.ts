'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelApplication(applicationId: string) {
  const supabase = await createClient()

  try {
    // 1. Check current status
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single()

    if (fetchError || !app) {
      return { success: false, error: '出願データの取得に失敗しました。' }
    }

    // 2. Validate status (only 'submitted' or 'rejected' can be cancelled)
    if (app.status === 'accepted') {
      return { success: false, error: '受理済みの出願は取り消しできません。' }
    }
    if (app.status === 'cancelled') {
        return { success: false, error: 'この出願は既に取り消されています。' }
    }

    // 3. Update status to 'cancelled'
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'cancelled' })
      .eq('id', applicationId)

    if (updateError) {
      return { success: false, error: '出願の取り消しに失敗しました。' }
    }

    revalidatePath('/mypage')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling application:', error)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}
