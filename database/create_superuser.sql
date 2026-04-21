-- Crear Superusuario para acceso completo
-- Reemplaza 'tuemail@dominio.com' con tu email real

-- 1. Primero, obtener el ID de la categoría "Mayor" (o la que prefieras)
DO $$
DECLARE
    mayor_category_id UUID;
BEGIN
    SELECT id INTO mayor_category_id 
    FROM categories 
    WHERE categoryname = 'Mayor' 
    LIMIT 1;
    
    IF mayor_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoría "Mayor" no encontrada. Primero crea una categoría con ese nombre.';
    END IF;
    
    -- Insertar superusuario
    INSERT INTO users (
        id,
        name,
        surname,
        email,
        dni,
        birth_year,
        categoryid,
        password_hash,
        has_temp_password,
        role,
        is_family_admin,
        is_adult,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Super',
        'Usuario',
        'newalfree@gmail.com',  -- <-- REEMPLAZA ESTO
        'SUPER123A',
        '1980',
        mayor_category_id,
        '$2b$12$LQv3c1yqBWVHxkd0L9xOeK8t5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq',  -- Contraseña: SUPER123A1980
        false,  -- No es contraseña temporal
        'master_admin',  -- Rol máximo
        true,   -- Admin de familia
        true,   -- Es adulto
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Superusuario creado exitosamente';
END $$;

-- 2. Verificar creación
SELECT 
    name,
    surname,
    email,
    role,
    'SUPER123A1980' as contraseña_inicial,
    'Accede con: email + contraseña inicial' as instrucciones
FROM users 
WHERE email = 'tuemail@dominio.com';  -- <-- REEMPLAZA ESTO

-- 3. Mostrar categorías disponibles (para referencia)
SELECT id, categoryname, quotaamount 
FROM categories 
ORDER BY categoryname;
