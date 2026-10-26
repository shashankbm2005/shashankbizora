-- ==============================================================================
-- BIZORA - Supabase PostgreSQL Database Schema
-- Table: customer_enquiries
-- Description: Production lead management and appointment capture for BIZORA
-- Compatible with both publishable key (anon) and secret key (service_role)
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create customer_enquiries table
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    requested_service VARCHAR(100) NOT NULL,
    project_description TEXT NOT NULL,
    budget_range VARCHAR(80),
    preferred_contact_method VARCHAR(20) NOT NULL DEFAULT 'whatsapp' CHECK (preferred_contact_method IN ('whatsapp', 'phone')),
    consent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost')),
    internal_notes TEXT DEFAULT '',
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Automatic timestamp updater function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_customer_enquiries_updated_at ON public.customer_enquiries;
CREATE TRIGGER trigger_customer_enquiries_updated_at
    BEFORE UPDATE ON public.customer_enquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Performance and Query Indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.customer_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.customer_enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.customer_enquiries (phone);
CREATE INDEX IF NOT EXISTS idx_enquiries_service ON public.customer_enquiries (requested_service);
CREATE INDEX IF NOT EXISTS idx_enquiries_reference ON public.customer_enquiries (reference_id);

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public enquiry and appointment submissions
DROP POLICY IF EXISTS "Allow public enquiry insert" ON public.customer_enquiries;
CREATE POLICY "Allow public enquiry insert"
    ON public.customer_enquiries
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

-- Allow reading customer enquiries
DROP POLICY IF EXISTS "Allow reading enquiries" ON public.customer_enquiries;
CREATE POLICY "Allow reading enquiries"
    ON public.customer_enquiries
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

-- Allow updating enquiry status and internal notes
DROP POLICY IF EXISTS "Allow updating enquiries" ON public.customer_enquiries;
CREATE POLICY "Allow updating enquiries"
    ON public.customer_enquiries
    FOR UPDATE
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- 7. Verification Query
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'customer_enquiries';
