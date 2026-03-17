'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error)
    return { error: 'Login failed' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: formData.get('full_name') as string,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/signup/profile`,
    }
  })

  if (error) {
    console.error('Signup error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
