# UnivApplicationSubmissionApp

## プロジェクト概要

一般的な大学入試を想定した出願申し込みWebアプリケーションのモックアップです。  
エンドユーザーである受験生が、出願申し込み、並びに、受験に係る諸々の手続きや確認操作を
快適に行うことができるアプリケーション（Web出願サイト）を目指します。  

## 使用技術

- **Frontend Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript 5
- **UI/Styling**: Tailwind CSS 4, Radix UI, Lucide React
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form, Zod
- **Backend/Database**: Supabase
- **Package Manager**: npm (Node.js v22 recommended)

## 機能一覧

### 既に実装済みの機能

- 受験生ユーザーのアカウント作成（メール認証・本登録フロー対応）
- 受験生本人の属性情報（プロフィール）の登録・修正機能
- 出願可能な入試種別と各日程情報の一覧確認（TOP画面）
- 出願申し込み（入試種別、学部、試験日などの志望情報と受験生本人情報の登録：確認ステップ付き）
- マイページ（アカウント情報、本人情報、出願状況の確認）
- 出願取消機能（モダンな確認ダイアログとトースト通知UI）
- FAQ（Q&A）ページの実装
- 外部サイト（大学公式サイト等）へのナビゲーションリンク

### 今後実装したい機能

- 入学検定料の決済～入金状態のステータス管理
- 出願写真や必要書類等のファイルアップロード
- 受験票のダウンロード
- サイト内キーワード検索（ヘッダー上の検索窓UIのみ実装済み）

## ER図

```mermaid

erDiagram

    users（SupabaseAuth上のユーザーマスタ） {
    uuid id PK "ユーザーID"
    * * "その他の項目は記載省略"
    }

    user_profiles（ユーザー本人情報マスタ） {
        uuid id PK,FK "ユーザーID"
        text user_name "ユーザー名"
        text last_name_kanji "姓（漢字）"
        text first_name_kanji "名（漢字）"
        text last_name_kana "姓（カナ）"
        text first_name_kana "名（カナ）"
        date birth_date "生年月日"
        text postal_code "郵便番号"
        text prefecture_code FK "都道府県コード"
        text city "市区町村"
        text town_area "町域名"
        text building_room "建物名・部屋番号"
        text phone_number_1 "電話番号1"
        text phone_number_2 "電話番号2"
        text high_school_name "高等学校名"
        date graduation_date "卒業（見込み）年月日"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
        timestamp deleted_at "退会日時"
    }

    prefectures（都道府県マスタ） {
        text code PK "都道府県コード"
        text name "都道府県名"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    qa_items（FAQマスタ） {
        uuid id PK "FAQ ID"
        text question "質問文"
        text answer "回答文"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

```

</br>

```mermaid

erDiagram

    applications（出願） {
        uuid id PK "出願ID"
        text application_number "出願番号"
        uuid user_id FK "ユーザーID"
        uuid application_units_id FK "出願申込単位ID"
        uuid exam_schedule_id FK "試験日程ID"
        text status "出願登録ステータス"
        timestamp submitted_at "出願登録完了日時"
        timestamp modified_at "出願内容修正日時"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    application_profiles（出願登録済み本人情報） {
        uuid id PK "出願登録済み本人情報ID"
        uuid application_id FK "出願ID"
        text user_name "ユーザー名"
        text last_name_kanji "姓（漢字）"
        text first_name_kanji "名（漢字）"
        text last_name_kana "姓（カナ）"
        text first_name_kana "名（カナ）"
        date birth_date "生年月日"
        text postal_code "郵便番号"
        text prefecture_code FK "都道府県コード"
        text city "市区町村"
        text town_area "町域名"
        text building_room "建物名・部屋番号"
        text phone_number_1 "電話番号1"
        text phone_number_2 "電話番号2"
        text high_school_name "高等学校名"
        date graduation_date "卒業（見込み）年月日"
        timestamp registered_at "出願登録日時"
    }

    application_details（出願登録済み志望詳細情報） {
        uuid id PK "出願詳細ID"
        uuid application_id FK "出願ID"
        text exam_type_name "入試種別名"
        int fee "検定料"
        datetime application_start_date "出願開始日時"
        datetime application_end_date "出願締切日時"
        datetime mailing_start_date "書類郵送開始日時"
        datetime mailing_end_date "書類郵送締切日時"
        datetime payment_start_date "支払開始日時"
        datetime payment_end_date "支払締切日時"
        datetime result_announcement_date "合格発表日時"
        text faculty_name "学部名"
        text department_name "学科名"
        text course_name "課程・専攻等名"
        date exam_date "試験日"
        text exam_site_name "試験会場名"
        timestamp created_at "作成日時"
    }

    exam_types（入試種別マスタ） {
        uuid id PK "入試種別ID"
        text name "入試種別名"
        datetime application_start_date "出願開始日時"
        datetime application_end_date "出願締切日時"
        datetime mailing_start_date "必要書類受付開始日時"
        datetime mailing_end_date "必要書類受付締切日時"
        datetime payment_start_date "入学検定料支払い開始日時"
        datetime payment_end_date "入学検定料支払い締切日時"
        datetime result_announcement_date "合否発表日時"
        int fee "入学検定料"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

```

</br>

```mermaid

erDiagram

    application_units（出願申込単位マスタ） {
        uuid id PK "出願申込単位ID"
        uuid exam_type_id FK "入試種別ID"
        uuid faculty_id FK "学部ID"
        uuid department_id FK "学科ID"
        uuid course_id FK "課程・専攻等ID"
        text display_notes "画面表示用注釈"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    faculties（学部マスタ） {
        uuid id PK "学部ID"
        text name "学部名"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    departments（学科マスタ） {
        uuid id PK "学科ID"
        uuid faculty_id FK "学部ID"
        text name "学科名"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    courses（課程・専攻等マスタ） {
        uuid id PK "課程・専攻等ID"
        uuid department_id FK "学科ID"
        text name "課程・専攻等名"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

```

</br>

```mermaid

erDiagram

    exam_schedules（試験日程マスタ） {
        uuid id PK "試験日程ID"
        uuid exam_type_id FK "入試種別ID"
        uuid exam_date_id FK "試験日ID"
        uuid exam_site_id FK "試験地ID"
        text display_notes "画面表示用注釈"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    exam_dates（試験日マスタ） {
        uuid id PK "試験日ID"
        date exam_date "試験日"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

    exam_sites（試験地マスタ） {
        uuid id PK "試験地ID"
        text name "試験地名"
        int display_order "表示順"
        timestamp created_at "作成日時"
        timestamp updated_at "更新日時"
    }

```

</br>

```mermaid

erDiagram

    users ||..|| user_profiles: ""
    prefectures ||--o{ user_profiles: ""
    prefectures ||--o{ application_profiles: ""
    user_profiles ||--o{ applications: "出願登録申し込み"
    applications ||--|| application_profiles: "出願時の本人情報スナップショット"
    applications ||--|| application_details: "出願時の志望詳細情報スナップショット"
    application_units ||..o{ applications: "出願時に参照した申込単位マスタ"
    exam_schedules ||..o{ applications: "出願時に参照した試験日程マスタ"

```

</br>

```mermaid

erDiagram

    exam_types ||--o{ application_units: "入試種別ごとの出願申込単位"
    exam_types ||--|{ exam_schedules: "入試種別ごとの試験日程"
    faculties ||--o{ departments: "学部ごとの学科"
    faculties ||--o{ application_units: "出願申込単位に設定される学部"
    departments ||--o{ courses: "学科ごとの課程・専攻等"
    departments |o--o{ application_units: "出願申込単位に設定される学科"
    courses |o--o{ application_units: "出願申込単位に設定される課程・専攻等"
    exam_dates |o--o{ exam_schedules: "試験日程に設定される試験日"
    exam_sites |o--o{ exam_schedules: "試験日程に設定される試験地"

```

## ディレクトリ構成

```text
.
├── src/
│   ├── app/                # App Router (各ページ、API、Server Actions等)
│   │   ├── (auth)/         # 認証関連（ログイン、コールバック等）
│   │   ├── signup/         # 新規アカウント登録
│   │   ├── application/    # 出願登録（メインフロー）
│   │   ├── mypage/         # マイページ
│   │   └── qa/             # Q&Aページ
│   ├── components/         # Reactコンポーネント
│   │   ├── layout/         # ヘッダー等のページレイアウト用コンポーネント
│   │   ├── mypage/         # マイページ用コンポーネント
│   │   ├── profile/        # 本人情報登録ページ用コンポーネント
│   │   └── ui/             # 汎用UI（Alert, Button, Card等）
│   ├── lib/                # スキーマ定義、共通型、ユーティリティ
│   └── utils/              # Supabaseクライアント等の設定
├── supabase/               # ローカル環境上のSupabaseプロジェクト構築用（DB、メールテンプレート等）
├── public/                 # 静的コンテンツ（画像ファイル、プレーンHTML等）
├── next.config.ts          # Next.jsアプリケーションの動作設定用ファイル
├── tsconfig.json           # TypeScriptのコンパイル設定用ファイル
├── postcss.config.mjs      # PostCSSのCSS変換・加工に関する設定用ファイル
├── eslint.config.mjs       # 静的コード解析ツール（ESLint）の設定用ファイル
├── package.json            # プロジェクトの依存関係やnpmスクリプトの設定用ファイル
├── package-lock.json       # インストール済みパッケージの依存関係やバージョン情報の記録用ファイル
├── .gitignore              # Gitバージョン管理除外対象の設定用ファイル
└── README.md               # 本プロジェクトの取扱説明書（本ドキュメント）
```

## 開発環境構築

### 前提条件

- Node.js v22系以上
- npm

### セットアップ手順

1. 本プロジェクトのリポジトリを各自のローカル環境上にクローンします。
2. 必要な外部ライブラリのパッケージ一式（`/node_modules`）をインストールします。

   ```bash
   npm install
   ```

3. プロジェクトルートのディレクトリ直下に `.env.local` ファイルを作成し、Supabaseへの接続情報を設定します。

   ```text
   NEXT_PUBLIC_SUPABASE_URL=各自のSupabaseプロジェクトURL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=各自のSupabase Anon Key
   ```

4. 開発サーバーを起動します。

   ```bash
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスし、アプリケーションが起動していることを確認します。

### トラブルシューティング

- **`Access is denied` エラー (Turbopack)**:
  Windows環境にて `npm run dev` 実行時に権限エラーが発生する場合、`.next` フォルダを削除してから再実行してください。

  ```powershell
  Remove-Item -Recurse -Force .next
  npm run dev
  ```

## 備考

- 本プロジェクトは Vercel へのデプロイを想定しています。
- ローカル環境上のSupabaseに接続（ `npx supabase start` で立ち上げたDockerコンテナを使用）する場合、  
    `/supabase/config.toml` ファイルを編集して認証やメール送信等に関する設定変数を適宜書き換えて使用してください。
