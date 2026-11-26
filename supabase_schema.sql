-- ==============================================================================
-- ADIOS MANAGEMENT SUITE - SUPABASE CLOUD DATABASE SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It creates the complete schema for users, product licenses, orders, sync channels,
-- automated triggers, Row Level Security (RLS) policies, and admin access roles.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS / PROFILES TABLE
-- Mirrors supabase auth.users and supports local profile data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'customer', 'tester', 'admin', 'super_admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 3. PRODUCT LICENSES & PERPETUAL KEYS TABLE
CREATE TABLE IF NOT EXISTS public.product_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    license_key TEXT UNIQUE NOT NULL,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('free', 'personal_pro', 'hospital_enterprise', 'hotel_enterprise', 'billing_pos', 'academics_enterprise', 'enterprise_pack', 'tester_grant')),
    product_suite TEXT NOT NULL CHECK (product_suite IN ('ALL', 'PERSONAL', 'HOSPITAL', 'HOTEL', 'BILLING', 'ACADEMICS')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    hardware_fingerprint TEXT,
    max_activations INT NOT NULL DEFAULT 3,
    current_activations INT NOT NULL DEFAULT 0,
    issued_by TEXT NOT NULL DEFAULT 'ADIOS Admin System',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMPTZ -- NULL means lifetime perpetual key
);

ALTER TABLE public.product_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own issued licenses"
    ON public.product_licenses FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Admins have full access to licenses"
    ON public.product_licenses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 4. ORDERS & PAYMENTS (UPI UTR / Transactions) TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    utr_number TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Verification' CHECK (status IN ('Pending Verification', 'Approved & Key Issued', 'Rejected')),
    issued_license_key TEXT REFERENCES public.product_licenses(license_key) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 5. MULTI-DEVICE ENCRYPTED SYNC SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sync_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    hardware_uuid TEXT NOT NULL,
    app_version TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, hardware_uuid)
);

ALTER TABLE public.sync_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync devices"
    ON public.sync_devices FOR ALL
    USING (auth.uid() = user_id);

-- 6. AUTOMATIC PROFILE CREATION ON USER SIGNUP (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. INITIAL SAMPLE DATA & ADMIN PRE-SEED
-- When configuring a fresh database, you can promote the admin user by running:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'jcsayan7@gmail.com';
