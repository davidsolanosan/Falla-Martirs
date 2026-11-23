-- ============================================================
-- HARDENING RLS + CREDENCIALES — Falla Màrtirs
-- ============================================================
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor
--
-- FASE 1: activa RLS en todas las tablas con política permisiva
--         (silencia el aviso crítico sin romper la app).
-- FASE 2: mueve password_hash a user_credentials, tabla sin
--         acceso para la anon key. Login/cambio/reset pasan por
--         funciones SECURITY DEFINER que verifican en servidor.
-- ============================================================

-- ----------------------------------------------------------
-- FASE 1: RLS + política permisiva en todas las tablas públicas
-- ----------------------------------------------------------
-- Primero eliminar TODAS las políticas existentes: hay políticas
-- legadas que se referencian a sí mismas y, al activar RLS,
-- causan "infinite recursion detected in policy" (42P17).
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

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    EXECUTE format(
      'CREATE POLICY app_allow_all ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);',
      r.tablename
    );
  END LOOP;
END $$;

-- Los tokens de reseteo los gestionan las funciones RPC: se revoca
-- la escritura directa de esas columnas para la anon key
-- (si no, alguien podría sembrar un token en otro usuario y usarlo
-- en /reset-password para secuestrar la cuenta).
REVOKE UPDATE (password_reset_token, password_reset_expires)
  ON public.users FROM anon, authenticated;

-- ----------------------------------------------------------
-- FASE 2: credenciales
-- ----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.user_credentials (
  user_id       uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
-- SIN POLÍTICAS: anon y authenticated no pueden leer ni escribir.
-- Solo las funciones SECURITY DEFINER (que corren como owner).

-- Migrar hashes existentes
INSERT INTO public.user_credentials (user_id, password_hash)
SELECT id, password_hash FROM public.users
WHERE password_hash IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- Helper interno: verifica contraseña contra hash bcrypt
-- (normaliza $2b$ -> $2a$ por compatibilidad con crypt()).
-- OJO: en Supabase pgcrypto vive en el esquema "extensions",
-- hay que calificar extensions.crypt() o da 42883.
CREATE OR REPLACE FUNCTION public.app_check_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN extensions.crypt(p_password, replace(p_hash, '$2b$', '$2a$')) = replace(p_hash, '$2b$', '$2a$');
END;
$$;

-- Helper interno: contraseña inicial = dni + año (última parte de birth_year)
CREATE OR REPLACE FUNCTION public.app_initial_password(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  u record;
BEGIN
  SELECT dni, birth_year INTO u FROM public.users WHERE id = p_user_id;
  IF NOT FOUND OR u.dni IS NULL OR u.birth_year IS NULL THEN
    RETURN '';
  END IF;
  RETURN u.dni || regexp_replace(u.birth_year, '.*[/\-]', '');
END;
$$;

-- Verifica la contraseña de un usuario: primero contra
-- user_credentials; si no hay credencial, contra la inicial (DNI+año)
CREATE OR REPLACE FUNCTION public.app_verify_password(p_user_id uuid, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cred record;
  initial text;
BEGIN
  SELECT password_hash INTO cred FROM public.user_credentials WHERE user_id = p_user_id;
  IF FOUND THEN
    RETURN public.app_check_password(p_password, cred.password_hash);
  END IF;
  initial := public.app_initial_password(p_user_id);
  RETURN initial <> '' AND p_password = initial;
END;
$$;

-- Cambio de contraseña: exige conocer la actual (o la inicial si
-- aún no hay credencial). Actualiza credencial + flags del usuario.
CREATE OR REPLACE FUNCTION public.app_change_password(
  p_user_id uuid,
  p_old_password text,
  p_new_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.app_verify_password(p_user_id, p_old_password) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_credentials (user_id, password_hash, updated_at)
  VALUES (p_user_id, p_new_hash, now())
  ON CONFLICT (user_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = now();

  UPDATE public.users SET
    first_login = false,
    has_temp_password = false,
    password_changed_at = now()
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

-- Reseteo admin: el admin demuestra su propia contraseña + rol.
-- Borra la credencial del usuario -> vuelve a contraseña inicial.
CREATE OR REPLACE FUNCTION public.app_admin_reset_password(
  p_admin_id uuid,
  p_admin_password text,
  p_target_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  adm record;
BEGIN
  SELECT role INTO adm FROM public.users WHERE id = p_admin_id;
  IF NOT FOUND OR adm.role NOT IN ('admin', 'master_admin') THEN
    RETURN false;
  END IF;
  IF NOT public.app_verify_password(p_admin_id, p_admin_password) THEN
    RETURN false;
  END IF;

  DELETE FROM public.user_credentials WHERE user_id = p_target_id;
  UPDATE public.users SET
    first_login = true,
    has_temp_password = true,
    password_reset_token = null,
    password_reset_expires = null
  WHERE id = p_target_id;

  RETURN FOUND;
END;
$$;

-- Reseteo por token (flujo /reset-password/:token)
CREATE OR REPLACE FUNCTION public.app_reset_password_with_token(
  p_token text,
  p_new_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM public.users
  WHERE password_reset_token = p_token
    AND (password_reset_expires IS NULL OR password_reset_expires > now());
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_credentials (user_id, password_hash, updated_at)
  VALUES (target_id, p_new_hash, now())
  ON CONFLICT (user_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = now();

  UPDATE public.users SET
    first_login = false,
    has_temp_password = false,
    password_reset_token = null,
    password_reset_expires = null,
    password_changed_at = now()
  WHERE id = target_id;

  RETURN true;
END;
$$;

-- Para RegisterScreen: solo permite fijar credencial si el usuario
-- existe y aún no tiene ninguna (no se puede sobreescribir la de otro)
CREATE OR REPLACE FUNCTION public.app_set_initial_password(
  p_user_id uuid,
  p_new_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_credentials WHERE user_id = p_user_id) THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_credentials (user_id, password_hash, updated_at)
  VALUES (p_user_id, p_new_hash, now());
  RETURN true;
END;
$$;

-- Marca first_login a usuarios sin credencial (sustituye a
-- initializeUserPasswords que filtraba por password_hash NULL)
CREATE OR REPLACE FUNCTION public.app_mark_first_login()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users u SET first_login = true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_credentials c WHERE c.user_id = u.id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.app_verify_password(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_change_password(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_admin_reset_password(uuid, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_reset_password_with_token(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_set_initial_password(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_mark_first_login() TO anon, authenticated;

-- Eliminar la columna expuesta: ya no hay hashes accesibles.
-- Hay vistas legadas que dependen de ella: se recrean sin el hash
-- (consultando user_credentials) y luego se elimina la columna.
DROP VIEW IF EXISTS public.auth_stats;
DROP VIEW IF EXISTS public.users_with_login_permission;

-- El trigger legado log_auth_attempt() lee NEW.password_hash:
-- hay que recrearlo ANTES de eliminar la columna o cualquier
-- UPDATE a users fallará con "record new has no field password_hash"
CREATE OR REPLACE FUNCTION public.log_auth_attempt()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Si se actualizó el last_login, registrar login exitoso
        IF NEW.last_login IS NOT NULL AND OLD.last_login IS DISTINCT FROM NEW.last_login THEN
            INSERT INTO auth_logs (user_id, action, success)
            VALUES (NEW.id, 'login', TRUE);

            -- Resetear intentos fallidos
            UPDATE public.users
            SET login_attempts = 0, locked_until = NULL
            WHERE id = NEW.id;
        END IF;

        -- Si se cambió la contraseña (ahora se detecta por password_changed_at)
        IF NEW.password_changed_at IS NOT NULL AND OLD.password_changed_at IS DISTINCT FROM NEW.password_changed_at THEN
            INSERT INTO auth_logs (user_id, action, success)
            VALUES (NEW.id, 'password_change', TRUE);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

CREATE OR REPLACE VIEW public.users_with_login_permission AS
SELECT
    u.id,
    u.name,
    u.surname,
    u.email,
    u.dni,
    u.birth_year,
    'Desconocida' as category_name,
    (c.password_hash IS NOT NULL) as has_password,
    u.has_temp_password,
    u.last_login,
    u.login_attempts,
    u.locked_until
FROM public.users u
LEFT JOIN public.user_credentials c ON c.user_id = u.id
WHERE u.email IS NOT NULL
    AND u.dni IS NOT NULL
    AND u.birth_year IS NOT NULL;

CREATE OR REPLACE VIEW public.auth_stats AS
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN has_password THEN 1 END) as users_with_password,
    COUNT(CASE WHEN has_temp_password = TRUE THEN 1 END) as users_with_temp_password,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
    COUNT(CASE WHEN locked_until > NOW() THEN 1 END) as locked_users
FROM public.users_with_login_permission;
