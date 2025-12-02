# 📤 Guía para subir Workana Tracker a GitHub

## Opción 1: Crear repositorio desde GitHub.com (Recomendado)

### Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Configura el repositorio:
   - **Repository name:** `workana-tracker`
   - **Description:** `Scraper de trabajos de Workana con Next.js - Ordenados por fecha`
   - **Visibility:** Público o Privado (tu elección)
   - ⚠️ **NO marques:** Initialize with README, .gitignore, o license (ya los tenemos)
3. Haz clic en **"Create repository"**

### Paso 2: Obtener la URL del repositorio

GitHub te mostrará una página con instrucciones. Copia la URL que aparece, algo como:
```
https://github.com/tu-usuario/workana-tracker.git
```

### Paso 3: Subir el código

Abre PowerShell en `C:\workana-tracker` y ejecuta:

```powershell
# Agregar el remote de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/workana-tracker.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código
git push -u origin main
```

Si te pide autenticación:
- **Usuario:** tu usuario de GitHub
- **Contraseña:** usa un **Personal Access Token** (no tu contraseña)
  - Ve a: https://github.com/settings/tokens
  - Genera un token con permisos de `repo`

### Paso 4: Verificar

Ve a tu repositorio en GitHub y verifica que todos los archivos estén subidos.

---

## Opción 2: Usar el script automatizado

```powershell
cd C:\workana-tracker
.\push-to-github.ps1 "https://github.com/TU-USUARIO/workana-tracker.git"
```

---

## 🚀 Deployar en Vercel

Una vez que el código esté en GitHub:

### 1. Ir a Vercel
Ve a https://vercel.com y haz login con tu cuenta de GitHub

### 2. Importar proyecto
- Haz clic en **"Add New..."** → **"Project"**
- Selecciona tu repositorio `workana-tracker`
- Haz clic en **"Import"**

### 3. Configurar (opcional)
Si quieres notificaciones de Telegram:
- Ve a **"Environment Variables"**
- Agrega:
  - `TELEGRAM_BOT_TOKEN` = tu token
  - `TELEGRAM_CHAT_ID` = tu chat ID

### 4. Deploy
- Haz clic en **"Deploy"**
- Espera 1-2 minutos
- ¡Tu app estará en vivo! 🎉

Tu URL será algo como: `https://workana-tracker-xxxxx.vercel.app`

---

## 📋 Checklist

- [ ] Repositorio creado en GitHub
- [ ] Código subido con `git push`
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas (opcional)
- [ ] Deploy exitoso
- [ ] App funcionando en producción

---

## 🔧 Comandos útiles

```powershell
# Ver el estado de Git
git status

# Ver los commits
git log --oneline

# Ver los remotes configurados
git remote -v

# Hacer cambios y subirlos
git add .
git commit -m "Descripción del cambio"
git push
```

---

## ⚠️ Troubleshooting

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/workana-tracker.git
```

### Error de autenticación
1. Ve a https://github.com/settings/tokens
2. Genera un nuevo token con permisos `repo`
3. Usa el token como contraseña cuando Git te lo pida

### Error: "failed to push some refs"
```powershell
# Si el repositorio remoto tiene cambios
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa que la URL del repositorio sea correcta
2. Verifica tu autenticación con GitHub
3. Asegúrate de tener permisos en el repositorio

---

¡Éxito con tu deployment! 🚀
