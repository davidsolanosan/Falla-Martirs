-- Agregar columnas de papeletas a la tabla families
-- Ejecutar este SQL en Supabase SQL Editor

-- Agregar columnas de papeletas si no existen
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS ticket_start INTEGER,
ADD COLUMN IF NOT EXISTS ticket_end INTEGER,
ADD COLUMN IF NOT EXISTS ordinary_tickets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS christmas_tickets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS child_tickets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS horta_tickets INTEGER DEFAULT 0;

-- Comentario para documentar las columnas
COMMENT ON COLUMN families.ticket_start IS 'Numeración inicial de papeletas asignadas a la familia';
COMMENT ON COLUMN families.ticket_end IS 'Numeración final de papeletas asignadas a la familia';
COMMENT ON COLUMN families.ordinary_tickets IS 'Cantidad de papeletas para sorteos ordinarios (49)';
COMMENT ON COLUMN families.christmas_tickets IS 'Cantidad de papeletas para Lotería de Navidad';
COMMENT ON COLUMN families.child_tickets IS 'Cantidad de papeletas para Lotería del Niño';
COMMENT ON COLUMN families.horta_tickets IS 'Cantidad de papeletas para Lotería Horta Nord';

-- Crear función para calcular automáticamente ordinary_tickets si ticket_start y ticket_end están definidos
CREATE OR REPLACE FUNCTION calculate_ordinary_tickets()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se definen ticket_start y ticket_end, calcular ordinary_tickets automáticamente
    IF NEW.ticket_start IS NOT NULL AND NEW.ticket_end IS NOT NULL THEN
        NEW.ordinary_tickets = NEW.ticket_end - NEW.ticket_start + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para calcular automáticamente ordinary_tickets
DROP TRIGGER IF EXISTS calculate_family_tickets ON families;
CREATE TRIGGER calculate_family_tickets
    BEFORE INSERT OR UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION calculate_ordinary_tickets();

-- Actualizar families existentes que tengan ticket_start y ticket_end pero no ordinary_tickets
UPDATE families 
SET ordinary_tickets = ticket_end - ticket_start + 1 
WHERE ticket_start IS NOT NULL 
  AND ticket_end IS NOT NULL 
  AND (ordinary_tickets IS NULL OR ordinary_tickets = 0);
