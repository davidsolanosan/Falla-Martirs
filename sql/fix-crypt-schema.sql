-- ============================================================
-- FIX: crypt() no encontrada (error 42883)
-- ============================================================
-- En Supabase, pgcrypto se instala en el esquema "extensions",
-- no en "public". app_check_password() la llamaba sin calificar
-- y con search_path=public no la encontraba:
--   ERROR 42883: function crypt(text, text) does not exist
--
-- Síntoma: las contraseñas iniciales (DNI+año) funcionan porque
-- son comparación directa, pero TODA credencial con hash bcrypt
-- falla la verificación.
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor -> "without RLS"
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.app_check_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN extensions.crypt(p_password, replace(p_hash, '$2b$', '$2a$')) = replace(p_hash, '$2b$', '$2a$');
END;
$$;
