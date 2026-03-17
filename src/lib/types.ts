export interface Prefecture {
    code: string
    name: string
}

export interface ExamType {
    id: string
    name: string
    application_start_date: string
    application_end_date: string
    mailing_start_date: string | null
    mailing_end_date: string | null
    payment_start_date: string | null
    payment_end_date: string | null
    result_announcement_date: string | null
    fee: number
    display_order: number
}

export interface Faculty {
    id: string
    name: string
    display_order: number
}

export interface Department {
    id: string
    faculty_id: string | null
    name: string
    display_order: number
}

export interface Course {
    id: string
    department_id: string | null
    name: string
    display_order: number
}

export interface ExamDate {
    id: string
    exam_date: string
    display_order: number
}

export interface ExamSite {
    id: string
    name: string
    display_order: number
}

export interface ApplicationUnit {
    id: string
    exam_type_id: string
    faculty_id: string | null
    department_id: string | null
    course_id: string | null
    display_notes: string | null
}

export interface ExamSchedule {
    id: string
    exam_type_id: string
    exam_date_id: string | null
    exam_site_id: string | null
    display_notes: string | null
}

export interface UserProfile {
    id: string
    user_name: string | null
    last_name_kanji: string | null
    first_name_kanji: string | null
    last_name_kana: string | null
    first_name_kana: string | null
    birth_date: string | null
    postal_code: string | null
    prefecture_code: string | null
    city: string | null
    town_area: string | null
    building_room: string | null
    phone_number_1: string | null
    phone_number_2: string | null
    high_school_name: string | null
    graduation_date: string | null
    created_at: string
    updated_at: string
}

export interface Application {
    id: string
    application_number: string | null
    user_id: string
    application_units_id: string
    exam_schedule_id: string
    status: string
    created_at: string
    updated_at: string
}
