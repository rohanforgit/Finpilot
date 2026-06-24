-- FINPILOT AI DATABASE INITIALIZATION MIGRATION
-- Target Database: Supabase PostgreSQL (Postgres 15+)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (User metadata & state)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  onboarded boolean not null default false,
  health_score integer not null default 100 check (health_score >= 0 and health_score <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 2. SECURITY DEFINER HELPERS (To avoid RLS infinite recursion)
create or replace function public.check_user_is_admin()
returns boolean as $$
declare
  v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  return (v_role = 'admin');
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Allow select of own profile" on public.profiles
  for select using (auth.uid() = id or public.check_user_is_admin());

create policy "Allow update of own profile" on public.profiles
  for update using (auth.uid() = id or public.check_user_is_admin());

create policy "Allow admins complete control" on public.profiles
  for all using (public.check_user_is_admin());

-- 3. INCOME SOURCES
create table public.income_sources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_name text not null, -- 'salary', 'spouse_salary', 'rental', 'freelance', 'other'
  amount numeric(15, 2) not null check (amount >= 0),
  frequency text not null default 'monthly' check (frequency in ('monthly', 'annually', 'one-off')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.income_sources enable row level security;

create policy "Incomes RLS Policy" on public.income_sources
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 4. ASSETS
create table public.assets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  asset_name text not null,
  asset_type text not null check (asset_type in ('cash', 'bank_account', 'fixed_deposit', 'mutual_fund', 'stock', 'gold', 'epf', 'real_estate')),
  current_value numeric(15, 2) not null check (current_value >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.assets enable row level security;

create policy "Assets RLS Policy" on public.assets
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 5. LIABILITIES
create table public.liabilities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  liability_name text not null,
  liability_type text not null check (liability_type in ('credit_card', 'personal_loan', 'vehicle_loan', 'home_loan', 'education_loan')),
  outstanding_amount numeric(15, 2) not null check (outstanding_amount >= 0),
  interest_rate numeric(5, 2) not null check (interest_rate >= 0),
  emi numeric(15, 2) not null check (emi >= 0),
  remaining_tenure_months integer not null check (remaining_tenure_months >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.liabilities enable row level security;

create policy "Liabilities RLS Policy" on public.liabilities
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 6. OCR UPLOADS
create table public.ocr_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_path text not null,
  status text not null default 'processing' check (status in ('processing', 'success', 'failed')),
  extracted_data jsonb,
  processing_time_ms integer,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ocr_uploads enable row level security;

create policy "OCR Uploads RLS Policy" on public.ocr_uploads
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 7. EXPENSES
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  merchant_name text not null,
  amount numeric(15, 2) not null check (amount >= 0),
  date date not null,
  time text,
  category text not null check (category in ('food', 'shopping', 'transport', 'bills', 'entertainment', 'health', 'education', 'others')),
  ocr_upload_id uuid references public.ocr_uploads(id) on delete set null,
  is_manual_corrected boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.expenses enable row level security;

create policy "Expenses RLS Policy" on public.expenses
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 8. GOALS
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_name text not null,
  goal_type text not null check (goal_type in ('bike', 'car', 'house', 'vacation', 'education', 'custom')),
  target_amount numeric(15, 2) not null check (target_amount > 0),
  current_progress numeric(15, 2) not null default 0 check (current_progress >= 0),
  required_monthly_savings numeric(15, 2) not null default 0 check (required_monthly_savings >= 0),
  target_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.goals enable row level security;

create policy "Goals RLS Policy" on public.goals
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 9. GOAL CONTRIBUTIONS
create table public.goal_contributions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade not null,
  amount numeric(15, 2) not null check (amount > 0),
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goal_contributions enable row level security;

create policy "Goal Contributions RLS Policy" on public.goal_contributions
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 10. BUDGET PLANS
create table public.budget_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null check (year >= 2000),
  needs_budget numeric(15, 2) not null check (needs_budget >= 0),
  wants_budget numeric(15, 2) not null check (wants_budget >= 0),
  savings_budget numeric(15, 2) not null check (savings_budget >= 0),
  investments_budget numeric(15, 2) not null check (investments_budget >= 0),
  emergency_fund_allocation numeric(15, 2) not null check (emergency_fund_allocation >= 0),
  goal_contributions_budget numeric(15, 2) not null check (goal_contributions_budget >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budget_plans enable row level security;

create policy "Budget Plans RLS Policy" on public.budget_plans
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 11. OBLIGATIONS
create table public.obligations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  obligation_type text not null check (obligation_type in ('emi', 'insurance', 'credit_card_bill', 'subscription', 'custom')),
  amount numeric(15, 2) not null check (amount >= 0),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.obligations enable row level security;

create policy "Obligations RLS Policy" on public.obligations
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 12. AI REPORTS
create table public.ai_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  analysis_period text not null check (analysis_period in ('monthly', 'weekly', 'adhoc')),
  health_score integer check (health_score >= 0 and health_score <= 100),
  report_data jsonb not null,
  prompt_text text,
  response_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_reports enable row level security;

create policy "AI Reports RLS Policy" on public.ai_reports
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 13. FEEDBACK
create table public.feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comments text,
  category text check (category in ('general', 'bug', 'feature_request', 'design')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

create policy "Feedback RLS Policy" on public.feedback
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 14. ADMIN LOGS
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_logs enable row level security;

create policy "Admin Logs RLS Policy" on public.admin_logs
  for all using (public.check_user_is_admin());

-- 15. AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

create policy "Audit Logs RLS Policy" on public.audit_logs
  for all using (auth.uid() = user_id or public.check_user_is_admin());

-- 16. AUTO-CREATE PROFILE TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, onboarded)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when new.email = 'admin@finpilot.ai' then 'admin' else 'user' end,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 17. DATABASE INDEXES FOR OPTIMAL QUERY PERFORMANCE
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_income_sources_user on public.income_sources(user_id);
create index if not exists idx_assets_user on public.assets(user_id);
create index if not exists idx_liabilities_user on public.liabilities(user_id);
create index if not exists idx_expenses_user_date on public.expenses(user_id, date);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_obligations_user_due on public.obligations(user_id, due_date);
create index if not exists idx_ocr_uploads_user on public.ocr_uploads(user_id);
create index if not exists idx_ai_reports_user on public.ai_reports(user_id);
