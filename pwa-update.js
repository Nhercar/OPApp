// Detectar cambios en el service worker y notificar al usuario.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) {
        return;
      }

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('Nueva version disponible. Recarga para actualizar.');
          if (confirm('Su aplicacion ha sido actualizada. ¿Recarga ahora para obtener la ultima version?')) {
            window.location.reload();
          }
        }
      });
    });
  });
}

// Funcion global para limpiar cache manualmente (para usar en consola).
window.clearPWACache = async function () {
  console.log('Limpiando cache de PWA...');

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log(`Eliminado cache: ${cacheName}`);
    }
    console.log('Todos los caches eliminados');
    console.log('Recarga la pagina para descargar la version mas reciente');
  } else {
    console.error('API de Cache no disponible');
  }
};

// Funcion para desinstalar la app.
window.uninstallPWA = async function () {
  console.log('Desinstalando PWA...');

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Service Worker desregistrado');
    }
  }

  await window.clearPWACache();
  console.log('PWA completamente desinstalada');
  window.location.reload();
};

// Verificar que el manifest.json es valido.
console.log('Verificando configuracion de PWA...');

const manifestUrl = new URL('./manifest.json', window.location.href);

fetch(manifestUrl.toString())
  .then((response) => response.json())
  .then((manifest) => {
    console.log('Manifest valido:', {
      name: manifest.name,
      start_url: manifest.start_url,
      scope: manifest.scope,
      display: manifest.display
    });
  })
  .catch((error) => console.warn('Error al verificar manifest:', error));
