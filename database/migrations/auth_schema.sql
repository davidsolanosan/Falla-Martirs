-- Migración para el sistema de autenticación de falleros
-- Ejecutar en Supabase SQL Editor

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

-- 3. Crear tabla de logs de autenticación (opcional, para auditoría)
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'password_change', 'password_reset'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear función para resetear intentos de login
CREATE OR REPLACE FUNCTION reset_login_attempts(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET login_attempts = 0, 
        locked_until = NULL 
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear función para incrementar intentos de login fallidos
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
    
    -- Obtener el número de intentos actualizados
    SELECT login_attempts INTO attempts 
    FROM users 
    WHERE email = user_email;
    
    -- Si alcanzó el máximo, registrar el bloqueo
    IF attempts >= max_attempts THEN
        INSERT INTO auth_logs (user_id, action, success, error_message)
        SELECT id, 'login', FALSE, 'Account locked due to too many failed attempts'
        FROM users 
        WHERE email = user_email;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para registrar logs de login
CREATE OR REPLACE FUNCTION log_auth_attempt()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Si se actualizó el last_login, registrar login exitoso
        IF NEW.last_login IS NOT NULL AND OLD.last_login IS DISTINCT FROM NEW.last_login THEN
            INSERT INTO auth_logs (user_id, action, success)
            VALUES (NEW.id, 'login', TRUE);
            
            -- Resetear intentos fallidos
            UPDATE users 
            SET login_attempts = 0, locked_until = NULL 
            WHERE id = NEW.id;
        END IF;
        
        -- Si se cambió la contraseña
        IF NEW.password_hash IS NOT NULL AND OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
            INSERT INTO auth_logs (user_id, action, success)
            VALUES (NEW.id, 'password_change', TRUE);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger
DROP TRIGGER IF EXISTS auth_log_trigger ON users;
CREATE TRIGGER auth_log_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_auth_attempt();

-- 8. Políticas de seguridad (RLS) para la tabla auth_logs
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Solo los usuarios pueden ver sus propios logs
CREATE POLICY "Users can view own auth logs" ON auth_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Solo el sistema puede insertar logs
CREATE POLICY "System can insert auth logs" ON auth_logs
    FOR INSERT WITH CHECK (true);

-- 9. Vista de usuarios con permiso de login
CREATE OR REPLACE VIEW users_with_login_permission AS
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
WHERE c.name IN ('Juvenil', 'Adulto', 'Jubilado')
    AND u.email IS NOT NULL
    AND u.dni IS NOT NULL
    AND u.birth_year IS NOT NULL;

-- 10. Estadísticas de autenticación
CREATE OR REPLACE VIEW auth_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN password_hash IS NOT NULL THEN 1 END) as users_with_password,
    COUNT(CASE WHEN has_temp_password = TRUE THEN 1 END) as users_with_temp_password,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
    COUNT(CASE WHEN locked_until > NOW() THEN 1 END) as locked_users
FROM users_with_login_permission;

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de usuarios con campos de autenticación añadidos';
COMMENT ON TABLE auth_logs IS 'Logs de autenticación para auditoría';
COMMENT ON VIEW users_with_login_permission IS 'Usuarios que tienen permiso para hacer login según su categoría';
COMMENT ON VIEW auth_stats IS 'Estadísticas del sistema de autenticación';
