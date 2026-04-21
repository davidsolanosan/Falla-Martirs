-- Consulta de diagnóstico para verificar la estructura de la base de datos
-- Ejecutar en Supabase SQL Editor antes de la migración

-- 1. Verificar estructura de la tabla users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verificar si existe la tabla categories
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 3. Verificar relaciones entre tablas
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'users';

-- 4. Verificar usuarios existentes
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_email,
    COUNT(CASE WHEN dni IS NOT NULL THEN 1 END) as users_with_dni,
    COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as users_with_birth_year
FROM users;

-- 5. Verificar categorías existentes
SELECT name, COUNT(*) as user_count
FROM categories c
LEFT JOIN users u ON u.categoryId = c.id
GROUP BY c.name
ORDER BY c.name;
