-- Migración flexible para el sistema de autenticación de falleros
-- Ejecutar en Supabase SQL Editor DESPUÉS de ejecutar quick_check.sql

-- 1. Añadir campos de autenticación a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS has_temp_password BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 2. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);

-- 3. Crear tabla de logs de autenticación
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vista de usuarios con permiso de login - VERSIÓN FLEXIBLE
-- Esta vista intentará diferentes nombres posibles para el campo de categoría

-- Opción 1: Intentar con category_id (snake_case)
DO $$
BEGIN
    BEGIN
        EXECUTE 'DROP VIEW IF EXISTS users_with_login_permission';
        EXECUTE 'CREATE OR REPLACE VIEW users_with_login_permission AS
        SELECT 
            u.id,
            u.name,
            u.surname,
            u.email,
            u.dni,
            u.birth_year,
            c.name as category_name,
            u.has_temp_password,
            u.last_login,
            u.login_attempts,
            u.locked_until
        FROM users u
        LEFT JOIN categories c ON u.category_id = c.id
        WHERE c.name IN (''Juvenil'', ''Adulto'', ''Jubilado'')
            AND u.email IS NOT NULL
            AND u.dni IS NOT NULL
            AND u.birth_year IS NOT NULL';
        
        RAISE NOTICE 'Vista creada con category_id';
    EXCEPTION WHEN undefined_column THEN
        -- Si falla, intentar con categoryId (camelCase)
        BEGIN
            EXECUTE 'DROP VIEW IF EXISTS users_with_login_permission';
            EXECUTE 'CREATE OR REPLACE VIEW users_with_login_permission AS
            SELECT 
                u.id,
                u.name,
                u.surname,
                u.email,
                u.dni,
                u.birth_year,
                c.name as category_name,
                u.has_temp_password,
                u.last_login,
                u.login_attempts,
                u.locked_until
            FROM users u
            LEFT JOIN categories c ON u.categoryId = c.id
            WHERE c.name IN (''Juvenil'', ''Adulto'', ''Jubilado'')
                AND u.email IS NOT NULL
                AND u.dni IS NOT NULL
                AND u.birth_year IS NOT NULL';
            
            RAISE NOTICE 'Vista creada con categoryId';
        EXCEPTION WHEN undefined_column THEN
            -- Si también falla, crear vista sin relación con categorías
            EXECUTE 'DROP VIEW IF EXISTS users_with_login_permission';
            EXECUTE 'CREATE OR REPLACE VIEW users_with_login_permission AS
            SELECT 
                u.id,
                u.name,
                u.surname,
                u.email,
                u.dni,
                u.birth_year,
                NULL as category_name,
                u.has_temp_password,
                u.last_login,
                u.login_attempts,
                u.locked_until
            FROM users u
            WHERE u.email IS NOT NULL
                AND u.dni IS NOT NULL
                AND u.birth_year IS NOT NULL';
            
            RAISE NOTICE 'Vista creada sin relación de categorías';
        END;
    END;
END $$;

-- 5. Estadísticas de autenticación
CREATE OR REPLACE VIEW auth_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN password_hash IS NOT NULL THEN 1 END) as users_with_password,
    COUNT(CASE WHEN has_temp_password = TRUE THEN 1 END) as users_with_temp_password,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
    COUNT(CASE WHEN locked_until > NOW() THEN 1 END) as locked_users
FROM users_with_login_permission;

-- 6. Función para resetear intentos de login
CREATE OR REPLACE FUNCTION reset_login_attempts(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET login_attempts = 0, 
        locked_until = NULL 
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para incrementar intentos fallidos
CREATE OR REPLACE FUNCTION increment_login_attempts(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    attempts INTEGER;
    max_attempts INTEGER := 3;
BEGIN
    UPDATE users 
    SET login_attempts = login_attempts + 1,
        locked_until = CASE 
            WHEN (login_attempts + 1) >= max_attempts 
            THEN NOW() + INTERVAL '15 minutes'
            ELSE NULL
        END
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 8. Habilitar RLS para auth_logs
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de seguridad
CREATE POLICY IF NOT EXISTS "Users can view own auth logs" ON auth_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "System can insert auth logs" ON auth_logs
    FOR INSERT WITH CHECK (true);

-- 10. Verificación final
SELECT 'Migración completada exitosamente' as status;
