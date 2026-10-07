-- ============================================================
-- Tickets QR de consumiciones (barra)
-- ============================================================
-- Flujo:
--   1. Admin crea productos (qr_products) con precio y periodo
--      de activación (active_from / active_until) o activación manual.
--   2. El fallero genera un ticket QR (qr_tickets, status='pending')
--      indicando producto + cantidad.
--   3. El admin escanea el QR en la barra y lo valida
--      (status='validated', validated_at, validated_by).
--   4. Los tickets validados se suman a las cuotas del fallero.
--
-- El ticket NO cobra en el momento: solo queda registrado.
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS qr_products (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  price        NUMERIC(10,2) NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  active_from  TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qr_tickets (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id   UUID NOT NULL REFERENCES qr_products(id) ON DELETE RESTRICT,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id    UUID REFERENCES families(id) ON DELETE SET NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10,2) NOT NULL,   -- precio congelado al generar
  total_price  NUMERIC(10,2) NOT NULL,   -- unit_price * quantity
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'validated', 'cancelled')),
  validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),  -- hora de generación del QR
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_tickets_user    ON qr_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_qr_tickets_family  ON qr_tickets (family_id);
CREATE INDEX IF NOT EXISTS idx_qr_tickets_status  ON qr_tickets (status);
CREATE INDEX IF NOT EXISTS idx_qr_tickets_created ON qr_tickets (created_at);

-- Permisos: misma política abierta que el resto de tablas de la app
ALTER TABLE qr_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tickets  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qr_products_all" ON qr_products
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "qr_tickets_all" ON qr_tickets
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Tiempo real: el admin ve los tickets al instante, sin refrescar
ALTER TABLE qr_tickets REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE qr_tickets;
  END IF;
END $$;
