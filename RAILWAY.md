# 🚀 Deploy en Railway

## Paso 1: Subir a GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

## Paso 2: Deploy en Railway
1. Ve a https://railway.app
2. Click "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway
5. Selecciona tu repo: `backend-finanzas-chatbot`

## Paso 3: Variables de Entorno
En Railway Dashboard → Variables, agrega:

```
DATABASE_URL=tu_database_url_de_supabase
TELEGRAM_BOT_TOKEN=tu_token
OPENROUTER_API_KEY=tu_api_key
SUPABASE_ANON_KEY=tu_supabase_key
SUPABASE_URL=https://tuproyecto.supabase.co
NODE_ENV=production
```

## Paso 4: Verificar
Railway hará deploy automático. Verifica en los logs:
```
✅ SmartFin Telegram Bot activo
💬 Bot listo para recibir mensajes
```

Prueba tu bot en Telegram. ¡Listo! 🎉

**Costo:** $5 gratis/mes, luego ~$5-10/mes
