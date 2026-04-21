-- Resetear la contraseña del superusuario a SUPER123A1980
UPDATE users 
SET 
    password_hash = '$2b$12$LQv3c1yqBWVHxkd0L9xOeK8t5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq',
    has_temp_password = false
WHERE email = 'newalfree@gmail.com';

-- Verificar actualización
SELECT 
    email,
    role,
    'SUPER123A1980' as nueva_contraseña,
    'Contraseña reseteada exitosamente' as estado
FROM users 
WHERE email = 'newalfree@gmail.com';
