import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle>メールをご確認ください</CardTitle>
          <CardDescription>
            アカウント本登録のご案内用メールを送信しました。<br />
            メール内のURLリンク先画面から本登録を完了してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
            <p>※メールが届かない場合は、迷惑メールフォルダをご確認いただくか、しばらく経ってから再度お試しください。</p>
          </div>
          <div className="pt-2">
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">ログインページへ戻る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
