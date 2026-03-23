import * as z from 'zod'

export const KATAKANA_REGEX = /^[ァ-ヶー]+$/;
export const FULLWIDTH_REGEX = /^[^\x01-\x7E\uFF61-\uFF9F]+$/;

export const profileSchema = z.object({
    last_name_kanji: z
        .string()
        .min(1, { message: '姓（漢字）を入力してください' })
        .max(15, { message: '姓（漢字）は15文字以内で入力してください' })
        .regex(FULLWIDTH_REGEX, { message: '全角で入力してください' }),

    first_name_kanji: z
        .string()
        .min(1, { message: '名（漢字）を入力してください' })
        .max(15, { message: '名（漢字）は15文字以内で入力してください' })
        .regex(FULLWIDTH_REGEX, { message: '全角で入力してください' }),

    last_name_kana: z
        .string()
        .min(1, { message: 'セイ（カナ）を入力してください' })
        .max(30, { message: 'セイ（カナ）は30文字以内で入力してください' })
        .regex(KATAKANA_REGEX, { message: '全角のカタカナで入力してください' }),

    first_name_kana: z
        .string()
        .min(1, { message: 'メイ（カナ）を入力してください' })
        .max(30, { message: 'メイ（カナ）は30文字以内で入力してください' })
        .regex(KATAKANA_REGEX, { message: '全角のカタカナで入力してください' }),

    birth_date: z
        .string()
        .min(1, { message: '生年月日を入力してください' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'YYYY-MM-DD形式で入力してください' }),

    postal_code_1: z
        .string()
        .length(3, { message: '3桁で入力してください' })
        .regex(/^\d+$/, { message: '半角数字のみ入力可能です' }),

    postal_code_2: z
        .string()
        .length(4, { message: '4桁で入力してください' })
        .regex(/^\d+$/, { message: '半角数字のみ入力可能です' }),

    prefecture_code: z.string().min(1, { message: '都道府県を選択してください' }),

    city: z
        .string()
        .min(1, { message: '市区町村を入力してください' })
        .max(30, { message: '市区町村は30文字以内で入力してください' })
        .regex(FULLWIDTH_REGEX, { message: '全角文字で入力してください' }),

    town_area: z
        .string()
        .min(1, { message: '町名・番地を入力してください' })
        .max(50, { message: '町名・番地は50文字以内で入力してください' })
        .regex(FULLWIDTH_REGEX, { message: '全角文字で入力してください' }),

    building_room: z
        .string()
        .max(50, { message: '建物名・部屋番号は50文字以内で入力してください' })
        .optional()
        .refine(val => !val || FULLWIDTH_REGEX.test(val), {
            message: '全角文字で入力してください',
        }),

    high_school_name: z
        .string()
        .min(1, { message: '出身高校名称を入力してください' })
        .max(30, { message: '出身高校名称は30文字以内で入力してください' })
        .regex(FULLWIDTH_REGEX, { message: '全角文字で入力してください' }),

    graduation_date: z
        .string()
        .min(1, { message: '卒業（見込）年月日を入力してください' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'YYYY-MM-DD形式で入力してください' }),

    phone_number_1: z
        .string()
        .min(1, { message: '電話番号1を入力してください' })
        .regex(/^\d{10,11}$/, {
            message: 'ハイフンなしの半角数字10桁または11桁で入力してください',
        }),

    phone_number_2: z
        .string()
        .optional()
        .refine(
            val => !val || /^\d{10,11}$/.test(val),
            { message: 'ハイフンなしの半角数字10桁または11桁で入力してください' }
        ),
});

export type ProfileData = z.infer<typeof profileSchema>
