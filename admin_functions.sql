-- ==========================================
-- SECURE ADMIN FUNCTIONS (RPC)
-- ==========================================

-- This function allows Managers to securely delete a user account from the system.
-- It deletes the user from the secure "auth.users" table, which will automatically
-- cascade and delete their profile from the "profiles" table.

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- 1. Security Check: Ensure the person trying to run this is actually a Manager
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'manager' THEN
    RAISE EXCEPTION 'Unauthorized: Only managers can delete accounts.';
  END IF;

  -- 2. Delete the user from the Supabase auth system
  DELETE FROM auth.users WHERE id = target_user_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
