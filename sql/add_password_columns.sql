-- Columnas que el código escribe pero que faltan en public.users.
-- Sin ellas, changePassword falla con PGRST204 y la contraseña nunca se guarda.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_login boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz;

-- Quien ya tiene contraseña personalizada (password_hash) no está en primer login
UPDATE public.users
SET first_login = false
WHERE password_hash IS NOT NULL;
