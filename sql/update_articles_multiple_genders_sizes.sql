-- Actualizar artículos para soportar múltiples géneros y tipos de talla

-- 1. Agregar nuevas columnas como arrays
ALTER TABLE petition_articles 
ADD COLUMN IF NOT EXISTS genders TEXT[] DEFAULT ARRAY['Unisex'],
ADD COLUMN IF NOT EXISTS size_types TEXT[] DEFAULT ARRAY['Adulto'];

-- 2. Migrar datos existentes
UPDATE petition_articles 
SET 
  genders = ARRAY[gender],
  size_types = ARRAY[category];

-- 3. Opcional: Eliminar columnas antiguas (después de verificar que todo funciona)
-- ALTER TABLE petition_articles DROP COLUMN gender;
-- ALTER TABLE petition_articles DROP COLUMN category;

-- 4. Actualizar las tallas para incluir todas las opciones según los tipos de talla
UPDATE petition_articles 
SET sizes = CASE 
  WHEN 'Adulto' = ANY(size_types) AND 'Infantil' = ANY(size_types) 
    THEN ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4-5 años', '6-7 años', '8-9 años', '10-11 años', '12-13 años']
  WHEN 'Adulto' = ANY(size_types) 
    THEN ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
  WHEN 'Infantil' = ANY(size_types) 
    THEN ARRAY['4-5 años', '6-7 años', '8-9 años', '10-11 años', '12-13 años']
  WHEN 'Niño' = ANY(size_types) 
    THEN ARRAY['2-3 años', '4-5 años', '6-7 años']
  ELSE sizes
END;

-- 5. Verificar los cambios
SELECT 
  id, 
  name, 
  gender, 
  genders, 
  category, 
  size_types, 
  sizes 
FROM petition_articles 
ORDER BY created_at DESC 
LIMIT 5;
