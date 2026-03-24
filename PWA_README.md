# Inicio Rápido - PWA

Tu aplicación ya está lista como PWA. Para probarla localmente:

## 1. Servidor Local (Necesario para HTTPS en testing)

### Opción A: Python 3
```bash
cd OPApp
python -m http.server 8000
```

### Opción B: Node.js (http-server)
```bash
npm install -g http-server
cd OPApp
http-server -p 8000 --gzip
```

### Opción C: Node.js (live-server)
```bash
npm install -g live-server
cd OPApp
live-server --port=8000
```

Luego abre: **http://localhost:8000**

## 2. Instalar como App

**Chrome/Edge (Desktop):**
- Haz clic en el ícono de instalación en la barra de direcciones
- O: Menú ⋮ → "Instalar aplicación"

**Safari (iPhone/iPad):**
- Abre en Safari
- Toca Compartir (↑)
- Toca "Agregar a pantalla de inicio"

**Chrome (Android):**
- Toca menú ⋮ → "Instalar aplicación"

## 3. Probar Offline

- Abre DevTools (F12)
- Vete a Aplicación → Service Workers
- Marca "Offline"
- ¡Sigue funcionando sin internet!

## 4. Desplegar en Producción

### Con Netlify (Recomendado)
```bash
npm install -g netlify-cli
netlify deploy
```

### Con Vercel
```bash
npm install -g vercel
vercel
```

## Archivos PWA

- `manifest.json` - Configuración
- `service-worker.js` - Cache offline
-`browserconfig.xml` - Windows
- `netlify.toml` - Configuración servidor

👉 **Más info:** Ver [PWA_GUIDE.md](PWA_GUIDE.md)
