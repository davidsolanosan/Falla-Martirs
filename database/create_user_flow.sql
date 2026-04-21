-- Flujo para crear usuarios que puedan acceder por primera vez
-- 
-- PASO 1: El usuario ya existe en la tabla users (importado por Excel)
-- PASO 2: Generar contraseña inicial y crear en Supabase Auth
-- PASO 3: Usuario puede hacer login y cambiar contraseña

-- Ejemplo: Usuario importado por Excel
-- INSERT INTO users (email, name, surname, dni, role, birth_year, phone)
-- VALUES ('juan.perez@email.com', 'Juan', 'Perez', '12345678A', 'user', 1985, '600123456');

-- PASO 1: Verificar si el usuario existe en la tabla users
SELECT * FROM users WHERE email = 'juan.perez@email.com';

-- PASO 2: Generar contraseña temporal segura
-- Esto se haría desde la aplicación con el PasswordGenerator

-- PASO 3: Crear usuario en Supabase Auth con la contraseña temporal
-- Esto se haría desde la aplicación cuando el administrador genera la contraseña

-- PASO 4: El usuario recibe su contraseña por email y puede hacer login
-- Después del primer login, debe cambiar su contraseña

-- Para testing: Crear un usuario de ejemplo completo
INSERT INTO users (
    id, 
    email, 
    name, 
    surname, 
    dni, 
    role, 
    birth_year, 
    phone,
    password_hash,
    has_temp_password,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'usuario.ejemplo@email.com',
    'Usuario',
    'Ejemplo',
    '87654321B',
    'user',
    1990,
    '600987654',
    '$2b$12$LQv3c1yqBWVHxkd0L9xOeK8t5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq', -- Contraseña: TEMP123456
    true, -- Es contraseña temporal
    NOW(),
    NOW()
);

-- Para que este usuario pueda acceder:
-- 1. El administrador debe crearlo en Supabase Auth con la misma contraseña
-- 2. El usuario hace login con 'usuario.ejemplo@email.com' y 'TEMP123456'
-- 3. El sistema le obligará a cambiar su contraseña

-- Verificar usuario creado
SELECT email, name, role, has_temp_password FROM users WHERE email = 'usuario.ejemplo@email.com';
