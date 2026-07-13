-- Create custom types
CREATE TYPE category AS ENUM ('Essentials', 'Lifestyle', 'Investments', 'Savings', 'Miscellaneous');
CREATE TYPE transaction_status AS ENUM ('Auto-categorized', 'Manual', 'Subscription', 'Recurring', 'Pending');
CREATE TYPE recommendation_type AS ENUM ('insight', 'warning', 'alert');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  monthly_income NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create monthly_plans table
CREATE TABLE public.monthly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  income NUMERIC DEFAULT 0 NOT NULL,
  allocated_essentials NUMERIC DEFAULT 0 NOT NULL,
  allocated_investments NUMERIC DEFAULT 0 NOT NULL,
  allocated_savings NUMERIC DEFAULT 0 NOT NULL,
  allocated_lifestyle NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, month, year)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  monthly_plan_id UUID REFERENCES public.monthly_plans(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  merchant TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category category NOT NULL,
  status transaction_status DEFAULT 'Pending' NOT NULL,
  is_planned BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create savings_buckets table
CREATE TABLE public.savings_buckets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0 NOT NULL,
  color TEXT NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type recommendation_type NOT NULL,
  action TEXT NOT NULL,
  is_applied BOOLEAN DEFAULT false NOT NULL,
  is_rejected BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own monthly plans." ON public.monthly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own transactions." ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own buckets." ON public.savings_buckets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own recommendations." ON public.recommendations FOR ALL USING (auth.uid() = user_id);

-- Create trigger for handling updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER monthly_plans_updated_at BEFORE UPDATE ON public.monthly_plans FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER savings_buckets_updated_at BEFORE UPDATE ON public.savings_buckets FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
