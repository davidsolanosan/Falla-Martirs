-- Actualizar todos los sorteos con valores de premio
UPDATE lottery_dates SET prize_amount = 1000.00 WHERE name LIKE '%Prueba%';
UPDATE lottery_dates SET prize_amount = 500.00 WHERE name LIKE '%Semanal%';
UPDATE lottery_dates SET prize_amount = 250.00 WHERE name LIKE '%Extraordinaria%';

-- Verificar los cambios
SELECT id, name, date, prize_amount FROM lottery_dates ORDER BY date;
