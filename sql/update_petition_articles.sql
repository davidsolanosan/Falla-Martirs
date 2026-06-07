-- Añadir columna de categoría a petition_articles
ALTER TABLE petition_articles ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES petition_categories(id) ON DELETE SET NULL;

-- Migrar datos existentes de category (texto) a category_id si es necesario
-- Esto es opcional, solo si tienes datos existentes

-- Crear políticas RLS para petition_categories
ALTER TABLE petition_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage petition_categories" ON petition_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can read petition_categories" ON petition_categories
  FOR SELECT USING (true);

-- Permisos
GRANT ALL ON petition_categories TO authenticated;
GRANT ALL ON petition_categories TO service_role;
