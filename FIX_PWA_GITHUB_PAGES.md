# Solución: PWA en GitHub Pages - OPApp

## Problema
La app funcionaba en el navegador pero no se instalaba cuando era PWA en GitHub Pages.

## Causa
Tus archivos estaban configurados con rutas relativas (`./`) o raíz (`/`), pero GitHub Pages sirve el repo en una subruta: `/OPApp/`

## Solución Aplicada

### 1. manifest.json
```json
"start_url": "/OPApp/",
"scope": "/OPApp/",
```
- Antes: `./` (relativo)
- Ahora: `/OPApp/` (absoluto en GitHub Pages)

### 2. service-worker.js
- Cambié todas las rutas a `/OPApp/preguntas.json`, etc.
- Incrementé version a v3 (`CACHE_NAME = 'quiz-app-v3'`)
- Esto fuerza que se actualice el caché

### 3. index.html
- Script de registro mejorado que detecta automáticamente si está en GitHub Pages
- Agrega scope `/OPApp/` explícitamente
- Busca actualizaciones cada hora

### 4. config.js
- `dataUrl` cambió de `"./preguntas.json"` a `"/OPApp/preguntas.json"`

### 5. pwa-update.js (✨ Nuevo)
- Detecta cambios en la PWA automáticamente
- Ofrece actualizar si hay nueva versión
- Funciones de limpieza disponibles en la consola

## Qué Hacer Ahora

### Paso 1: Push los cambios
```bash
git add .
git commit -m "Fix PWA for GitHub Pages with /OPApp/ paths"
git push
```

### Paso 2: Esperar
- GitHub Pages compila y despliega automáticamente (1-2 minutos)
- URL: `https://nhercar.github.io/OPApp/`

### Paso 3: Limpiar cache (Si ya tenías instalada)
Si ya habías instalado la versión anterior:

#### Opción A: Desde el navegador (Fácil)
1. F12 → Application
2. Service Workers → Click en tu app
3. Click en "Unregister"
4. Application → Clear site data → Selecciona todo → Clear
5. Recarga la página

#### Opción B: Desde la consola (Automático)
Si tu app funciona:
```javascript
// Copia en consola (F12)

// Limpiar todo
clearPWACache()

// Luego recarga
window.location.reload()
```

#### Opción C: Desinstalar completamente
```javascript
// Si quieres borrar todo incluyendo el Service Worker
uninstallPWA()
```

### Paso 4: Instalar de nuevo
1. Abre `https://nhercar.github.io/OPApp/`
2. Chrome mostrará ícono de instalar en la barra de direcciones
3. Click → "Instalar aplicación"
4. ¡Listo! Aparecerá en tu pantalla de inicio

## Verificación

Abre la consola del navegador (F12) y deberías ver:
```
✅ Service Worker registrado en: /OPApp/service-worker.js
📍 Scope: /OPApp/
✅ Manifest válido: {...}
```

## Si No Funciona

### Problema: "No aparece ícono de instalar"
1. Limpiar caché completo (ver arriba)
2. Fuerza recarga: Ctrl+Shift+R
3. Espera 30 segundos
4. Recarga nuevamente

### Problema: "Se instala pero se abre en blanco"
1. Abre la consola (F12)
2. Copia: `clearPWACache()` y presiona Enter
3. Recarga la página
4. Desinstala la app desde el menú del navegador
5. Limpia caché del navegador completo
6. Vuelve a instalar

### Problema: "Dice que `preguntas.json` no existe"
1. Verifica que el archivo exista: `https://nhercar.github.io/OPApp/preguntas.json`
2. Si no existe, sube el archivo a GitHub
3. Espera 1-2 minutos a que se sincronice

## Funciona Localmente Pero No en GitHub?

Si compruebas localmente con:
```bash
python -m http.server 8000
```

Accede a `http://localhost:8000` (SIN `/OPApp/`) y todo funciona bien, pero en GitHub Pages no, entonces:

1. Limpia el caché local (ver arriba)
2. En GitHub Pages espera 5 minutos después de hacer push
3. Borra la app instalada localmente del browser
4. Intenta nuevamente

## Archivos Modificados
- ✅ manifest.json (rutas `/OPApp/`)
- ✅ service-worker.js (rutas `/OPApp/`, versión v3)
- ✅ index.html (script mejorado)
- ✅ config.js (`dataUrl` con `/OPApp/`)
- ✨ pwa-update.js (nuevo)
- ✅ GITHUB_PAGES_SETUP.md (actualizado)

## Más Ayuda

Si no funciona:
1. Comparte qué ves en la consola (F12 → Console)
2. Verifica que `https://nhercar.github.io/OPApp/manifest.json` es accesible
3. Intenta abrir en incógnito (limpia caché de incógnita)
