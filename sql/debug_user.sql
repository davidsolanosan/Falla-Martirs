-- Verificar el usuario actual y su rol
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email,
  u.id,
  u.email,
  u.role,
  u.created_at
FROM users u 
WHERE u.id = auth.uid();

-- Verificar si las políticas RLS están activas
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE tablename IN ('petition_articles', 'petitions', 'petition_permissions');

-- Listar políticas existentes para petition_articles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'petition_articles';
