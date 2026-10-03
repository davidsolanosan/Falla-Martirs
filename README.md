# Portal Falla Màrtirs

Aplicación web de gestión interna para la comisión fallera Falla Màrtirs.
Permite a los falleros consultar noticias, eventos, cuotas, lotería, peticiones
y solicitar el alquiler del Casal; y a la junta administrar censo, familias,
pagos y contenidos.

## Stack

- **Frontend**: Vite + React 19 + TypeScript, Tailwind CSS 4, React Router 7
- **Backend**: Supabase (PostgreSQL) — acceso directo desde el cliente
- **i18n**: Castellano y Valencià (`src/lib/i18n.tsx`)
- **Deploy**: Vercel

## Ejecutar en local

**Requisito:** Node.js

```bash
npm install
npm run dev        # http://localhost:3000
```

Otros comandos: `npm run build`, `npm run preview`, `npm run lint` (tsc).

## Acceso

- Login con email + contraseña. La contraseña inicial de cada fallero es
  `DNI + año de nacimiento` (p. ej. `12345678Z1980`); en el primer acceso se
  solicita cambiarla.
- Roles: `user`, `admin`, `master_admin`.

## Estructura

- `src/pages/` — vistas de usuario; `src/pages/administracion/` — panel de gestión
- `src/lib/SupabaseContext.tsx` — capa de datos (CRUD sobre Supabase)
- `src/context/AuthContext.tsx` — autenticación propia sobre la tabla `users`
- `sql/` — scripts SQL del esquema y migraciones aplicadas
- `scripts/` — utilidades puntuales (generación de lotería, datos de prueba)
- `database/` — histórico de migraciones de autenticación
