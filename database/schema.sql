-- ==========================================
-- Dienstplan-App Pilotprojekt
-- PostgreSQL Schema
-- ==========================================

-- Mitarbeiter
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wohnbereiche
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Schichten
CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Dienstplaneinträge
CREATE TABLE schedule_entries (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    area_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    work_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED',

    CONSTRAINT fk_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(id),

    CONSTRAINT fk_area
        FOREIGN KEY(area_id)
        REFERENCES areas(id),

    CONSTRAINT fk_shift
        FOREIGN KEY(shift_id)
        REFERENCES shifts(id)
);

-- Urlaub / Krankheit / Fortbildung
CREATE TABLE absences (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,

    absence_type VARCHAR(30) NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    status VARCHAR(20) DEFAULT 'OPEN',

    reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_absence_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(id)
);

-- Wunschfrei
CREATE TABLE wish_days (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,

    wish_date DATE NOT NULL,

    reason TEXT,

    status VARCHAR(20) DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wish_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(id)
);

-- Schichttausch
CREATE TABLE shift_swaps (
    id SERIAL PRIMARY KEY,

    schedule_entry_id INTEGER NOT NULL,

    requested_by_employee_id INTEGER NOT NULL,

    requested_to_employee_id INTEGER NOT NULL,

    status VARCHAR(20) DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_swap_schedule
        FOREIGN KEY(schedule_entry_id)
        REFERENCES schedule_entries(id),

    CONSTRAINT fk_swap_from
        FOREIGN KEY(requested_by_employee_id)
        REFERENCES employees(id),

    CONSTRAINT fk_swap_to
        FOREIGN KEY(requested_to_employee_id)
        REFERENCES employees(id)
);

-- Benachrichtigungen
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(id)
);

-- Änderungshistorie
CREATE TABLE change_logs (
    id SERIAL PRIMARY KEY,

    schedule_entry_id INTEGER NOT NULL,

    changed_by_employee_id INTEGER NOT NULL,

    old_value TEXT,

    new_value TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_change_schedule
        FOREIGN KEY(schedule_entry_id)
        REFERENCES schedule_entries(id),

    CONSTRAINT fk_change_employee
        FOREIGN KEY(changed_by_employee_id)
        REFERENCES employees(id)
);