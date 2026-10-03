-- Añadir campo prize_amount a la tabla lottery_dates
ALTER TABLE lottery_dates 
ADD COLUMN prize_amount DECIMAL(10,2) DEFAULT 0;

-- Actualizar algunos sorteos de prueba con premios
UPDATE lottery_dates 
SET prize_amount = 1000.00 
WHERE name LIKE '%Sorteo 1%';

UPDATE lottery_dates 
SET prize_amount = 500.00 
WHERE name LIKE '%Sorteo 2%';

UPDATE lottery_dates 
SET prize_amount = 250.00 
WHERE name LIKE '%Sorteo 3%';
