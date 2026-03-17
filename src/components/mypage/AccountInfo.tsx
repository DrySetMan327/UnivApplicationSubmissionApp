'use client'

interface AccountInfoProps {
    userName: string
    email: string
    createdAt: string
}

export function AccountInfo({ userName, email, createdAt }: AccountInfoProps) {

    return (
        <div className="grid grid-cols-[140px_1fr] gap-4 text-sm items-center">
            <div className="text-muted-foreground font-medium">ユーザー名</div>
            <div className="font-medium">{userName}</div>

            <div className="text-muted-foreground font-medium">メールアドレス</div>
            <div className="font-medium">{email}</div>

            <div className="text-muted-foreground font-medium">パスワード</div>
            <div className="font-medium">●●●●●●●●</div>

            <div className="text-muted-foreground font-medium">アカウント登録日時</div>
            <div className="font-medium">{createdAt}</div>
        </div>
    )
}
