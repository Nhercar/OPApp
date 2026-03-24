# Hacer tu PyA función - Guía de Instalación y Testing

Tu aplicación ya es una PWA (Progressive Web App). Aquí te explicamos cómo probarla e instalarla en dispositivos.

## ¿Qué es una PWA?

Una PWA es una aplicación web que se comporta como una app nativa con:
- ✅ Instalación en la pantalla principal
- ✅ Funcionamiento offline
- ✅ Icono y splash screen personalizados
- ✅ Carga rápida desde cache
- ✅ Notificaciones push (opcional)

## Archivos PWA Agregados

```
manifest.json          ← Configuración de la app (nombre, icono, colores)
service-worker.js     ← Cachea archivos para funcionar offline
browserconfig.xml     ← Configuración para Windows/Microsoft
index.html            ← Actualizado con meta tags y registro de SW
```

## Testing en el Navegador

### Chrome/Edge (Windows/Mac/Linux)

1. **Abre la app en Chrome:** `http://localhost:8000` (asegúrate de usar HTTPS en producción)

2. **Verifica instalación en DevTools:**
   - F12 → Pestaña "Application" → "Manifest"
   - Deberías ver la información de tu app

3. **Instala la app:**
   - Chrome mostrará un ícono de instalación en la barra de direcciones
   - O: Menú ⋮ → "Instalar aplicación"
   - Aparecerá en tu menú de aplicaciones

4. **Prueba offline:**
   - DevTools → Network → marca "Offline"
   - La app debe seguir funcionando (sin conexión a datos)

### Firefox (Windows/Mac/Linux)

1. **Abre DevTools:** F12 → Manifest
2. **Instala:" about:addons → "Aplicaciones web" → Instalar

### Safari (Mac/iOS)

1. **Mac:** Comparte (⌘⇧↖) → "Agregar al Dock"
2. **iPhone:**
   - Abre en Safari
   - Comparte (↑) → "Agregar a pantalla de inicio"
   - Se agregará como app nativa

### Android (Chrome/Edge)

1. **Abre en Chrome**
2. **Toca el menú ⋮ → "Instalar aplicación"**
3. **Aparecerá en el cajón de apps**

## Comportamiento Offline

El Service Worker cache automáticamente:
- Archivos estáticos (HTML, CSS, JS)
- Archivo preguntas.json
- Respuestas son guardadas en localStorage

**Cuando estés offline:**
- ✅ Puedes responder preguntas (guardadas localmente)
- ✅ Cuando vuelva la conexión, se sincronizarán
- ✅ El cache se actualiza si hay cambios

## Personalización

### Cambiar Colores y Nombre

Edita `manifest.json`:
```json
{
  "name": "Tu Nombre de App",
  "theme_color": "#tu-color",
  "background_color": "#tu-color-fondo",
  "icons": [...]
}
```

### Agregar Icono Real

En lugar de SVG, puedes usar archivos PNG:

```json
"icons": [
  {
    "src": "/img/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "/img/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png"
  }
]
```

Crea carpeta `img/` con:
- `icon-192x192.png` (icono pequeño)
- `icon-512x512.png` (icono grande)

## Despliegue en Producción

Para desplegar tu PWA **necesitas HTTPS** (obligatorio):

### Opción 1: Vercel (Recomendado - Gratis)

```bash
npm install -g vercel
vercel
```

### Opción 2: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

### Opción 3: GitHub Pages

1. Sube a GitHub
2. Ve a Settings → Pages
3. Deploy from branch
4. Vercel/Netlify automáticamente lo servirá por HTTPS

### Opción 4: Tu propio servidor

Necesitas:
- Certificado SSL (Let's Encrypt - gratis)
- Nginx/Apache configurados para servir desde HTTPS
- Headers correctos (ver nginxconfig.io)

## Verificar que es una PWA

Usa estas herramientas para validar:

- **Lighthouse (Chrome):** F12 → Lighthouse → Generar reporte
- **PWA Builder:** https://www.pwabuilder.com
- **WebPageTest:** https://www.webpagetest.org

## Funcionalidades Disponibles

### Implementadas ✅
- Cache de archivos estáticos
- Funcionamiento offline
- Iconos personalizados
- Splash screen

### Opcionales (se pueden agregar)
- ⭕ Background Sync (sincronizar en background)
- ⭕ Push Notifications
- ⭕ Share Target (compartir contenido)
- ⭕ Periodic Sync

## Troubleshooting

### "No se ve el ícono de instalar"
- Asegúrate de estar en HTTPS (en producción)
- El manifest.json debe ser válido (revisa DevTools)
- Carga la página varias veces

### "Offline no funciona"
- Verifica que el Service Worker está registrado (pestaña "Application")
- Revisa la consola para errores
- Limpiar cache: DevTools → Application → Clear storage

### "Los cambios no se reflejan"
- El Service Worker cachea todo
- Cambia el número de versión en `CACHE_NAME` en service-worker.js
- Los usuarios existentes deberán refrescar la página varias veces

## Más Recursos

- **MDN PWA:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **PWA Builder:** https://www.pwabuilder.com
- **Web.dev:** https://web.dev/progressive-web-apps
- **Google Play:** Distribución de PWAs (Play Console)
