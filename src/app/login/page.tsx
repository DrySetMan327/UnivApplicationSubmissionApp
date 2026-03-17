'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { Eye, EyeOff } from 'lucide-react'

// Schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'メールアドレスの形式が正しくありません' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
})

const registerSchema = z.object({
  username: z.string().min(1, { message: 'ユーザー名を入力してください' }),
  email: z.string().email({ message: 'メールアドレスの形式が正しくありません' }),
  emailConfirm: z.string().email({ message: 'メールアドレスの形式が正しくありません' }),
  password: z.string()
    .min(8, { message: 'パスワードは8文字以上20文字以内で入力してください' })
    .max(20, { message: 'パスワードは8文字以上20文字以内で入力してください' })
    .refine((value) => {
      const conditions = [
        /[a-z]/.test(value),
        /[A-Z]/.test(value),
        /\d/.test(value),
        /[!-/:-@[-`{-~]/.test(value),
      ]
      return conditions.filter(Boolean).length >= 2
    }, {
      message: 'パスワードは英小文字・英大文字・半角数字・半角記号のうち、2種類以上を含めてください',
    }),
}).refine((data) => data.email === data.emailConfirm, {
  message: "メールアドレスが一致しません",
  path: ["emailConfirm"],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

// ... imports
import { useRouter, useSearchParams } from 'next/navigation'

// ... (keep Schema and other code unchanged)

function LoginPageContent() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setMessage({ type: 'success', text: 'アカウント仮登録が完了しました！' })
    }
  }, [searchParams])

  // Forms
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  })

  // Register form with watch mode for real-time validation visualization
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const passwordValue = registerForm.watch('password', '')

  const getPasswordStrength = (password: string) => {
    if (!password) return 0
    let score = 0
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!-/:-@[-`{-~]/.test(password)) score++
    return score
  }

  const strength = getPasswordStrength(passwordValue)

  const onLoginSubmit = async (data: LoginData) => {
    setMessage(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    try {
      const result = await login(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: 'アカウントが見つかりません。入力内容に誤りがないか確認してください。' })
      } else {
        router.push('/?login_success=true')
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: '予期せぬエラーが発生しました。' })
    }
  }

  const onRegisterSubmit = async (data: RegisterData) => {
    setMessage(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('full_name', data.username)

    try {
      const result = await signup(formData)
      if (result?.error) {
        console.error(result.error)
        setMessage({ type: 'error', text: '登録に失敗しました。入力された内容で既にアカウントが登録されている可能性があります。' })
      } else {
        // Success
        setMessage({ type: 'success', text: '登録確認用メールを送信しました。送信されたメール内の本登録用リンクから登録を完了してください。' })
        router.push('/signup/check-email')
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: '登録に失敗しました。予期せぬエラーが発生しました。' })
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setMessage(null)
    setShowPassword(false)
    loginForm.reset()
    registerForm.reset()
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLoginMode ? 'ログイン' : '新規登録'}</CardTitle>
          <CardDescription>
            {isLoginMode
              ? '本出願サイトに登録済みのアカウントのメールアドレスとパスワードを入力してログインしてください。'
              : '出願に必要な情報を入力してアカウントを作成してください。'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={`mb-4 ${message.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : ""}`}>
              {message.type === 'error' ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircledIcon className="h-4 w-4" />}
              <AlertTitle>{message.type === 'error' ? 'エラー' : '送信完了'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {isLoginMode ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">メールアドレス</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  {...loginForm.register('email')}
                  className={loginForm.formState.errors.email ? "border-red-500" : ""}
                />
                {loginForm.formState.errors.email && <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">パスワード</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register('password')}
                    className={`pr-10 ${loginForm.formState.errors.password ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 px-0 py-0 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">パスワードを表示</span>
                  </Button>
                </div>
                {loginForm.formState.errors.password && <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>}
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? '処理中...' : 'ログイン'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">または</span></div>
                </div>

                <Button type="button" onClick={toggleMode} variant="outline" className="w-full">
                  新規登録
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium leading-none">ユーザー名（ニックネーム）</label>
                <Input
                  id="username"
                  type="text"
                  placeholder="受験 太郎"
                  {...registerForm.register('username')}
                  className={registerForm.formState.errors.username ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.username && <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">メールアドレス</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  {...registerForm.register('email')}
                  className={registerForm.formState.errors.email ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.email && <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="emailConfirm" className="text-sm font-medium leading-none">メールアドレス（確認用）</label>
                <Input
                  id="emailConfirm"
                  type="email"
                  placeholder="example@example.com"
                  {...registerForm.register('emailConfirm')}
                  className={registerForm.formState.errors.emailConfirm ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.emailConfirm && <p className="text-sm text-red-500">{registerForm.formState.errors.emailConfirm.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">パスワード</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...registerForm.register('password')}
                    className={`pr-10 ${registerForm.formState.errors.password ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 px-0 py-0 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">パスワードを表示</span>
                  </Button>
                </div>

                {/* Password Strength Meter - Only for Registration */}
                {passwordValue.length > 0 && strength >= 2 && (
                  <div className="pt-1 space-y-1">
                    <div className="flex space-x-1 h-1.5 w-full">
                      <div className={`flex-1 rounded-full bg-red-500`} />
                      <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-yellow-500' : 'bg-muted'}`} />
                      <div className={`flex-1 rounded-full ${strength === 4 ? 'bg-green-500' : 'bg-muted'}`} />
                    </div>
                    <p className="text-xs text-right font-medium">
                      強度: <span className={`${strength === 4 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {strength === 4 ? '高' : strength >= 3 ? '中' : '小'}
                      </span>
                    </p>
                  </div>
                )}

                {registerForm.formState.errors.password && <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>}
                <p className="text-xs text-muted-foreground">※半角8~20文字 （英小文字、英大文字、数字、記号のみ使用可）</p>
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                  {registerForm.formState.isSubmitting ? '処理中...' : '確認用メールを送信'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">または</span></div>
                </div>

                <Button type="button" onClick={toggleMode} variant="outline" className="w-full">
                  既にアカウントをお持ちの方はコチラ
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
