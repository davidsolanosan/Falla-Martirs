# Variables de Entorno para Vercel

## 🔐 Firebase Configuration

Copia y pega estas variables en Vercel → Settings → Environment Variables

```
VITE_FIREBASE_API_KEY=AIzaSyAyCrCLDXo2Blg7A13vdNsuwD2MTTKDyz8
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0868481558.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0868481558
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0868481558.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=799879862714
VITE_FIREBASE_APP_ID=1:799879862714:web:6cc45958dde5f391c06583
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

## 🔍 Si usas Gemini AI (opcional)

Si también usas Gemini, añade:
```
VITE_GEMINI_API_KEY=tu_clave_gemini_aqui
```
