-- ==========================================
-- SUPABASE MIGRATION: AUTH & AUDITING
-- ==========================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trigger to automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Add created_by and updated_by to all tables
ALTER TABLE public.materials 
  ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.suppliers 
  ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.deliveries 
  ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.issuances 
  ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.returns 
  ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
