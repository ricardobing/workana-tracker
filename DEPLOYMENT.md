# Instrucciones de Deployment en Vercel

## 📋 Pre-requisitos

- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en GitHub
- Node.js 18+ instalado localmente

## 🚀 Método 1: Deploy desde GitHub (Recomendado)

### Paso 1: Subir el proyecto a GitHub

```bash
# Inicializar repositorio Git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: Workana Tracker"

# Crear rama main
git branch -M main

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU-USUARIO/workana-tracker.git

# Subir el código
git push -u origin main
```

### Paso 2: Importar en Vercel

1. Ve a https://vercel.com y haz login
2. Haz clic en **"Add New..."** → **"Project"**
3. Haz clic en **"Import Git Repository"**
4. Selecciona tu repositorio `workana-tracker`
5. Vercel detectará automáticamente que es un proyecto Next.js

### Paso 3: Configurar el proyecto

**Framework Preset:** Next.js (detectado automáticamente)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

### Paso 4: Variables de Entorno (Opcional)

Si quieres usar notificaciones de Telegram, agrega estas variables:

1. En la página de configuración, ve a **"Environment Variables"**
2. Agrega:

| Name | Value | Environment |
|------|-------|-------------|
| `TELEGRAM_BOT_TOKEN` | tu_token_aqui | Production |
| `TELEGRAM_CHAT_ID` | tu_chat_id_aqui | Production |
| `CACHE_DURATION` | 60 | Production |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | 120 | Production |

### Paso 5: Deploy

1. Haz clic en **"Deploy"**
2. Espera de 1-2 minutos mientras Vercel:
   - Instala las dependencias
   - Hace build del proyecto
   - Despliega la aplicación
3. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

---

## 🛠️ Método 2: Deploy con Vercel CLI

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

Sigue las instrucciones para autenticarte.

### Paso 3: Deploy

Desde la carpeta del proyecto:

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

### Paso 4: Configurar variables de entorno

```bash
# Agregar variable de entorno
vercel env add TELEGRAM_BOT_TOKEN

# Listar variables
vercel env ls

# Descargar variables localmente
vercel env pull
```

---

## ⚙️ Configuración de Runtime para Vercel

El proyecto ya incluye la configuración necesaria en `app/api/jobs/route.js`:

```javascript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

Esto asegura que:
- El scraping use Node.js runtime (necesario para cheerio y axios)
- Las respuestas sean siempre dinámicas (no se cacheen estáticamente)

---

## 🔧 Configuración Adicional

### Domain personalizado

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Domains"**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

### Regiones

Por defecto, Vercel despliega en múltiples regiones. Para América Latina:
- El CDN de Vercel optimizará automáticamente
- Las API routes se ejecutan en la región más cercana

### Monitoreo

Vercel proporciona:
- Analytics (visitas, performance)
- Logs en tiempo real
- Alertas de errores

Accede desde: **Dashboard → Tu Proyecto → Analytics/Logs**

---

## 🔄 Actualizaciones Automáticas

Una vez conectado con GitHub:

1. Cada `git push` a la rama `main` desplegará automáticamente
2. Los Pull Requests crean previews automáticos
3. Puedes rollback a versiones anteriores desde el dashboard

---

## 📊 Monitorear el Deployment

### Durante el build:

Verás logs en tiempo real de:
- Instalación de dependencias
- Build de Next.js
- Verificaciones de types
- Deployment a CDN

### Después del deployment:

1. **URL de producción:** `https://tu-proyecto.vercel.app`
2. **Preview URLs:** Para cada branch/PR
3. **Logs:** Accesibles desde el dashboard

---

## 🐛 Troubleshooting

### Error: "Build failed"

**Solución:**
1. Verifica que `package.json` tenga todos los scripts necesarios
2. Asegúrate que las dependencias estén en `dependencies` (no en `devDependencies`)
3. Revisa los logs del build

### Error: "API route timeout"

**Solución:**
1. El scraping puede tardar más de 10 segundos (límite de Vercel Hobby)
2. Considera optimizar el scraper
3. O usa un plan Pro de Vercel (60 segundos de timeout)

### Error: "Module not found"

**Solución:**
1. Verifica que todas las importaciones usen rutas correctas
2. Usa el alias `@` para imports: `@/lib/scraper`
3. Asegúrate que `jsconfig.json` o `tsconfig.json` esté configurado

---

## 📈 Optimizaciones Recomendadas

### 1. Habilitar Analytics

```bash
vercel analytics enable
```

### 2. Configurar Cache Headers

Ya incluido en `next.config.js` con:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=60' },
      ],
    },
  ];
}
```

### 3. Monitoring

Considera integrar:
- Sentry (errores)
- LogRocket (sesiones de usuario)
- Vercel Speed Insights

---

## ✅ Checklist Final

Antes de deployar, verifica:

- [ ] Todas las dependencias instaladas
- [ ] Build local exitoso (`npm run build`)
- [ ] Variables de entorno configuradas (si aplica)
- [ ] `.env.local` en `.gitignore`
- [ ] README actualizado
- [ ] Código commiteado en Git
- [ ] Repositorio en GitHub

---

## 🎉 ¡Deployment Exitoso!

Tu Workana Tracker ahora está:

✅ En producción  
✅ Con HTTPS automático  
✅ En CDN global  
✅ Con deploys automáticos  
✅ Con analytics incluidos  

**URL de producción:** `https://workana-tracker.vercel.app`

---

## 📞 Soporte

- Documentación Vercel: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Issues: Abre un issue en GitHub

---

**Happy deploying! 🚀**
