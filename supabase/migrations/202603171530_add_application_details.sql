-- 202603171530_add_application_details.sql
-- Create application_details table to store a snapshot of exam details at the time of application

create table public.application_details (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications(id) not null unique,
  
  -- Snapshot of Exam Type information
  exam_type_name text not null,
  fee integer not null,
  application_start_date timestamptz,
  application_end_date timestamptz,
  mailing_start_date timestamptz,
  mailing_end_date timestamptz,
  payment_start_date timestamptz,
  payment_end_date timestamptz,
  result_announcement_date timestamptz,
  
  -- Snapshot of Application Unit / Schedule information
  faculty_name text,
  department_name text,
  course_name text,
  exam_date date,
  exam_site_name text,
  
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.application_details enable row level security;

create policy "Users can view their own application details."
  on public.application_details
  for select
  using (
    exists (
      select 1 from public.applications a
      where a.id = application_details.application_id
      and a.user_id = auth.uid()
    )
  );

create policy "Users can insert their own application details."
  on public.application_details
  for insert
  with check (
    exists (
      select 1 from public.applications a
      where a.id = application_details.application_id
      and a.user_id = auth.uid()
    )
  );

-- No update/delete policy needed as this is a snapshot table 
