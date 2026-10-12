-- Añadir campo extras_family_id a tabla users
-- Familia a la que se imputan los extras (eventos, barra...).
-- Si es NULL, se usa event_family_id; y si tampoco lo tiene, family_id.
ALTER TABLE users ADD COLUMN extras_family_id TEXT;

-- Índice para búsquedas por familia de extras
CREATE INDEX idx_users_extras_family_id ON users(extras_family_id);

COMMENT ON COLUMN users.extras_family_id IS 'Familia que paga los extras del usuario (eventos, barra). Si NULL: event_family_id, y si tampoco: family_id';
