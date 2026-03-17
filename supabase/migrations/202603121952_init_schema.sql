-- 0. Reset schema
drop table if exists public.application_profiles cascade;
drop table if exists public.applications cascade;
drop table if exists public.exam_schedules cascade;
drop table if exists public.application_units cascade;
drop table if exists public.courses cascade;
drop table if exists public.departments cascade;
drop table if exists public.faculties cascade;
drop table if exists public.exam_sites cascade;
drop table if exists public.exam_dates cascade;
drop table if exists public.exam_types cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.prefectures cascade;
drop table if exists public.qa_items cascade;

-- Common triggers and functions for updated_at of each table
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 1. prefectures (Master Data)
create table prefectures (
  code char(2) primary key,
  name text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table prefectures enable row level security;
create policy "Prefectures are viewable by everyone." on prefectures for select using (true);

-- 2. qa_items (Master Data)
create table qa_items (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    answer text not null,
    display_order integer not null default 0,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table qa_items enable row level security;
create policy "QA items are viewable by everyone." on qa_items for select using (true);

-- 3. user_profiles
create table user_profiles (
  id uuid references auth.users not null primary key,
  user_name text,
  last_name_kanji text,
  first_name_kanji text,
  last_name_kana text,
  first_name_kana text,
  birth_date date,
  postal_code text,
  prefecture_code char(2) references prefectures(code),
  city text,
  town_area text,
  building_room text,
  phone_number_1 text,
  phone_number_2 text,
  high_school_name text,
  graduation_date date,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  deleted_at timestamptz,
  constraint username_length check (char_length(user_name) >= 1)
);

alter table user_profiles enable row level security;
create policy "Users can view own profile." on user_profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile." on user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on user_profiles for update using (auth.uid() = id);

drop trigger if exists before_user_profiles_update_set_updated_at on public.user_profiles;
create trigger before_user_profiles_update_set_updated_at
  before update on public.user_profiles for each row execute function public.set_updated_at();

-- 4. exam_types (Master Data)
create table exam_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  application_start_date timestamptz not null,
  application_end_date timestamptz not null,
  mailing_start_date timestamptz,
  mailing_end_date timestamptz,
  payment_start_date timestamptz,
  payment_end_date timestamptz,
  result_announcement_date timestamptz,
  fee integer not null,
  display_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  check (application_start_date <= application_end_date),
  check (
    mailing_start_date is null
    or mailing_end_date is null
    or mailing_start_date <= mailing_end_date
  ),
  check (
    payment_start_date is null
    or payment_end_date is null
    or payment_start_date <= payment_end_date
  ),
  check (fee >= 0)
);

alter table exam_types enable row level security;
create policy "Exam types are viewable by everyone." on exam_types for select using (true);

drop trigger if exists before_exam_types_update_set_updated_at on public.exam_types;
create trigger before_exam_types_update_set_updated_at
  before update on public.exam_types for each row execute function public.set_updated_at();

-- 5. faculties, departments, courses (Master Data)
create table faculties (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table faculties enable row level security;
create policy "Faculties viewable by everyone." on faculties for select using (true);

create table departments (
  id uuid default gen_random_uuid() primary key,
  faculty_id uuid references faculties(id), -- Nullable per requirement
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table departments enable row level security;
create policy "Departments viewable by everyone." on departments for select using (true);

create table courses (
  id uuid default gen_random_uuid() primary key,
  department_id uuid references departments(id), -- Nullable per requirement
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table courses enable row level security;
create policy "Courses viewable by everyone." on courses for select using (true);

-- 6. application_units (Master Data)
create table application_units (
  id uuid default gen_random_uuid() primary key,
  exam_type_id uuid references exam_types(id) not null,
  faculty_id uuid references faculties(id), -- Nullable
  department_id uuid references departments(id), -- Nullable
  course_id uuid references courses(id), -- Nullable
  display_notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (exam_type_id, faculty_id, department_id, course_id)
);

alter table application_units enable row level security;
create policy "Application units viewable by everyone." on application_units for select using (true);

-- 7. exam_dates, exam_sites, exam_schedules (Master Data)
create table exam_dates (
  id uuid default gen_random_uuid() primary key,
  exam_date date not null unique,
  display_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table exam_dates enable row level security;
create policy "Exam dates viewable by everyone." on exam_dates for select using (true);

create table exam_sites (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  display_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table exam_sites enable row level security;
create policy "Exam sites viewable by everyone." on exam_sites for select using (true);

create table exam_schedules (
  id uuid default gen_random_uuid() primary key,
  exam_type_id uuid references exam_types(id) not null,
  exam_date_id uuid references exam_dates(id), -- Nullable
  exam_site_id uuid references exam_sites(id), -- Nullable
  display_notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (exam_type_id, exam_date_id, exam_site_id)
);

alter table exam_schedules enable row level security;
create policy "Exam schedules viewable by everyone." on exam_schedules for select using (true);

-- 8. applications
create table applications (
  id uuid default gen_random_uuid() primary key,
  application_number text not null
    unique check (application_number ~ '^[0-9]{8}$'), -- Generated by trigger function
  user_id uuid references user_profiles(id) not null,
  application_units_id uuid references application_units(id) not null,
  exam_schedule_id uuid references exam_schedules(id) not null,
  submitted_at timestamptz default timezone('utc'::text, now()),
  status text not null
    check (status in ('submitted', 'cancelled', 'accepted', 'rejected')) default 'submitted',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table applications enable row level security;
create policy "Users can see their own applications." on applications for select using (auth.uid() = user_id);
create policy "Users can insert their own applications." on applications for insert with check (auth.uid() = user_id);
create policy "Users can update their own applications." on applications for update using (auth.uid() = user_id);

drop trigger if exists before_applications_update_set_updated_at on public.applications;
create trigger before_applications_update_set_updated_at
  before update on public.applications for each row execute function public.set_updated_at();

-- 9. application_profiles
create table application_profiles (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) not null unique,
  user_name text,
  last_name_kanji text,
  first_name_kanji text,
  last_name_kana text,
  first_name_kana text,
  birth_date date,
  postal_code text,
  prefecture_code char(2) references prefectures(code),
  city text,
  town_area text,
  building_room text,
  phone_number_1 text,
  phone_number_2 text,
  high_school_name text,
  graduation_date date,
  registered_at timestamptz default timezone('utc'::text, now()) not null
);

alter table application_profiles enable row level security;
create policy "Users can see their own applicant profiles." on application_profiles
  for select using (
    exists (
      select 1 from applications a
      where a.id = application_profiles.application_id
      and a.user_id = auth.uid()
    )
  );
create policy "Users can insert their own applicant profiles." on application_profiles
  for insert with check (
    exists (
      select 1 from applications a
      where a.id = application_profiles.application_id
      and a.user_id = auth.uid()
    )
  );
create policy "Users can update their own applicant profiles." on application_profiles
  for update using (
    exists (
      select 1 from applications a
      where a.id = application_profiles.application_id
      and a.user_id = auth.uid()
    )
  );

---------------------------------------
-- Following: triggers and functions --
---------------------------------------

-- Triggers and Functions for Authenticated User Registration
create or replace function public.init_profiles_on_user_created()
returns trigger as $$
begin
  insert into public.user_profiles (id, user_name)
  values (new.id, new.raw_user_meta_data->>'user_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists after_auth_user_created on auth.users;
create trigger after_auth_user_created
  after insert on auth.users
  for each row execute function public.init_profiles_on_user_created();

-- Triggers and Functions for Authenticated User Registration
create sequence application_number_seq
start 1;

create or replace function generate_application_number()
returns text as $$
declare
  seq_num bigint;
begin
  seq_num := nextval('application_number_seq');
  return lpad(seq_num::text, 8, '0');
end;
$$ language plpgsql;

create or replace function set_application_number()
returns trigger as $$
begin
  if new.application_number is null then
    new.application_number := generate_application_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists before_insert_set_application_number on public.applications;
create trigger before_insert_set_application_number
before insert on public.applications
for each row execute function public.set_application_number();

---------------------------------------
--       Following: indexes         --
---------------------------------------

create index idx_applications_user_id
on applications(user_id);