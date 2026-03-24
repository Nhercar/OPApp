<!-- Script para limpiar cache y actualizar PWA -->
<script>
  // Detectar cambios en el service worker y notificar al usuario
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            // Mostrar notificación de actualización
            console.log('📱 Nueva versión disponible. Recarga para actualizar.');
            
            // Opcional: mostrar notificación visual
            if (confirm('Su aplicación ha sido actualizada. ¿Recarga ahora para obtener la última versión?')) {
              window.location.reload();
            }
          }
        });
      });
    });
  }

  // Función global para limpiar cache manualmente (para usar en consola)
  window.clearPWACache = async function() {
    console.log('🗑️ Limpiando caché de PWA...');
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`✅ Eliminado cache: ${cacheName}`);
      }
      console.log('✅ Todos los cachés eliminados');
      console.log('🔄 Recarga la página para descargar la versión más reciente');
    } else {
      console.error('❌ API de Cache no disponible');
    }
  };

  // Función para desinstalar la app
  window.uninstallPWA = async function() {
    console.log('❌ Desinstalando PWA...');
    
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service Worker desregistrado');
      }
    }
    
    await window.clearPWACache();
    console.log('✅ PWA completamente desinstalada');
    window.location.reload();
  };

  // Verificar que el manifest.json es válido
  console.log('🔍 Verificando configuración de PWA...');
  
  fetch('/OPApp/manifest.json')
    .then(r => r.json())
    .then(manifest => {
      console.log('✅ Manifest válido:', {
        name: manifest.name,
        start_url: manifest.start_url,
        scope: manifest.scope,
        display: manifest.display
      });
    })
    .catch(e => console.warn('⚠️ Error al verificar manifest:', e));
</script>
