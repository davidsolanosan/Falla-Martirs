-- ============================================
-- Tablas para el alquiler del Casal
-- ============================================
-- NOTA: Esta app usa autenticación propia (tabla public.users),
-- NO Supabase Auth. Por tanto auth.uid() es siempre NULL y las
-- políticas RLS basadas en auth.uid() NO funcionan aquí.
-- La seguridad se aplica a nivel de aplicación (roles en users.role).
-- Por coherencia con el resto del proyecto, estas tablas funcionan
-- con acceso abierto para la anon key (igual que users, quotas, etc.).

-- Tabla de configuración del Casal (una única fila)
CREATE TABLE IF NOT EXISTS casal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_price DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  rules TEXT NOT NULL DEFAULT '',
  blocked_dates TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de alquiler
CREATE TABLE IF NOT EXISTS casal_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rental_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_casal_rentals_user_id ON casal_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_casal_rentals_rental_date ON casal_rentals(rental_date);
CREATE INDEX IF NOT EXISTS idx_casal_rentals_status ON casal_rentals(status);

-- Configuración inicial (solo si la tabla está vacía)
INSERT INTO casal_settings (daily_price, rules, blocked_dates)
SELECT 50.00,
'Normas de uso del Casal:
- El Casal debe dejarse limpio después de su uso
- No está permitido fumar dentro del Casal
- El horario de uso es de 9:00 a 23:00
- Se debe respetar el mobiliario y equipamiento
- Cualquier daño deberá ser comunicado inmediatamente',
'{}'
WHERE NOT EXISTS (SELECT 1 FROM casal_settings);
