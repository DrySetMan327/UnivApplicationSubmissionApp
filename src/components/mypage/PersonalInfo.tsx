import { Prefecture, UserProfile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PersonalInfoProps {
    profile: UserProfile
    prefectures: Prefecture[]
    className?: string
}

export function PersonalInfo({ profile, prefectures, className }: PersonalInfoProps) {
    const prefectureName = prefectures.find(p => p.code === profile.prefecture_code)?.name || profile.prefecture_code
    
    // 郵便番号を分割表示（7桁前提）
    const postalStr = profile.postal_code || '       ';
    const postal1 = postalStr.length >= 3 ? postalStr.substring(0, 3) : '';
    const postal2 = postalStr.length >= 7 ? postalStr.substring(3, 7) : (postalStr.length > 3 ? postalStr.substring(3) : '');

    return (
        <div className={cn("grid grid-cols-[140px_1fr] gap-4 text-sm", className)}>
            <div className="text-muted-foreground font-medium">氏名（漢字）</div>
            <div className="font-medium">
                {(profile.last_name_kanji || profile.first_name_kanji) 
                    ? `${profile.last_name_kanji || ''} ${profile.first_name_kanji || ''}` 
                    : '-'}
            </div>

            <div className="text-muted-foreground font-medium">氏名（カナ）</div>
            <div className="font-medium">
                {(profile.last_name_kana || profile.first_name_kana) 
                    ? `${profile.last_name_kana || ''} ${profile.first_name_kana || ''}` 
                    : '-'}
            </div>

            <div className="text-muted-foreground font-medium">生年月日</div>
            <div className="font-medium">{profile.birth_date || '-'}</div>

            <div className="text-muted-foreground font-medium">住所</div>
            <div className="font-medium leading-relaxed">
                {profile.postal_code && <>〒{postal1}-{postal2}<br /></>}
                {prefectureName || ''} {profile.city || ''} {profile.town_area || ''}<br />
                {profile.building_room && <>{profile.building_room}</>}
                {(!profile.prefecture_code && !profile.city && !profile.town_area) && '-'}
            </div>

            <div className="text-muted-foreground font-medium">出身高校名称</div>
            <div className="font-medium">{profile.high_school_name || '-'}</div>
            
            <div className="text-muted-foreground font-medium">卒業（見込）年月日</div>
            <div className="font-medium">{profile.graduation_date || '-'}</div>

            <div className="text-muted-foreground font-medium">電話番号1</div>
            <div className="font-medium">{profile.phone_number_1 || '-'}</div>

            <div className="text-muted-foreground font-medium">電話番号2</div>
            <div className="font-medium">{profile.phone_number_2 || '-'}</div>
        </div>
    )
}
