-- Agregar configuración de secciones

-- 1. Agregar nuevas columnas a petition_categories
ALTER TABLE petition_categories 
ADD COLUMN IF NOT EXISTS has_sizes BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS separate_age_groups BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS separate_genders BOOLEAN DEFAULT true;

-- 2. Actualizar secciones existentes con configuraciones predeterminadas
UPDATE petition_categories SET 
  has_sizes = CASE 
    WHEN name IN ('Insignias', 'Bandas', 'Accesorios') THEN false
    ELSE true
  END,
  separate_age_groups = CASE 
    WHEN name IN ('Insignias', 'Bandas', 'Accesorios', 'Gorras') THEN false
    ELSE true
  END,
  separate_genders = CASE 
    WHEN name IN ('Insignias', 'Bandas', 'Accesorios', 'Gorras') THEN false
    ELSE true
  END;

-- 3. Verificar los cambios
SELECT 
  id, 
  name, 
  icon, 
  color,
  has_sizes,
  separate_age_groups,
  separate_genders,
  sort_order
FROM petition_categories 
ORDER BY sort_order;
