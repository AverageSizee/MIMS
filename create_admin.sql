-- ==========================================
-- SEED DEFAULT MANAGER ACCOUNT
-- ==========================================

-- This will create a default admin user.
-- Email: admin@mims.com
-- Password: adminpassword

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@mims.com',
    crypt('adminpassword', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "System Admin", "role": "manager"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
);

-- Note: Our database trigger "on_auth_user_created" will automatically 
-- create the linked profile in the "profiles" table for this user!
