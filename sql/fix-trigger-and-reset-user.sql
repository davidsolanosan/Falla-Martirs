-- ============================================================
-- FIX: trigger legado + reseteo de cuenta davidsolanosan
-- ============================================================
-- El trigger log_auth_attempt() referencia NEW.password_hash,
-- columna ya eliminada -> cualquier UPDATE a users falla con:
--   ERROR 42703: record "new" has no field "password_hash"
--
-- Este script lo recrea usando password_changed_at y resetea
-- la cuenta del administrador a contraseña inicial.
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor -> "without RLS"
-- ============================================================

-- 1. Recrear el trigger sin la columna eliminada
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

        -- Cambio de contraseña detectado por password_changed_at
        IF NEW.password_changed_at IS NOT NULL AND OLD.password_changed_at IS DISTINCT FROM NEW.password_changed_at THEN
            INSERT INTO auth_logs (user_id, action, success)
            VALUES (NEW.id, 'password_change', TRUE);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Resetear la cuenta de davidsolanosan a contraseña inicial
--    (DNI + año de nacimiento = 24368437Y1976)
DELETE FROM public.user_credentials
WHERE user_id = 'ff2b088e-864b-4b96-b7ef-b556896639db';

UPDATE public.users SET
  first_login = true,
  has_temp_password = true,
  password_reset_token = null,
  password_reset_expires = null
WHERE id = 'ff2b088e-864b-4b96-b7ef-b556896639db';
