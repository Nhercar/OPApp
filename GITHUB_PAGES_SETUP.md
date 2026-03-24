# GitHub Pages Configuration Notes

## Problema Original
La PWA no instalaba correctamente en GitHub Pages porque:
- `start_url` estaba configurado como `/` (raíz absoluta)
- `scope` estaba configurado como `/` (raíz absoluta)  
- GitHub Pages sirve repos en: `https://usuario.github.io/nombre-repo/`

## Solución Aplicada
1. ✅ Cambié `start_url` de `/` a `./` (relativo)
2. ✅ Cambié `scope` de `/` a `./` (relativo)
3. ✅ Actualicé todas las rutas en `URLS_TO_CACHE` en service-worker.js de `/` a `./`
4. ✅ Cambié CACHE_NAME a v2 para forzar actualización

## Rutas Importantes
- Manifest: `./manifest.json`
- Archivos: `./index.html`, `./app.js`, etc.
- Los módulos usan importes relativos automáticamente

## Pasos para Desplegar
1. Asegúrate que tu repo en GitHub tiene esta estructura:
```
/
├── index.html
├── app.js
├── manifest.json
├── service-worker.js
├── style.css
├── preguntas.json
├── js/
│   ├── controller/
│   ├── render/
│   └── [otros]
```

2. En Settings → Pages selecciona:
   - Source: Deploy from branch
   - Branch: main (o master)
   - / (root)

3. Espera 1-2 minutos a que GitHub nos compila

4. Tu app estará en: `https://tu-usuario.github.io/tu-repo/`

## Testing
1. Abre https://tu-usuario.github.io/tu-repo/ en Chrome
2. Verifica DevTools → Application → Manifest
3. El `start_url` debe mostrar `./` 
4. Prueba instalar la app
5. Desinstala con: Menú → Administrar aplicación → Desinstalar

## Si Sigue Sin Funcionar
- Limpia caché: DevTools → Application → Clear site data
- Fuerza recarga: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- Revisa la consola para errores de rutas
