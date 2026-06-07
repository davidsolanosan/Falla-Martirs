-- Tabla de categorías para peticiones
CREATE TABLE IF NOT EXISTS petition_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,        -- Nombre del icono de Lucide (ej: "Shirt", "Award", "Users")
  color TEXT NOT NULL,       -- Color para el icono (ej: "blue", "green", "purple")
  sort_order INTEGER DEFAULT 0, -- Orden de visualización
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_petition_categories_sort_order ON petition_categories(sort_order);

-- Trigger para updated_at
CREATE TRIGGER update_petition_categories_updated_at BEFORE UPDATE ON petition_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar categorías por defecto
INSERT INTO petition_categories (name, description, icon, color, sort_order) VALUES
('Ropa', 'Camisas, pantalones y vestimenta fallera', 'Shirt', 'blue', 1),
('Insignias', 'Distintivos y emblemas oficiales', 'Award', 'yellow', 2),
('Bandas', 'Bandas y pañuelos falleros', 'Users', 'green', 3),
('Accesorios', 'Complementos y accesorios varios', 'Package', 'purple', 4)
ON CONFLICT DO NOTHING;
