-- Políticas RLS para las tablas de peticiones

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE petition_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_payments ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para petition_articles
-- Solo administradores pueden crear, editar y eliminar artículos
-- Todos pueden leer artículos disponibles

CREATE POLICY "Admins can insert petition_articles" ON petition_articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update petition_articles" ON petition_articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete petition_articles" ON petition_articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can read available petition_articles" ON petition_articles
  FOR SELECT USING (available = true);

CREATE POLICY "Admins can read all petition_articles" ON petition_articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 3. Políticas para petitions
-- Usuarios autenticados pueden crear sus propias peticiones
-- Usuarios pueden ver sus propias peticiones
-- Admins pueden ver y actualizar todas las peticiones

CREATE POLICY "Users can insert their own petitions" ON petitions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can read their own petitions" ON petitions
  FOR SELECT USING (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can read all petitions" ON petitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update petitions" ON petitions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete petitions" ON petitions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 4. Políticas para petition_payments
-- Solo administradores pueden gestionar pagos
-- Usuarios pueden ver sus propios pagos

CREATE POLICY "Admins can manage petition_payments" ON petition_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can read their petition payments" ON petition_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM petitions p
      WHERE p.id = petition_payments.petition_id 
      AND p.user_id = auth.uid()
    )
  );

-- 5. Dar permisos de servicio para que las funciones automaticas funcionen
GRANT ALL ON petition_articles TO authenticated;
GRANT ALL ON petitions TO authenticated;
GRANT ALL ON petition_payments TO authenticated;
GRANT ALL ON petition_articles TO service_role;
GRANT ALL ON petitions TO service_role;
GRANT ALL ON petition_payments TO service_role;
