if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {
      // The app remains usable online if service worker registration is unavailable.
    });
  });
}
