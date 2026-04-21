-- Añadir campos faltantes a la tabla lottery_prizes
-- Ejecutar este SQL en Supabase

-- 1. Añadir campos faltantes según la interfaz TypeScript
ALTER TABLE lottery_prizes 
ADD COLUMN IF NOT EXISTS prize_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS winning_numbers TEXT[],
ADD COLUMN IF NOT EXISTS winning_number VARCHAR(10);

-- 2. Eliminar campo incorrecto si existe
ALTER TABLE lottery_prizes 
DROP COLUMN IF EXISTS is_won;

-- 3. Añadir comentarios descriptivos
COMMENT ON COLUMN lottery_prizes.prize_category IS 'Categoría del premio: "1er Premio", "2º Premio", "Primitiva", etc.';
COMMENT ON COLUMN lottery_prizes.winning_numbers IS 'Números ganadores de la primitiva (array)';
COMMENT ON COLUMN lottery_prizes.winning_number IS 'Número ganador de la lotería nacional';

-- 4. Verificar estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lottery_prizes' 
ORDER BY ordinal_position;
