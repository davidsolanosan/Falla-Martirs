-- Insertar año fallero 2026-2027 (Abril 2026 - Marzo 2027)
-- Borrar sorteos existentes del año anterior
DELETE FROM lottery_dates WHERE date >= '2025-04-01' AND date <= '2027-03-31';

-- Insertar nuevos sorteos del año fallero actual (55 sorteos totales)
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-04-04', 'Sorteo 1 - 4 de Abril', false, 0.5, 0.3, 0.2, 1156);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-04-11', 'Sorteo 2 - 11 de Abril', false, 0.5, 0.3, 0.2, 543);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-04-18', 'Sorteo 3 - 18 de Abril', false, 0.5, 0.3, 0.2, 1592);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-04-25', 'Sorteo 4 - 25 de Abril', false, 0.5, 0.3, 0.2, 847);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-05-02', 'Sorteo 5 - 2 de Mayo', false, 0.5, 0.3, 0.2, 234);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-05-09', 'Sorteo 6 - 9 de Mayo', false, 0.5, 0.3, 0.2, 987);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-05-16', 'Sorteo 7 - 16 de Mayo', false, 0.5, 0.3, 0.2, 1456);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-05-23', 'Sorteo 8 - 23 de Mayo', false, 0.5, 0.3, 0.2, 678);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-05-30', 'Sorteo 9 - 30 de Mayo', false, 0.5, 0.3, 0.2, 1234);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-06-06', 'Sorteo 10 - 6 de Junio', false, 0.5, 0.3, 0.2, 789);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-06-13', 'Sorteo 11 - 13 de Junio', false, 0.5, 0.3, 0.2, 1567);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-06-20', 'Sorteo 12 - 20 de Junio', false, 0.5, 0.3, 0.2, 345);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-06-27', 'Sorteo 13 - 27 de Junio', false, 0.5, 0.3, 0.2, 1123);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-07-04', 'Sorteo 14 - 4 de Julio', false, 0.5, 0.3, 0.2, 890);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-07-11', 'Sorteo 15 - 11 de Julio', false, 0.5, 0.3, 0.2, 456);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-07-18', 'Sorteo 16 - 18 de Julio', false, 0.5, 0.3, 0.2, 1345);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-07-25', 'Sorteo 17 - 25 de Julio', false, 0.5, 0.3, 0.2, 678);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-08-01', 'Sorteo 18 - 1 de Agosto', false, 0.5, 0.3, 0.2, 1567);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-08-08', 'Sorteo 19 - 8 de Agosto', false, 0.5, 0.3, 0.2, 234);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-08-15', 'Sorteo 20 - 15 de Agosto', false, 0.5, 0.3, 0.2, 987);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-08-22', 'Sorteo 21 - 22 de Agosto', false, 0.5, 0.3, 0.2, 1303);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-08-29', 'Sorteo 22 - 29 de Agosto', false, 0.5, 0.3, 0.2, 709);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-09-05', 'Sorteo 23 - 5 de Septiembre', false, 0.5, 0.3, 0.2, 1279);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-09-12', 'Sorteo 24 - 12 de Septiembre', false, 0.5, 0.3, 0.2, 148);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-09-19', 'Sorteo 25 - 19 de Septiembre', false, 0.5, 0.3, 0.2, 1448);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-09-26', 'Sorteo 26 - 26 de Septiembre', false, 0.5, 0.3, 0.2, 1474);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-10-03', 'Sorteo 27 - 3 de Octubre', false, 0.5, 0.3, 0.2, 283);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-10-10', 'Sorteo 28 - 10 de Octubre', false, 0.5, 0.3, 0.2, 553);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-10-17', 'Sorteo 29 - 17 de Octubre', false, 0.5, 0.3, 0.2, 1504);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-10-24', 'Sorteo 30 - 24 de Octubre', false, 0.5, 0.3, 0.2, 634);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-10-31', 'Sorteo 31 - 31 de Octubre', false, 0.5, 0.3, 0.2, 471);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-11-07', 'Sorteo 32 - 7 de Noviembre', false, 0.5, 0.3, 0.2, 848);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-11-14', 'Sorteo 33 - 14 de Noviembre', false, 0.5, 0.3, 0.2, 1427);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-11-21', 'Sorteo 34 - 21 de Noviembre', false, 0.5, 0.3, 0.2, 463);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-11-28', 'Sorteo 35 - 28 de Noviembre', false, 0.5, 0.3, 0.2, 329);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-12-05', 'Sorteo 36 - 5 de Diciembre', false, 0.5, 0.3, 0.2, 1350);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2026-12-12', 'Sorteo 37 - 12 de Diciembre', false, 0.5, 0.3, 0.2, 620);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-01-02', 'Sorteo 38 - 2 de Enero', false, 0.5, 0.3, 0.2, 1182);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-01-09', 'Sorteo 39 - 9 de Enero', false, 0.5, 0.3, 0.2, 1350);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-01-16', 'Sorteo 40 - 16 de Enero', false, 0.5, 0.3, 0.2, 511);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-01-23', 'Sorteo 41 - 23 de Enero', false, 0.5, 0.3, 0.2, 491);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-01-30', 'Sorteo 42 - 30 de Enero', false, 0.5, 0.3, 0.2, 1017);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-02-06', 'Sorteo 43 - 6 de Febrero', false, 0.5, 0.3, 0.2, 192);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-02-13', 'Sorteo 44 - 13 de Febrero', false, 0.5, 0.3, 0.2, 474);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-02-20', 'Sorteo 45 - 20 de Febrero', false, 0.5, 0.3, 0.2, 1551);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-02-27', 'Sorteo 46 - 27 de Febrero', false, 0.5, 0.3, 0.2, 990);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-03-06', 'Sorteo 47 - 6 de Marzo', false, 0.5, 0.3, 0.2, 557);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-03-13', 'Sorteo 48 - 13 de Marzo', false, 0.5, 0.3, 0.2, 931);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-03-20', 'Sorteo 49 - 20 de Marzo', false, 0.5, 0.3, 0.2, 1409);
INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('2027-03-27', 'Sorteo 50 - 27 de Marzo', false, 0.5, 0.3, 0.2, 1545);

-- Verificar inserción
SELECT COUNT(*) as total_sorteos FROM lottery_dates WHERE date >= '2026-04-01' AND date <= '2027-03-31';
SELECT MIN(date) as primer_sorteo, MAX(date) as ultimo_sorteo FROM lottery_dates WHERE date >= '2026-04-01' AND date <= '2027-03-31';
