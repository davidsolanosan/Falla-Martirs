-- ============================================================
-- Opciones de menú por evento
-- ============================================================
-- Permite definir varias opciones de comida por evento
-- (ej: paella, fideuà, menú celíaco) cada una con su suplemento.
-- El fallero elige opción (o "sin comida") al inscribirse y el
-- admin ve el conteo total por opción.
--
-- Si un evento NO tiene opciones, se mantiene el comportamiento
-- actual: checkbox sí/no de comida con meal_cost único.
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS event_meal_options (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  extra_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_meal_options_event
  ON event_meal_options (event_id);

-- La inscripción guarda la opción elegida (null = sin comida o
-- evento sin opciones configuradas)
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS meal_option_id UUID
    REFERENCES event_meal_options(id) ON DELETE SET NULL;
