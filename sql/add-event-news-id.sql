-- Añadir campo news_id a tabla events
ALTER TABLE events ADD COLUMN news_id TEXT;

-- Crear índice para mejor rendimiento
CREATE INDEX idx_events_news_id ON events(news_id);

-- Comentario para documentación
COMMENT ON COLUMN events.news_id IS 'ID de la noticia generada automáticamente para el evento';
