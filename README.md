# Workana Tracker 📊

Aplicación web para rastrear y mostrar los últimos trabajos de programación publicados en Workana, ordenados por fecha de publicación.

## 🚀 Características

- ✅ **Scraping automático** de trabajos desde Workana
- 📅 **Ordenamiento por fecha** de publicación
- 🔍 **Filtros avanzados** por título, país y skills
- 🔄 **Auto-refresh** cada 2 minutos (configurable)
- ⚡ **Caché inteligente** de 60 segundos para optimizar rendimiento
- 🌓 **Tema claro/oscuro** persistente
- 🎉 **Contador de nuevos trabajos** desde la última visita
- 📱 **Diseño responsive** para móviles y tablets
- 📲 **Notificaciones por Telegram** (opcional)

## 📋 Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn
- Cuenta en Vercel (para deployment)
- Token de bot de Telegram (opcional, para notificaciones)

## 🛠️ Instalación Local

### 1. Clonar o descargar el proyecto

```bash
cd workana-tracker
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno (opcional)

Copia el archivo `.env.example` a `.env.local`:

```bash
copy .env.example .env.local
```

Edita `.env.local` y configura tus variables:

```env
# Configuración de Telegram (opcional)
TELEGRAM_BOT_TOKEN=tu_token_del_bot_aqui
TELEGRAM_CHAT_ID=tu_chat_id_aqui

# Configuración de cache (en segundos)
CACHE_DURATION=60

# Configuración de auto-refresh en el frontend (en segundos)
NEXT_PUBLIC_REFRESH_INTERVAL=120
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Estructura del Proyecto

```
workana-tracker/
├── app/
│   ├── api/
│   │   └── jobs/
│   │       └── route.js          # API endpoint para scraping
│   ├── globals.css               # Estilos globales
│   ├── layout.jsx                # Layout raíz
│   └── page.jsx                  # Página principal
├── components/
│   ├── FilterPanel.jsx           # Panel de filtros
│   └── JobCard.jsx               # Tarjeta de trabajo individual
├── lib/
│   ├── cache.js                  # Sistema de caché en memoria
│   ├── scraper.js                # Lógica de scraping
│   └── telegram.js               # Notificaciones Telegram
├── .env.example                  # Ejemplo de variables de entorno
├── .gitignore
├── next.config.js                # Configuración de Next.js
├── package.json
└── README.md
```

## 🎯 Uso

### Filtrar Trabajos

1. **Por título**: Escribe en el campo "Título" para buscar trabajos específicos
2. **Por país**: Filtra por ubicación del cliente
3. **Por skills**: Busca trabajos que requieran tecnologías específicas

### Refrescar Manualmente

Haz clic en el botón "🔄 Refrescar" para obtener los trabajos más recientes inmediatamente.

### Cambiar Tema

Haz clic en el botón 🌙/☀️ en la esquina superior derecha para alternar entre tema claro y oscuro.

## 🚀 Deployment en Vercel

### Opción 1: Deploy desde GitHub

1. **Sube el proyecto a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/workana-tracker.git
   git push -u origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configura variables de entorno** (opcional)
   - En el panel de Vercel, ve a "Settings" → "Environment Variables"
   - Agrega las siguientes variables si deseas usar Telegram:
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_CHAT_ID`
     - `CACHE_DURATION`
     - `NEXT_PUBLIC_REFRESH_INTERVAL`

4. **Deploy**
   - Haz clic en "Deploy"
   - Espera a que termine el build
   - Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Opción 2: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

## 📡 API Endpoints

### GET /api/jobs

Obtiene la lista de trabajos (usa caché si está disponible).

**Response:**
```json
{
  "success": true,
  "jobs": [...],
  "cached": false,
  "count": 50,
  "timestamp": "2025-12-02T10:00:00.000Z"
}
```

### POST /api/jobs

Fuerza una actualización del caché y hace nuevo scraping.

## 🔔 Configurar Notificaciones de Telegram

### 1. Crear un Bot

1. Habla con [@BotFather](https://t.me/botfather) en Telegram
2. Envía `/newbot`
3. Sigue las instrucciones y guarda el token

### 2. Obtener tu Chat ID

1. Habla con [@userinfobot](https://t.me/userinfobot)
2. El bot te enviará tu Chat ID

### 3. Configurar en el proyecto

Agrega las variables en `.env.local` o en Vercel:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### 4. Probar

El sistema enviará notificaciones cuando detecte nuevos trabajos.

## 🔧 Configuración Avanzada

### Cambiar intervalo de auto-refresh

En `.env.local`:
```env
NEXT_PUBLIC_REFRESH_INTERVAL=180  # 3 minutos
```

### Cambiar duración del caché

En `.env.local`:
```env
CACHE_DURATION=120  # 2 minutos
```

## 🐛 Solución de Problemas

### El scraping no funciona

- Workana puede haber cambiado la estructura HTML
- Verifica los selectores en `lib/scraper.js`
- Revisa los logs del servidor

### No se muestran trabajos

- Verifica que la API responda: visita `/api/jobs` directamente
- Revisa la consola del navegador para errores
- Asegúrate de que las dependencias estén instaladas

### Notificaciones de Telegram no funcionan

- Verifica que el token y chat ID sean correctos
- Asegúrate de haber iniciado una conversación con el bot
- Revisa los logs del servidor

## 📝 Notas de Desarrollo

- El proyecto usa **Next.js 14** con App Router
- El scraping se hace del lado del servidor (API Routes)
- El caché es en memoria (se reinicia con cada deploy)
- Para producción, considera usar Redis o similar para caché persistente

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Si tienes preguntas o sugerencias, abre un issue en GitHub.

---

**Hecho con ❤️ para la comunidad freelance**
