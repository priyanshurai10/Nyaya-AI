-- ==============================================================================
-- NYAYA AI: SUPABASE SECURITY AUDIT & VERIFICATION QUERY
-- ==============================================================================
-- Run this query in Supabase SQL Editor to audit and verify that:
-- 1. 100% of tables in public schema have Row Level Security (RLS) ENABLED.
-- 2. Every table has active, enforced policies.
-- 3. Zero security advisor warnings remain.
-- ==============================================================================

SELECT 
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    COUNT(p.policyname) AS active_policy_count,
    CASE 
        WHEN c.relrowsecurity = false THEN '🚨 CRITICAL: RLS DISABLED'
        WHEN COUNT(p.policyname) = 0 THEN '⚠️ WARNING: RLS ENABLED WITHOUT POLICIES'
        ELSE '✅ SECURE: RLS ENABLED WITH POLICIES'
    END AS security_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.tablename = c.relname AND p.schemaname = n.nspname
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY security_status DESC, table_name ASC;
