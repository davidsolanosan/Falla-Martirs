# Sistema de Login para Falleros - Guía de Implementación

## Overview

Sistema completo de autenticación para falleros con las siguientes características:
- **Categorías permitidas**: Juvenil, Adulto, Jubilado
- **Requisito**: Email obligatorio
- **Contraseña inicial**: DNI + Año de nacimiento
- **Cambio obligatorio**: Primer login requiere cambiar contraseña

## Arquitectura del Sistema

### 1. Base de Datos (Supabase)

#### Campos añadidos a la tabla `users`:
```sql
password_hash VARCHAR(255)                    -- Contraseña encriptada
has_temp_password BOOLEAN DEFAULT FALSE       -- ¿Es contraseña temporal?
password_reset_token VARCHAR(255)            -- Token para reset
password_reset_expires TIMESTAMP              -- Expiración del token
last_login TIMESTAMP                          -- Último login
login_attempts INTEGER DEFAULT 0             -- Intentos fallidos
locked_until TIMESTAMP                       -- Bloqueo temporal
```

#### Tablas adicionales:
- `auth_logs` - Logs de auditoría
- Vistas: `users_with_login_permission`, `auth_stats`

### 2. Componentes React

#### Autenticación:
- `AuthContext.tsx` - Contexto global de autenticación
- `LoginScreen.tsx` - Pantalla de login
- `ChangePassword.tsx` - Cambio obligatorio de contraseña
- `ResetPassword.tsx` - Reset por token

#### Utilidades:
- `auth.ts` - Funciones de encriptación y validación
- `passwordGenerator.ts` - Generación de contraseñas iniciales

#### Administración:
- `PasswordGenerator.tsx` - Herramienta para generar contraseñas

## Proceso de Implementación

### Paso 1: Configurar Base de Datos

1. **Ejecutar migración SQL**:
   ```sql
   -- Copiar y ejecutar el contenido de:
   -- database/migrations/auth_schema.sql
   ```

2. **Verificar estructura**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users';
   ```

### Paso 2: Generar Contraseñas Iniciales

1. **Acceder al panel de administración**:
   - Ir a `/configuracion`
   - Buscar "Generador de Contraseñas"

2. **Verificar usuarios elegibles**:
   - Click en "Verificar Usuarios"
   - Revisar lista de usuarios sin contraseña

3. **Generar contraseñas**:
   - Click en "Generar Contraseñas"
   - Descargar CSV con credenciales
   - Enviar emails a los falleros

### Paso 3: Comunicación a Falleros

#### Email de bienvenida:
```
Asunto: Bienvenido al Portal de Falleros Martirs

Estimado/a [Nombre],

Tus credenciales de acceso al portal:
- Email: [email]
- Contraseña inicial: [DNI+año_nacimiento]

IMPORTANTE: Debes cambiar tu contraseña en el primer login.

Acceso: https://tu-dominio.com/login

¿Cómo acceder?
1. Solo categorías: Juvenil, Adulto, Jubilado
2. Debes tener email registrado
3. Contraseña inicial: DNI + Año nacimiento
4. Ejemplo: 12345678A1990

Atentamente,
Falla Martirs
```

### Paso 4: Flujo de Usuario

1. **Primer Login**:
   - Usuario entra email + contraseña inicial
   - Sistema valida categoría y permisos
   - Redirige a `/change-password`

2. **Cambio de Contraseña**:
   - Usuario ingresa contraseña actual
   - Crea nueva contraseña (mínimo 8 chars, mayúscula, minúscula, número)
   - Sistema actualiza y marca `has_temp_password = false`

3. **Login Normal**:
   - Usuario entra email + nueva contraseña
   - Acceso directo al dashboard

### Paso 5: Reset de Contraseña

#### Opción 1: Self-service
1. Usuario hace click en "¿Olvidaste tu contraseña?"
2. Ingresa su email
3. Sistema genera token (24h validez)
4. Recibe email con link: `/reset-password/[token]`
5. Crea nueva contraseña

#### Opción 2: Contacto Directo
1. Usuario email a administración
2. Admin verifica identidad
3. Admin resetea a contraseña inicial
4. Usuario debe cambiarla en próximo login

## Características de Seguridad

### Encriptación:
- **bcrypt** con 12 salt rounds
- Contraseñas nunca almacenadas en texto plano

### Validaciones:
- **Contraseña fuerte**: 8+ chars, mayúscula, minúscula, número
- **Categoría restringida**: Solo Juvenil, Adulto, Jubilado
- **Email obligatorio**: Sin email no hay acceso

### Protección contra ataques:
- **Límite de intentos**: 3 intentos fallidos
- **Bloqueo temporal**: 15 minutos después de 3 fallos
- **Token seguro**: 32 caracteres aleatorios
- **Expiración de tokens**: 24 horas

### Auditoría:
- **Logs completos**: Todos los eventos de autenticación
- **Intentos fallidos**: Registro de IPs y errores
- **Cambios de contraseña**: Fecha y hora de cada cambio

## Mantenimiento

### Tareas Administrativas:

#### 1. Generación de Nuevas Contraseñas
```typescript
// Para nuevos usuarios
import { generatePasswordForUser } from './utils/passwordGenerator';
await generatePasswordForUser(userId);
```

#### 2. Reset de Contraseña
```typescript
// Reset a contraseña inicial
import { resetToInitialPassword } from './utils/passwordGenerator';
await resetToInitialPassword(userId);
```

#### 3. Estadísticas
```sql
-- Ver estadísticas de autenticación
SELECT * FROM auth_stats;

-- Ver usuarios bloqueados
SELECT * FROM users_with_login_permission 
WHERE locked_until > NOW();
```

### Monitoreo:

#### Logs importantes:
- Login exitosos
- Intentos fallidos
- Cambios de contraseña
- Resets de contraseña

#### Alertas:
- Múltiples intentos fallidos
- Usuarios bloqueados
- Tokens expirados

## Troubleshooting

### Problemas Comunes:

#### 1. "Usuario no encontrado"
- Verificar que tenga email registrado
- Confirmar categoría permitida
- Revisar DNI y año de nacimiento

#### 2. "Contraseña incorrecta"
- Verificar formato: DNI + Año (ej: 12345678A1990)
- Confirmar que no haya espacios extra
- Revisar año de nacimiento en base de datos

#### 3. "Categoría no permitida"
- Solo Juvenil, Adulto, Jubilado tienen acceso
- Infantil y otras categorías no pueden hacer login
- Verificar configuración de categorías

#### 4. "Cuenta bloqueada"
- Esperar 15 minutos para desbloqueo automático
- O resetear contraseña manualmente
- Revisar logs de intentos fallidos

### Consultas Útiles:

```sql
-- Usuarios sin contraseña
SELECT name, email, categories.name as category
FROM users 
LEFT JOIN categories ON users.category_id = categories.id
WHERE password_hash IS NULL 
  AND categories.name IN ('Juvenil', 'Adulto', 'Jubilado');

-- Usuarios con contraseña temporal
SELECT name, email, last_login
FROM users_with_login_permission
WHERE has_temp_password = TRUE;

-- Logs recientes
SELECT * FROM auth_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

## Resumen

El sistema está completamente implementado con:

- **Seguridad robusta**: bcrypt, validaciones, límites de intentos
- **Experiencia de usuario**: Flujo intuitivo con guía clara
- **Administración completa**: Herramientas para gestión y monitoreo
- **Escalabilidad**: Arquitectura modular y mantenible

**Próximos pasos:**
1. Ejecutar migración SQL en Supabase
2. Generar contraseñas para usuarios existentes
3. Enviar emails de bienvenida
4. Monitorear primeros accesos

El sistema está listo para producción y cumple con todos los requisitos de seguridad y usabilidad solicitados.
