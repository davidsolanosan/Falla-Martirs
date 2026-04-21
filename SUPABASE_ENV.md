# Variables de Entorno para Supabase

## 🔐 Configuración Necesaria

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# Configuración de Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Variables para desarrollo (opcional)
VITE_NODE_ENV=development
```

## 📋 Obtener los Valores

### 1. Ve a tu proyecto en Supabase Dashboard
### 2. Settings → API
### 3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

## 🚀 Pasos

1. **Crea el archivo `.env.local`** con los valores reales
2. **Reinicia el servidor:** `npm run dev`
3. **Verifica la conexión** en la consola

## 💡 Notas

- **No comillas** en los valores
- **Prefijo `VITE_`** obligatorio para Vite
- **`.env.local`** está en `.gitignore` (seguro)
- **Reinicia servidor** después de cambios
