-- ============================================================
-- FIX URGENTE: políticas legadas con recursión infinita
-- ============================================================
-- Tras activar RLS, políticas antiguas de la tabla users que se
-- referencian a sí mismas causan:
--   ERROR 42P17: infinite recursion detected in policy
-- y TODA consulta a users (y tablas relacionadas) falla con 500.
--
-- Este script elimina TODAS las políticas existentes y recrea
-- solo la permisiva app_allow_all.
-- EXCEPCIÓN: user_credentials queda SIN políticas (privada).
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor -> "without RLS"
-- ============================================================

-- 1. Eliminar todas las políticas existentes en el esquema public
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 2. Recrear la política permisiva en todas las tablas públicas
--    EXCEPTO user_credentials (debe quedar inaccesible para anon)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'user_credentials'
  LOOP
    EXECUTE format(
      'CREATE POLICY app_allow_all ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);',
      r.tablename
    );
  END LOOP;
END $$;
