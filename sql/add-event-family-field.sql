-- Añadir campo event_family_id a tabla users
ALTER TABLE users ADD COLUMN event_family_id TEXT;

-- Poner valores por defecto (igual a family_id para usuarios existentes)
UPDATE users SET event_family_id = family_id WHERE event_family_id IS NULL;

-- Añadir campo event_family_id a tabla event_registrations
ALTER TABLE event_registrations ADD COLUMN event_family_id TEXT;

-- Actualizar inscripciones existentes
UPDATE event_registrations SET event_family_id = family_id WHERE event_family_id IS NULL;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_users_event_family_id ON users(event_family_id);
CREATE INDEX idx_event_registrations_event_family_id ON event_registrations(event_family_id);

-- Comentarios para documentación
COMMENT ON COLUMN users.event_family_id IS 'Familia desde donde el usuario puede apuntar a eventos (diferente de family_id que es para cuotas)';
COMMENT ON COLUMN event_registrations.event_family_id IS 'Familia de eventos desde donde se realizó la inscripción';
