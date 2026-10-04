-- ============================================================
-- FIX: FKs que apuntan a auth.users en lugar de public.users
-- ============================================================
-- La app usa autenticación propia contra public.users, por lo que
-- auth.users está vacía. Cualquier FK a auth.users provoca errores
-- 23503 (FK violation) al insertar IDs de usuarios reales.
--
-- EJECUTAR EN: Supabase Dashboard -> SQL Editor
-- ============================================================

-- PASO 1 (opcional, diagnóstico): ver qué constraints apuntan a auth.users
SELECT
  con.conname            AS constraint_name,
  con.conrelid::regclass AS tabla,
  a.attname              AS columna
FROM pg_constraint con
JOIN pg_class     own ON own.oid = con.conrelid
JOIN pg_namespace ownn ON ownn.oid = own.relnamespace
JOIN pg_class     ref ON ref.oid = con.confrelid
JOIN pg_namespace n   ON n.oid   = ref.relnamespace
JOIN pg_attribute a   ON a.attrelid = con.conrelid
                     AND a.attnum   = con.conkey[1]
WHERE con.contype  = 'f'
  AND n.nspname    = 'auth'      -- que APUNTAN a auth.*
  AND ownn.nspname = 'public';   -- pero viven en NUESTRAS tablas

-- PASO 2: repuntar todas esas FKs a public.users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      con.conname            AS conname,
      con.conrelid::regclass AS tbl,
      a.attname              AS col
    FROM pg_constraint con
    JOIN pg_class     own  ON own.oid  = con.conrelid
    JOIN pg_namespace ownn ON ownn.oid = own.relnamespace
    JOIN pg_class     ref  ON ref.oid  = con.confrelid
    JOIN pg_namespace n    ON n.oid    = ref.relnamespace
    JOIN pg_attribute a    ON a.attrelid = con.conrelid
                          AND a.attnum   = con.conkey[1]
    WHERE con.contype  = 'f'
      AND n.nspname    = 'auth'      -- que APUNTAN a auth.*
      AND ownn.nspname = 'public'    -- pero viven en NUESTRAS tablas
      AND array_length(con.conkey, 1) = 1  -- solo FKs de columna simple
  LOOP
    EXECUTE format(
      'ALTER TABLE %s DROP CONSTRAINT %I',
      r.tbl, r.conname
    );
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.users(id) ON DELETE CASCADE',
      r.tbl, r.conname, r.col
    );
    RAISE NOTICE 'FK % de % recreada apuntando a public.users', r.conname, r.tbl;
  END LOOP;
END $$;
