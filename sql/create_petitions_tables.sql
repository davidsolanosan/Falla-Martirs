-- Tabla de artículos de peticiones
CREATE TABLE IF NOT EXISTS petition_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT NOT NULL,        -- "Ropa", "Insignias", "Bandas" (dinámicas)
  category TEXT NOT NULL,        -- "Adulto", "Infantil", "Niño"
  gender TEXT NOT NULL,          -- "Hombre", "Mujer", "Unisex", "Niño"
  sizes TEXT[] NOT NULL,         -- ["S", "M", "L", "XL", "2XL", "3XL"] o tallas de niño
  price DECIMAL(10,2) NOT NULL,  -- Mismo precio para todas las tallas
  image_url TEXT,
  description TEXT,
  available BOOLEAN DEFAULT true, -- true/false (disponible/no disponible)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de peticiones de usuarios
CREATE TABLE IF NOT EXISTS petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  items JSONB NOT NULL,          -- [{"article_id": "...", "size": "M", "quantity": 1, "price": 25.50}]
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'cancelled'
  notes TEXT,
  cancellation_reason TEXT,      -- Motivo de anulación por admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de pagos extra por peticiones
CREATE TABLE IF NOT EXISTS petition_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID REFERENCES petitions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_month DATE NOT NULL,   -- Mes en que se añade el pago extra
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_petition_articles_section ON petition_articles(section);
CREATE INDEX IF NOT EXISTS idx_petition_articles_available ON petition_articles(available);
CREATE INDEX IF NOT EXISTS idx_petitions_user_id ON petitions(user_id);
CREATE INDEX IF NOT EXISTS idx_petitions_family_id ON petitions(family_id);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at);
CREATE INDEX IF NOT EXISTS idx_petition_payments_month ON petition_payments(payment_month);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_petition_articles_updated_at BEFORE UPDATE ON petition_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_petitions_updated_at BEFORE UPDATE ON petitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunas secciones por defecto (opcional)
INSERT INTO petition_articles (name, section, category, gender, sizes, price, description) VALUES
('Camisa Fallera Adulto', 'Ropa', 'Adulto', 'Unisex', ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL'], 45.00, 'Camisa oficial de la falla para adultos'),
('Camisa Fallera Infantil', 'Ropa', 'Infantil', 'Niño', ARRAY['2-3 años', '4-5 años', '6-7 años', '8-9 años', '10-12 años'], 35.00, 'Camisa oficial de la falla para niños'),
('Insignia Oficial', 'Insignias', 'Adulto', 'Unisex', ARRAY['Única'], 15.00, 'Insignia oficial de la Falla Màrtirs'),
('Banda Fallera', 'Bandas', 'Adulto', 'Unisex', ARRAY['Única'], 8.00, 'Banda oficial de la falla')
ON CONFLICT DO NOTHING;
