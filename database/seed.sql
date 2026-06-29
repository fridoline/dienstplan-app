INSERT INTO shifts(name, start_time, end_time)
VALUES
('Fruehschicht', '07:00', '13:21'),
('Spaetschicht', '16:02', '20:00');

INSERT INTO areas(name, description)
VALUES
('Wohnbereich 1', 'Allgemeiner Wohnbereich'),
('Wohnbereich 2', 'Demenzbereich'),
('Wohnbereich 3', 'Pflegebereich');

INSERT INTO employees(first_name, last_name, email, password_hash, role)
VALUES
('Anna', 'Admin', 'admin@test.de', 'test123', 'ADMIN'),
('Maria', 'Musterfrau', 'maria@test.de', 'test123', 'EMPLOYEE'),
('Leyla', 'Yilmaz', 'leyla@test.de', 'test123', 'EMPLOYEE');