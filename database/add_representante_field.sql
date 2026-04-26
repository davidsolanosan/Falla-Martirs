-- Añadir campo representante a la tabla families
ALTER TABLE families 
ADD COLUMN representative_id UUID REFERENCES users(id);

-- Crear índice para mejor rendimiento
CREATE INDEX idx_families_representative ON families(representative_id);

-- Opcional: Actualizar familias existentes con un representante (descomentar si es necesario)
-- UPDATE families SET representative_id = (
--   SELECT u.id 
--   FROM users u 
--   WHERE u.family_id = families.id 
--   AND u.role = 'admin' 
--   LIMIT 1
-- ) 
-- WHERE representative_id IS NULL;
