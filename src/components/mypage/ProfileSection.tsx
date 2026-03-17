'use client'

import React, { useState } from 'react'
import { PersonalInfo } from '@/components/mypage/PersonalInfo'
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog'
import { Button } from '@/components/ui/button'
import { Prefecture, UserProfile } from '@/lib/types'

interface ProfileSectionProps {
    initialProfile: UserProfile
    prefectures: Prefecture[]
}

export function ProfileSection({ initialProfile, prefectures }: ProfileSectionProps) {
    const [profile, setProfile] = useState<UserProfile>(initialProfile)
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                    修正する
                </Button>
            </div>
            <PersonalInfo profile={profile} prefectures={prefectures} />
            
            <ProfileEditDialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={profile}
                prefectures={prefectures}
                onSuccess={(updated) => setProfile(updated)}
            />
        </div>
    )
}
