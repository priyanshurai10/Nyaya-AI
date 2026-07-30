-- ==============================================================================
-- NYAYA AI: SUPABASE PRODUCTION SECURITY MIGRATION & RLS POLICY ENFORCEMENT
-- ==============================================================================
-- Date: 2026-07-30
-- Description: Enable Row Level Security (RLS) across all public schema tables
--              and enforce strict role-based access control (RBAC).
--
-- Security Rules:
-- 1. Authenticated users can only read, insert, update, or delete their own data.
-- 2. Anonymous users have ZERO access to sensitive user data, chats, payments, or documents.
-- 3. Super Admin (priyanshurai121111@gmail.com) has full administrative visibility & management.
-- 4. Public lookup tables (courts, judges, guides, laws, courses, lessons) are read-only for public access.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: DYNAMICALLY ENABLE RLS ON ALL TABLES IN THE PUBLIC SCHEMA
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 2: DROP EXISTING INSECURE OR DUPLICATE POLICIES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 3: CREATE SECURE POLICIES FOR USER MANAGEMENT & AUTHENTICATION
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE POLICY "users_select_own_or_admin" ON public.users FOR SELECT TO authenticated
            USING (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
        
        CREATE POLICY "users_insert_own_or_service" ON public.users FOR INSERT TO authenticated, service_role
            WITH CHECK (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR auth.role() = 'service_role');
        
        CREATE POLICY "users_update_own_or_admin" ON public.users FOR UPDATE TO authenticated
            USING (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
        
        CREATE POLICY "users_delete_own_or_admin" ON public.users FOR DELETE TO authenticated
            USING (id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') THEN
        CREATE POLICY "User_select_own_or_admin" ON public."User" FOR SELECT TO authenticated
            USING (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
        
        CREATE POLICY "User_insert_own_or_service" ON public."User" FOR INSERT TO authenticated, service_role
            WITH CHECK (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR auth.role() = 'service_role');
        
        CREATE POLICY "User_update_own_or_admin" ON public."User" FOR UPDATE TO authenticated
            USING (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK (id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
        
        CREATE POLICY "User_delete_own_or_admin" ON public."User" FOR DELETE TO authenticated
            USING (id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        CREATE POLICY "user_profiles_select_own_or_admin" ON public.user_profiles FOR SELECT TO authenticated
            USING (id::text = auth.uid()::text OR user_identifier = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT TO authenticated, service_role
            WITH CHECK (id::text = auth.uid()::text OR user_identifier = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE TO authenticated
            USING (id::text = auth.uid()::text OR user_identifier = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 4: CREATE SECURE POLICIES FOR AI LEGAL CHAT & CONVERSATIONS
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_sessions') THEN
        CREATE POLICY "chat_sessions_select_own_or_admin" ON public.chat_sessions FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR user_id IS NULL OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "chat_sessions_insert_own" ON public.chat_sessions FOR INSERT TO authenticated, service_role
            WITH CHECK (user_id::text = auth.uid()::text OR user_id IS NULL OR auth.role() = 'service_role');
            
        CREATE POLICY "chat_sessions_update_own" ON public.chat_sessions FOR UPDATE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "chat_sessions_delete_own" ON public.chat_sessions FOR DELETE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
        CREATE POLICY "chat_messages_select_own_or_admin" ON public.chat_messages FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_sessions s 
                    WHERE s.id = chat_messages.session_id 
                    AND (s.user_id::text = auth.uid()::text OR s.user_id IS NULL OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
                )
            );
            
        CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT TO authenticated, service_role
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.chat_sessions s 
                    WHERE s.id = chat_messages.session_id 
                    AND (s.user_id::text = auth.uid()::text OR s.user_id IS NULL OR auth.role() = 'service_role')
                )
            );

        CREATE POLICY "chat_messages_delete_own" ON public.chat_messages FOR DELETE TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.chat_sessions s 
                    WHERE s.id = chat_messages.session_id 
                    AND (s.user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
                )
            );
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 5: CREATE SECURE POLICIES FOR DOCUMENTS & EVIDENCE VAULT
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
        CREATE POLICY "documents_select_own_or_admin" ON public.documents FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "documents_insert_own" ON public.documents FOR INSERT TO authenticated, service_role
            WITH CHECK (user_id::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "documents_update_own" ON public.documents FOR UPDATE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "documents_delete_own" ON public.documents FOR DELETE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_analyses') THEN
        CREATE POLICY "doc_analyses_select_own_or_admin" ON public.document_analyses FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.documents d 
                    WHERE d.id = document_analyses.document_id 
                    AND (d.user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
                )
            );
            
        CREATE POLICY "doc_analyses_insert_own" ON public.document_analyses FOR INSERT TO authenticated, service_role
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.documents d 
                    WHERE d.id = document_analyses.document_id 
                    AND (d.user_id::text = auth.uid()::text OR auth.role() = 'service_role')
                )
            );
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'draft_documents') THEN
        CREATE POLICY "drafts_select_own_or_admin" ON public.draft_documents FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "drafts_insert_own" ON public.draft_documents FOR INSERT TO authenticated, service_role
            WITH CHECK (user_id::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "drafts_update_own" ON public.draft_documents FOR UPDATE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "drafts_delete_own" ON public.draft_documents FOR DELETE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'FileMetadata') THEN
        CREATE POLICY "FileMetadata_select_own_or_admin" ON public."FileMetadata" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "FileMetadata_insert_own" ON public."FileMetadata" FOR INSERT TO authenticated, service_role
            WITH CHECK ("userId"::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "FileMetadata_delete_own" ON public."FileMetadata" FOR DELETE TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 6: CREATE SECURE POLICIES FOR PAYMENTS, TRANSACTIONS & PROOF SCREENSHOTS
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
        CREATE POLICY "transactions_select_own_or_admin" ON public.transactions FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT TO authenticated, service_role
            WITH CHECK (user_id::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "transactions_update_admin" ON public.transactions FOR UPDATE TO authenticated
            USING ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Transaction') THEN
        CREATE POLICY "Transaction_select_own_or_admin" ON public."Transaction" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "Transaction_insert_own" ON public."Transaction" FOR INSERT TO authenticated, service_role
            WITH CHECK ("userId"::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "Transaction_update_admin" ON public."Transaction" FOR UPDATE TO authenticated
            USING ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Payment') THEN
        CREATE POLICY "Payment_select_own_or_admin" ON public."Payment" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "Payment_insert_own" ON public."Payment" FOR INSERT TO authenticated, service_role
            WITH CHECK ("userId"::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR auth.role() = 'service_role');
            
        CREATE POLICY "Payment_update_admin" ON public."Payment" FOR UPDATE TO authenticated
            USING ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'PaymentScreenshot') THEN
        CREATE POLICY "PaymentScreenshot_select_own_or_admin" ON public."PaymentScreenshot" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "PaymentScreenshot_insert_own" ON public."PaymentScreenshot" FOR INSERT TO authenticated, service_role
            WITH CHECK ("userId"::text = auth.uid()::text OR auth.role() = 'service_role');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 7: CREATE SECURE POLICIES FOR CONSULTATIONS & APPOINTMENTS
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consultation_requests') THEN
        CREATE POLICY "consultations_select_own_or_admin" ON public.consultation_requests FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "consultations_insert_own" ON public.consultation_requests FOR INSERT TO authenticated, service_role
            WITH CHECK (user_id::text = auth.uid()::text OR email = auth.jwt() ->> 'email' OR auth.role() = 'service_role');
            
        CREATE POLICY "consultations_update_own_or_admin" ON public.consultation_requests FOR UPDATE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Consultation') THEN
        CREATE POLICY "Consultation_select_own_or_admin" ON public."Consultation" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "Consultation_insert_own" ON public."Consultation" FOR INSERT TO authenticated, service_role
            WITH CHECK ("userId"::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "Consultation_update_own_or_admin" ON public."Consultation" FOR UPDATE TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ConsultationSchedule') THEN
        CREATE POLICY "ConsultationSchedule_select_own_or_admin" ON public."ConsultationSchedule" FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public."Consultation" c 
                    WHERE c.id = "ConsultationSchedule"."consultationId" 
                    AND (c."userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
                )
            );
            
        CREATE POLICY "ConsultationSchedule_admin_manage" ON public."ConsultationSchedule" FOR ALL TO authenticated
            USING ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ConsultationHistory') THEN
        CREATE POLICY "ConsultationHistory_select_own_or_admin" ON public."ConsultationHistory" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "ConsultationHistory_admin_manage" ON public."ConsultationHistory" FOR ALL TO authenticated
            USING ((auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointments') THEN
        CREATE POLICY "appointments_select_own_or_admin" ON public.appointments FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT TO authenticated, service_role
            WITH CHECK (user_id::text = auth.uid()::text OR auth.role() = 'service_role');
            
        CREATE POLICY "appointments_update_own_or_admin" ON public.appointments FOR UPDATE TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 8: CREATE SECURE POLICIES FOR NOTIFICATIONS, ACTIVITY & PROGRESS
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
            USING (user_id::text = auth.uid()::text);
            
        CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated
            USING (user_id::text = auth.uid()::text);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Notification') THEN
        CREATE POLICY "Notification_select_own" ON public."Notification" FOR SELECT TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com');
            
        CREATE POLICY "Notification_update_own" ON public."Notification" FOR UPDATE TO authenticated
            USING ("userId"::text = auth.uid()::text);
            
        CREATE POLICY "Notification_delete_own" ON public."Notification" FOR DELETE TO authenticated
            USING ("userId"::text = auth.uid()::text);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserProgress') THEN
        CREATE POLICY "UserProgress_all_own" ON public."UserProgress" FOR ALL TO authenticated
            USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK ("userId"::text = auth.uid()::text);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_progress') THEN
        CREATE POLICY "user_progress_all_own" ON public.user_progress FOR ALL TO authenticated
            USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> 'email') = 'priyanshurai121111@gmail.com')
            WITH CHECK (user_id::text = auth.uid()::text);
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 9: DYNAMIC CATCH-ALL FOR 100% TABLE SECURITY COVERAGE
-- ------------------------------------------------------------------------------
-- Automatically attaches secure RLS policies to ANY remaining table in public schema
-- so that ZERO tables remain with "RLS ENABLED WITHOUT POLICIES".

DO $$
DECLARE
    tbl RECORD;
    has_user_id BOOLEAN;
    has_userId BOOLEAN;
    has_email BOOLEAN;
    is_public_ref BOOLEAN;
    pol_count INT;
BEGIN
    FOR tbl IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        -- Count active policies on this table
        SELECT COUNT(*) INTO pol_count 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = tbl.tablename;

        -- If zero policies exist for this table, dynamically add policies!
        IF pol_count = 0 THEN
            -- Check if it is a public reference table
            is_public_ref := tbl.tablename IN (
                'courses', 'lessons', 'knowledge_articles', 'landmark_judgments', 
                'courts', 'judges', 'police_stations', 'legal_aid_centres', 
                'consumer_forums', 'location_pincodes', 'Lawyer', 'lawyers', 'advocates'
            );

            IF is_public_ref THEN
                -- Public READ policy for anon and authenticated
                EXECUTE format('
                    CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true);
                ', tbl.tablename || '_public_select', tbl.tablename);
                
                -- Admin ALL policy
                EXECUTE format('
                    CREATE POLICY %I ON public.%I FOR ALL TO authenticated, service_role 
                    USING ((auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'' OR auth.role() = ''service_role'')
                    WITH CHECK ((auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'' OR auth.role() = ''service_role'');
                ', tbl.tablename || '_admin_all', tbl.tablename);
            ELSE
                -- Inspect column structure
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = tbl.tablename AND column_name = 'user_id'
                ) INTO has_user_id;

                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = tbl.tablename AND column_name = 'userId'
                ) INTO has_userId;

                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = tbl.tablename AND column_name = 'email'
                ) INTO has_email;

                IF has_user_id THEN
                    EXECUTE format('
                        CREATE POLICY %I ON public.%I FOR SELECT TO authenticated 
                        USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                        CREATE POLICY %I ON public.%I FOR INSERT TO authenticated, service_role 
                        WITH CHECK (user_id::text = auth.uid()::text OR auth.role() = ''service_role'');
                        CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated 
                        USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                        CREATE POLICY %I ON public.%I FOR DELETE TO authenticated 
                        USING (user_id::text = auth.uid()::text OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                    ', 
                    tbl.tablename || '_select_own', tbl.tablename,
                    tbl.tablename || '_insert_own', tbl.tablename,
                    tbl.tablename || '_update_own', tbl.tablename,
                    tbl.tablename || '_delete_own', tbl.tablename);
                ELSIF has_userId THEN
                    EXECUTE format('
                        CREATE POLICY %I ON public.%I FOR SELECT TO authenticated 
                        USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                        CREATE POLICY %I ON public.%I FOR INSERT TO authenticated, service_role 
                        WITH CHECK ("userId"::text = auth.uid()::text OR auth.role() = ''service_role'');
                        CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated 
                        USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                        CREATE POLICY %I ON public.%I FOR DELETE TO authenticated 
                        USING ("userId"::text = auth.uid()::text OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                    ', 
                    tbl.tablename || '_select_own', tbl.tablename,
                    tbl.tablename || '_insert_own', tbl.tablename,
                    tbl.tablename || '_update_own', tbl.tablename,
                    tbl.tablename || '_delete_own', tbl.tablename);
                ELSIF has_email THEN
                    EXECUTE format('
                        CREATE POLICY %I ON public.%I FOR SELECT TO authenticated 
                        USING (email = auth.jwt() ->> ''email'' OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                        CREATE POLICY %I ON public.%I FOR INSERT TO authenticated, service_role 
                        WITH CHECK (email = auth.jwt() ->> ''email'' OR auth.role() = ''service_role'');
                        CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated 
                        USING (email = auth.jwt() ->> ''email'' OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                        CREATE POLICY %I ON public.%I FOR DELETE TO authenticated 
                        USING (email = auth.jwt() ->> ''email'' OR (auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'');
                    ', 
                    tbl.tablename || '_select_own', tbl.tablename,
                    tbl.tablename || '_insert_own', tbl.tablename,
                    tbl.tablename || '_update_own', tbl.tablename,
                    tbl.tablename || '_delete_own', tbl.tablename);
                ELSE
                    -- Default fallback: Admin & Service Role access only
                    EXECUTE format('
                        CREATE POLICY %I ON public.%I FOR ALL TO authenticated, service_role 
                        USING ((auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'' OR auth.role() = ''service_role'')
                        WITH CHECK ((auth.jwt() ->> ''email'') = ''priyanshurai121111@gmail.com'' OR auth.role() = ''service_role'');
                    ', tbl.tablename || '_admin_fallback', tbl.tablename);
                END IF;
            END IF;
        END IF;
    END LOOP;
END $$;
