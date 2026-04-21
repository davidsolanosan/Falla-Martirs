# Variables de Entorno para Vercel

## � Supabase Configuration

Copia y pega estas variables en Vercel → Settings → Environment Variables

```
VITE_SUPABASE_URL=https://ojhebvlzhoeaabkbifvy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo
```

## 🔍 Si usas Gemini AI (opcional)

Si también usas Gemini, añade:
```
VITE_GEMINI_API_KEY=tu_clave_gemini_aqui
```

## 🚀 Pasos en Vercel

1. **Dashboard → Tu proyecto → Settings → Environment Variables**
2. **"Add Variable"** para cada una de las siguientes:
3. **Selecciona:** Production, Preview, Development
4. **Guarda y redeploy** el proyecto

## 💡 Notas Importantes

- **No añadas comillas** en los valores
- **Usa los nombres exactos** con `VITE_` prefijo
- **Aplica a todos los entornos** (Production, Preview, Development)
- **Redeploy** después de configurar las variables
- **Solo Supabase**: No se necesita Firebase, la app usa Supabase como base de datos
