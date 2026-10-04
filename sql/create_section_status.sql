-- ============================================================
-- Tabla section_status: activar/desactivar secciones de la app
-- ============================================================
-- Cada fila controla si una sección está visible para falleros.
-- Los administradores siempre ven la sección (con aviso).
-- Si no existe fila para una sección, se considera activa.
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS section_status (
  section    TEXT PRIMARY KEY,
  enabled    BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO section_status (section, enabled) VALUES
  ('noticias',   true),
  ('eventos',    true),
  ('cuotas',     true),
  ('loterias',   true),
  ('documentos', true),
  ('peticiones', true),
  ('casal',      true)
ON CONFLICT (section) DO NOTHING;
