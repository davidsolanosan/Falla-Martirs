-- Insertar todos los sorteos del año fallero 2025-2026
-- Borrar sorteos existentes (opcional)
DELETE FROM lottery_dates WHERE date >= '2025-04-01' AND date <= '2026-04-30';

-- Insertar nuevos sorteos (52 sorteos totales)
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-04-05', 'Sorteo 1 - 5 de Abril', false, 0.5, 0.3, 0.2, 1156);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-04-12', 'Sorteo 2 - 12 de Abril', false, 0.5, 0.3, 0.2, 543);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-04-19', 'Sorteo 3 - 19 de Abril', false, 0.5, 0.3, 0.2, 1592);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-04-26', 'Sorteo 4 - 26 de Abril', false, 0.5, 0.3, 0.2, 847);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-05-03', 'Sorteo 5 - 3 de Mayo', false, 0.5, 0.3, 0.2, 234);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-05-10', 'Sorteo 6 - 10 de Mayo', false, 0.5, 0.3, 0.2, 987);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-05-17', 'Sorteo 7 - 17 de Mayo', false, 0.5, 0.3, 0.2, 1456);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-05-24', 'Sorteo 8 - 24 de Mayo', false, 0.5, 0.3, 0.2, 678);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-05-31', 'Sorteo 9 - 31 de Mayo', false, 0.5, 0.3, 0.2, 1234);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-06-07', 'Sorteo 10 - 7 de Junio', false, 0.5, 0.3, 0.2, 789);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-06-14', 'Sorteo 11 - 14 de Junio', false, 0.5, 0.3, 0.2, 1567);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-06-21', 'Sorteo 12 - 21 de Junio', false, 0.5, 0.3, 0.2, 345);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-06-28', 'Sorteo 13 - 28 de Junio', false, 0.5, 0.3, 0.2, 1123);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-07-05', 'Sorteo 14 - 5 de Julio', false, 0.5, 0.3, 0.2, 890);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-07-12', 'Sorteo 15 - 12 de Julio', false, 0.5, 0.3, 0.2, 456);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-07-19', 'Sorteo 16 - 19 de Julio', false, 0.5, 0.3, 0.2, 1345);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-07-26', 'Sorteo 17 - 26 de Julio', false, 0.5, 0.3, 0.2, 678);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-08-02', 'Sorteo 18 - 2 de Agosto', false, 0.5, 0.3, 0.2, 1567);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-08-09', 'Sorteo 19 - 9 de Agosto', false, 0.5, 0.3, 0.2, 234);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-08-16', 'Sorteo 20 - 16 de Agosto', false, 0.5, 0.3, 0.2, 987);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-08-23', 'Sorteo 21 - 23 de Agosto', false, 0.5, 0.3, 0.2, 1303);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-08-30', 'Sorteo 22 - 30 de Agosto', false, 0.5, 0.3, 0.2, 709);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-09-06', 'Sorteo 23 - 6 de Septiembre', false, 0.5, 0.3, 0.2, 1279);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-09-13', 'Sorteo 24 - 13 de Septiembre', false, 0.5, 0.3, 0.2, 148);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-09-20', 'Sorteo 25 - 20 de Septiembre', false, 0.5, 0.3, 0.2, 1448);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-09-27', 'Sorteo 26 - 27 de Septiembre', false, 0.5, 0.3, 0.2, 1474);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-10-04', 'Sorteo 27 - 4 de Octubre', false, 0.5, 0.3, 0.2, 283);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-10-11', 'Sorteo 28 - 11 de Octubre', false, 0.5, 0.3, 0.2, 553);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-10-18', 'Sorteo 29 - 18 de Octubre', false, 0.5, 0.3, 0.2, 1504);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-10-25', 'Sorteo 30 - 25 de Octubre', false, 0.5, 0.3, 0.2, 634);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-11-01', 'Sorteo 31 - 1 de Noviembre', false, 0.5, 0.3, 0.2, 471);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-11-08', 'Sorteo 32 - 8 de Noviembre', false, 0.5, 0.3, 0.2, 848);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-11-15', 'Sorteo 33 - 15 de Noviembre', false, 0.5, 0.3, 0.2, 1427);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-11-22', 'Sorteo 34 - 22 de Noviembre', false, 0.5, 0.3, 0.2, 463);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-11-29', 'Sorteo 35 - 29 de Noviembre', false, 0.5, 0.3, 0.2, 329);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-12-06', 'Sorteo 36 - 6 de Diciembre', false, 0.5, 0.3, 0.2, 1350);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2025-12-13', 'Sorteo 37 - 13 de Diciembre', false, 0.5, 0.3, 0.2, 620);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-01-03', 'Sorteo 38 - 3 de Enero', false, 0.5, 0.3, 0.2, 1182);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-01-10', 'Sorteo 39 - 10 de Enero', false, 0.5, 0.3, 0.2, 1350);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-01-17', 'Sorteo 40 - 17 de Enero', false, 0.5, 0.3, 0.2, 511);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-01-24', 'Sorteo 41 - 24 de Enero', false, 0.5, 0.3, 0.2, 491);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-01-31', 'Sorteo 42 - 31 de Enero', false, 0.5, 0.3, 0.2, 1017);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-02-07', 'Sorteo 43 - 7 de Febrero', false, 0.5, 0.3, 0.2, 192);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-02-14', 'Sorteo 44 - 14 de Febrero', false, 0.5, 0.3, 0.2, 474);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-02-21', 'Sorteo 45 - 21 de Febrero', false, 0.5, 0.3, 0.2, 1551);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-02-28', 'Sorteo 46 - 28 de Febrero', false, 0.5, 0.3, 0.2, 990);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-03-07', 'Sorteo 47 - 7 de Marzo', false, 0.5, 0.3, 0.2, 557);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-03-14', 'Sorteo 48 - 14 de Marzo', false, 0.5, 0.3, 0.2, 931);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-03-21', 'Sorteo 49 - 21 de Marzo', false, 0.5, 0.3, 0.2, 1409);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-03-28', 'Sorteo 50 - 28 de Marzo', false, 0.5, 0.3, 0.2, 1545);

-- Verificar inserción
SELECT COUNT(*) as total_sorteos FROM lottery_dates WHERE date >= '2025-04-01' AND date <= '2026-04-30';
SELECT MIN(date) as primer_sorteo, MAX(date) as ultimo_sorteo FROM lottery_dates WHERE date >= '2025-04-01' AND date <= '2026-04-30';
