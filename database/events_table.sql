-- Tabla de Eventos de la Falla
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    event_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    includes_meal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Precios de Eventos por Categoría
CREATE TABLE event_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    includes_meal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, category_id)
);

-- Tabla de Inscripciones a Eventos
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    includes_meal BOOLEAN DEFAULT true,
    total_price DECIMAL(10,2) NOT NULL,
    registered_by UUID REFERENCES users(id), -- Quién hizo la inscripción (representante)
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_family ON event_registrations(family_id);
