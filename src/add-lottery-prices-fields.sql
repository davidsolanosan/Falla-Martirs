-- Añadir campos de precios a la tabla lottery_dates

-- 1. Añadir campo lottery_price (para todos los sorteos)
ALTER TABLE lottery_dates ADD COLUMN lottery_price DECIMAL(10,2) DEFAULT 0.50;

-- 2. Añadir campo primitive_price (solo para sorteos ordinarios)
ALTER TABLE lottery_dates ADD COLUMN primitive_price DECIMAL(10,2) DEFAULT 0.30;

-- 3. Añadir campo donation_price (para todos los sorteos)
ALTER TABLE lottery_dates ADD COLUMN donation_price DECIMAL(10,2) DEFAULT 0.20;

-- 4. Actualizar registros existentes con valores por defecto
UPDATE lottery_dates 
SET 
  lottery_price = CASE 
    WHEN special = true THEN 2.50 
    ELSE 0.50 
  END,
  primitive_price = CASE 
    WHEN special = false THEN 0.30 
    ELSE NULL 
  END,
  donation_price = CASE 
    WHEN special = true THEN 0.50 
    ELSE 0.20 
  END;

-- 5. Verificar los cambios
SELECT 
  id,
  date,
  name,
  special,
  lottery_price,
  primitive_price,
  donation_price,
  created_at,
  updated_at
FROM lottery_dates
ORDER BY date DESC;
