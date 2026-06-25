-- Crear tabla casal_settings
CREATE TABLE IF NOT EXISTS casal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_price DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  rules TEXT NOT NULL DEFAULT '',
  blocked_dates TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla casal_rentals
CREATE TABLE IF NOT EXISTS casal_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rental_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para establecer user_id automáticamente
CREATE OR REPLACE FUNCTION set_casal_rental_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_insert_casal_rental
  BEFORE INSERT ON casal_rentals
  FOR EACH ROW
  EXECUTE FUNCTION set_casal_rental_user_id();

-- Habilitar RLS
ALTER TABLE casal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE casal_rentals ENABLE ROW LEVEL SECURITY;

-- Políticas para casal_settings (solo administradores pueden modificar)
CREATE POLICY "Anyone can view casal_settings" ON casal_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can insert casal_settings" ON casal_settings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'master_admin')
  )
);
CREATE POLICY "Only admins can update casal_settings" ON casal_settings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'master_admin')
  )
);

-- Políticas para casal_rentals
CREATE POLICY "Users can view their own rentals" ON casal_rentals FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'master_admin')
  )
);
CREATE POLICY "Users can create their own rentals" ON casal_rentals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own rentals" ON casal_rentals FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'master_admin')
  )
);
CREATE POLICY "Users can delete their own rentals" ON casal_rentals FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'master_admin')
  )
);

-- Insertar configuración inicial
INSERT INTO casal_settings (daily_price, rules, blocked_dates)
VALUES (50.00, 'Normas de uso del Casal:
- El Casal debe dejarse limpio después de su uso
- No está permitido fumar dentro del Casal
- El horario de uso es de 9:00 a 23:00
- Se debe respetar el mobiliario y equipamiento
- Cualquier daño deberá ser comunicado inmediatamente', '{}')
ON CONFLICT (id) DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_casal_rentals_user_id ON casal_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_casal_rentals_rental_date ON casal_rentals(rental_date);
CREATE INDEX IF NOT EXISTS idx_casal_rentals_status ON casal_rentals(status);
