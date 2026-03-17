import { createClient } from '@/utils/supabase/server'
import { SimpleAccordion } from '@/components/ui/custom-accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Clock, CalendarDays, MapPin } from 'lucide-react'
import { UNIVERSITY_INFO } from '@/lib/constants'

export default async function QAPage() {
    const supabase = await createClient()
    const { data: qaItems } = await supabase
        .from('qa_items')
        .select('*')
        .order('display_order', { ascending: true })

    const faqItems = qaItems?.map(item => ({
        title: item.question,
        content: item.answer
    })) || []

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-12">
            {/* Header Section */}
            <div className="text-center space-y-4 py-8">
                <h1 className="text-3xl font-bold tracking-tight">よくあるご質問・お問い合わせ</h1>
                <p className="text-muted-foreground text-lg">
                    入学試験や出願に関するご質問とその回答を掲載しています。
                </p>
            </div>

            {/* FAQ Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">よくあるご質問 (Q&A)</h2>
                <Card>
                    <CardContent className="pt-6">
                        <SimpleAccordion items={faqItems} />
                    </CardContent>
                </Card>
            </section>

            {/* Contact Info Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">お問い合わせ窓口</h2>
                <p className="text-muted-foreground text-lg">
                    その他のお問い合わせ先は以下の通りです。
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-primary" />
                                お電話でのお問い合わせ
                            </CardTitle>
                            <CardDescription>{UNIVERSITY_INFO.contactName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-2xl font-bold text-primary">{UNIVERSITY_INFO.phone}</div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>受付時間: {UNIVERSITY_INFO.hoursPhoneReception}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>休業日: {UNIVERSITY_INFO.holidays}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                メールでのお問い合わせ
                            </CardTitle>
                            <CardDescription>{UNIVERSITY_INFO.hoursEmailReception}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-lg font-medium">{UNIVERSITY_INFO.email}</div>
                            <div className="text-sm text-muted-foreground">
                                <p>{UNIVERSITY_INFO.note1}</p>
                                <p>{UNIVERSITY_INFO.note2}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-muted/50 border-none">
                    <CardContent className="flex items-start gap-4 p-6">
                        <MapPin className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
                        <div className="text-sm text-muted-foreground">
                            <strong>{UNIVERSITY_INFO.nameKanji}</strong><br />
                            〒{UNIVERSITY_INFO.postalCode} {UNIVERSITY_INFO.prefecture}{UNIVERSITY_INFO.townArea}{UNIVERSITY_INFO.building}<br />
                            アクセス: {UNIVERSITY_INFO.accessInfo}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
